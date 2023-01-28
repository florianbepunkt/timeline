import {
  binarySearch,
  composeEvents,
  getSumOffset,
  getSumScroll,
  millisecondsInPixel,
  usePrevious,
  useRefState,
} from "../utility";
import { defaultItemRenderer } from "./default-item-renderer";
import { DragEvent, ResizeEvent, PointerEvent } from "@interactjs/types";
import {
  leftResizeStyle,
  overridableStyles,
  rightResizeStyle,
  selectedAndCanMove,
  selectedAndCanResizeLeft,
  selectedAndCanResizeLeftAndDragLeft,
  selectedAndCanResizeRight,
  selectedAndCanResizeRightAndDragRight,
  selectedStyle,
} from "./styles";
import { TimelineContext } from "../timeline";
import interact from "interactjs";
import React from "react";
import type {
  ClickType,
  Id,
  MoveResizeValidator,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemEdge,
} from "../shared-model";
import type { Dimensions, GroupOrder } from "../utility";

export type ItemProps<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase> = {
  canChangeGroup: boolean;
  canMove: boolean;
  canResizeLeft: boolean;
  canResizeRight: boolean;
  canSelect: boolean;
  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasTop: number;
  canvasWidth: number;
  dimensions: Dimensions<TGroup>;
  dragSnap: number;
  groupTops: number[];
  item: TItem;
  itemProps?: object; // Is this used anywhere???
  minResizeWidth: number;
  moveResizeValidator?: MoveResizeValidator<TItem>;
  order: GroupOrder<TGroup>; // Maybe this can be empty... But it seems defined where we use it.
  scrollRef: HTMLDivElement | null;
  selected: boolean; // This had a default value but never would be empty, so I removed the default value completely
  useResizeHandle: boolean;

  itemRenderer?: (props: ItemRendererProps<TItem, TGroup>) => React.ReactElement;
  onContextMenu: (item: Id, event: React.MouseEvent) => void;
  onDrag: (item: Id, dragTime: number, newGroupIndex: number) => void;
  onDrop: (item: Id, dragTime: number, newGroupIndex: number) => void;
  onItemDoubleClick: (item: Id, event: React.MouseEvent) => void;
  onResized: (item: Id, resizeTime: number, edge: TimelineItemEdge, timeDelta: number) => void;
  onResizing: (item: Id, resizeTime: number, edge: TimelineItemEdge) => void;
  onSelect: (item: Id, clickType: ClickType, event: React.MouseEvent | React.TouchEvent) => void;
};

export type ItemContext<TGroup extends TimelineGroupBase> = {
  canMove: boolean;
  canResizeLeft: boolean;
  canResizeRight: boolean;
  dimensions: {
    collisionLeft: number;
    collisionWidth: number;
    height: number;
    left: number;
    order: { group: TGroup; index: number };
    stack: boolean;
    top: number | null;
    width: number;

    /**
     * Free space to the right of the item in pixels, or null if the space is not limited.
     */
    extraSpaceRight: number | null;

    /**
     * Free space to the left of the item in pixels, or null if the space is not limited.
     */
    extraSpaceLeft: number | null;
  };
  dragging: boolean | null;
  dragGroupDelta: number | null;
  dragStart: { x: number; y: number } | null;
  dragTime: number | null;
  resizeEdge: TimelineItemEdge | undefined;
  resizeStart: number | null;
  resizeTime: number | null;
  resizing: boolean | null;
  selected: boolean;
  title: string | undefined;
  useResizeHandle: boolean;
  width: number;
};

export type TimelineItemProps = {
  className: string;
  key: Id;
  onContextMenu: React.ReactEventHandler;
  onDoubleClick: React.MouseEventHandler;
  onMouseDown: React.MouseEventHandler;
  onMouseUp: React.MouseEventHandler;
  onTouchEnd: React.TouchEventHandler;
  onTouchStart: React.TouchEventHandler;
  ref: React.Ref<any>;
  style: React.CSSProperties;
};

export type ItemRendererProps<TItem extends TimelineItemBase, TGroup extends TimelineGroupBase> = {
  item: TItem;
  itemContext: ItemContext<TGroup>;
  timelineContext: TimelineContext;

  getItemProps: (props?: Partial<Omit<TimelineItemProps, "key" | "ref">>) => TimelineItemProps;
  getResizeProps: (styles?: ResizeStyles) => ItemRendererResizeProps;
};

export type ItemRendererResizeProps = Partial<
  Record<
    TimelineItemEdge,
    {
      className: string;
      ref: React.Ref<any>;
      style: React.CSSProperties;
    }
  >
>;

export type ResizeStyles = {
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
  leftClassName?: string;
  rightClassName?: string;
};

export const Item = <TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>(
  props: ItemProps<TGroup, TItem>
): React.ReactElement => {
  const prevProps = usePrevious(props);
  const timelineContext = React.useContext(TimelineContext);
  const { canvasTimeStart, canvasTimeEnd, canvasWidth, dragSnap, item, scrollRef } = props;
  const itemRenderer = props.itemRenderer ?? defaultItemRenderer;

  const [interactMounted, setInteractMounted] = React.useState(false);
  const [dragging, setDragging] = useRefState(false);
  const [dragTime, setDragTime] = React.useState<number | null>(null);
  const [dragGroupDelta, setDragGroupDelta] = useRefState<number | null>(null);
  const [dragStart, setDragStart] = useRefState<{ x: number; y: number; offset: number } | null>(null);

  const [resizing, setResizing] = useRefState(false);
  const [resizeEdge, setResizeEdge] = useRefState<TimelineItemEdge | undefined>(undefined);
  const [resizeStart, setResizeStart] = useRefState<number | null>(null);
  const [resizeTime, setResizeTime] = React.useState<number | null>(null);

  const _startedClicking = React.useRef(false);
  const _startedTouching = React.useRef(false);
  const _item = React.useRef<HTMLDivElement | null>(null);
  const _dragLeft = React.useRef<HTMLDivElement | null>(null);
  const _dragRight = React.useRef<HTMLDivElement | null>(null);

  const getTimeRatio = () => {
    const { canvasTimeStart, canvasTimeEnd, canvasWidth } = props;
    return millisecondsInPixel(canvasTimeStart, canvasTimeEnd, canvasWidth);
  };

  const dragTimeSnap = (dragTime: number, considerOffset?: boolean) => {
    if (dragSnap) {
      const offset = considerOffset ? new Date().getTimezoneOffset() * 60 * 1000 : 0;
      return Math.round(dragTime / dragSnap) * dragSnap - (offset % dragSnap);
    } else {
      return dragTime;
    }
  };

  const resizeTimeSnap = (dragTime: number) => {
    if (dragSnap) {
      const endTime = item.endTime % dragSnap;
      return Math.round((dragTime - endTime) / dragSnap) * dragSnap + endTime;
    } else {
      return dragTime;
    }
  };

  const getDragTime = (e: DragEvent): number => {
    const startTime = new Date(item.startTime);
    if (dragStart.current === null) throw new Error(`Invalid state`);
    return dragging.current
      ? dragTimeSnap(timeFor(e) + dragStart.current.offset, true)
      : startTime.valueOf();
  };

  const timeFor = (e: DragEvent | ResizeEvent) => {
    const ratio = millisecondsInPixel(canvasTimeStart, canvasTimeEnd, canvasWidth);
    const offset = getSumOffset(scrollRef).offsetLeft;
    const scrolls = getSumScroll(scrollRef);
    return (e.pageX - offset + scrolls.scrollLeft) * ratio + canvasTimeStart;
  };

  const getDragGroupDelta = (e: DragEvent) => {
    const { canvasTop, canChangeGroup, groupTops, order } = props;
    if (!(dragging.current && canChangeGroup)) return 0;
    const offset = getSumOffset(scrollRef).offsetTop;
    const scrollTop = getSumScroll(scrollRef).scrollTop;
    const correctedEventY = e.pageY + canvasTop - offset + scrollTop;
    const lastGroupIndex = groupTops.length - 1;
    const eventGroupIndex = binarySearch(groupTops, (groupTop, groupIndex): number =>
      groupIndex < lastGroupIndex
        ? correctedEventY < groupTop
          ? 1
          : correctedEventY < groupTops[groupIndex + 1]
          ? 0
          : -1
        : 0
    );

    return eventGroupIndex < 0 ? 0 : eventGroupIndex - order.index;
  };

  const resizeTimeDelta = (e: ResizeEvent, resizeEdge: TimelineItemEdge | null) => {
    const length = item.endTime - item.startTime;
    if (resizeStart.current === null) throw new Error(`Illegal state`);
    const timeDelta = dragTimeSnap((e.pageX - resizeStart.current) * getTimeRatio());

    if (length + (resizeEdge === "left" ? -timeDelta : timeDelta) < (dragSnap || 1000)) {
      return resizeEdge === "left" ? length - (dragSnap || 1000) : (dragSnap || 1000) - length;
    } else {
      return timeDelta;
    }
  };

  // drag handlers
  const handleDragStart = (e: DragEvent) => {
    if (!props.selected) return false;
    const clickTime = timeFor(e);
    setDragging(true);
    setDragStart({ x: e.pageX, y: e.pageY, offset: item.startTime - clickTime });
    setDragTime(item.startTime);
    setDragGroupDelta(0);
    return;
  };

  const handleDragMove = (e: DragEvent) => {
    if (!dragging.current) return;
    let newDragTime = getDragTime(e);
    const dragGroupDelta = getDragGroupDelta(e);
    if (props.moveResizeValidator) newDragTime = props.moveResizeValidator("move", item, newDragTime);
    if (props.onDrag) props.onDrag(item.id, newDragTime, props.order.index + dragGroupDelta);
    setDragTime(newDragTime);
    setDragGroupDelta(dragGroupDelta);
  };

  const handleDragEnd = (e: DragEvent) => {
    if (!dragging.current) return;
    if (props.onDrop) {
      let dragTime = getDragTime(e);
      if (props.moveResizeValidator) dragTime = props.moveResizeValidator("move", item, dragTime);
      props.onDrop(item.id, dragTime, props.order.index + getDragGroupDelta(e));
    }
    setDragging(false);
    setDragStart(null);
    setDragTime(null);
    setDragGroupDelta(null);
  };

  // resize handlers
  const handleResizeStart = (e: ResizeEvent) => {
    if (!props.selected) return false;
    setResizing(true);
    setResizeEdge(undefined);
    setResizeStart(e.pageX);
    setResizeTime(0);
  };

  const handleResizeMove = (e: ResizeEvent) => {
    if (!resizing.current) return;
    let currentResizeEdge = resizeEdge.current;
    if (!currentResizeEdge) {
      const fallback = e.deltaRect?.left !== 0 ? "left" : "right";
      setResizeEdge(fallback);
      currentResizeEdge = fallback;
    }

    let resizeTime = resizeTimeSnap(timeFor(e));
    if (props.moveResizeValidator) {
      resizeTime = props.moveResizeValidator("resize", item, resizeTime, currentResizeEdge);
    }

    if (props.onResizing) props.onResizing(item.id, resizeTime, currentResizeEdge!);
    setResizeTime(resizeTime);
  };

  const handleResizeEnd = (e: ResizeEvent) => {
    if (!resizing.current) return;
    let resizeTime = resizeTimeSnap(timeFor(e));
    if (props.moveResizeValidator) {
      if (!resizeEdge.current) throw new Error(`Illegal state`);
      resizeTime = props.moveResizeValidator("resize", item, resizeTime, resizeEdge.current);
    }

    if (props.onResized) {
      if (!resizeEdge.current) throw new Error(`Illegal state`);
      props.onResized(item.id, resizeTime, resizeEdge.current!, resizeTimeDelta(e, resizeEdge.current!));
    }

    setResizing(false);
    setResizeStart(null);
    setResizeEdge(undefined);
    setResizeTime(null);
  };

  const mountInteract = () => {
    const leftResize = props.useResizeHandle ? ".rct-item-handler-resize-left" : true;
    const rightResize = props.useResizeHandle ? ".rct-item-handler-resize-right" : true;
    if (_item.current === null) throw new Error(`Item reference should be never emtpy.`);

    interact(_item.current)
      .resizable({
        edges: {
          left: canResizeLeft() && leftResize,
          right: canResizeRight() && rightResize,
          top: false,
          bottom: false,
        },
        enabled: props.selected && (canResizeLeft() || canResizeRight()),
      })
      .draggable({ enabled: props.selected && canMove() })
      .styleCursor(false)
      .on("dragstart", handleDragStart)
      .on("dragmove", handleDragMove)
      .on("dragend", handleDragEnd)
      .on("resizestart", handleResizeStart)
      .on("resizemove", handleResizeMove)
      .on("resizeend", handleResizeEnd)
      .on("tap", (e: PointerEvent & React.MouseEvent) => {
        actualClick(e, e.pointerType === "mouse" ? "click" : "touch");
      });

    setInteractMounted(true);
  };

  const canResizeLeft = (p: ItemProps<TGroup, TItem> = props) => {
    if (!p.canResizeLeft) return false;
    const width = parseInt(`${p.dimensions.width}`);
    return width >= p.minResizeWidth;
  };

  const canResizeRight = (p: ItemProps<TGroup, TItem> = props) => {
    if (!p.canResizeRight) return false;
    const width = parseInt(`${p.dimensions.width}`);
    return width >= p.minResizeWidth;
  };

  const canMove = (p: ItemProps<TGroup, TItem> = props) => !!p.canMove;

  // event handlers
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!interactMounted) {
      e.preventDefault();
      _startedClicking.current = true;
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!interactMounted && _startedClicking.current) {
      _startedClicking.current = false;
      actualClick(e, "click");
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!interactMounted) {
      e.preventDefault();
      _startedTouching.current = true;
    }
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!interactMounted && _startedTouching.current) {
      _startedTouching.current = false;
      actualClick(e, "touch");
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (props.onItemDoubleClick) props.onItemDoubleClick(item.id, e);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!props.onContextMenu) return;
    e.preventDefault();
    e.stopPropagation();
    props.onContextMenu(props.item.id, e);
  };

  const actualClick = (e: React.MouseEvent | React.TouchEvent, clickType: "touch" | "click") => {
    if (props.canSelect && props.onSelect) props.onSelect(item.id, clickType, e);
  };

  const getItemProps = (props: Partial<Omit<TimelineItemProps, "key" | "ref">> = {}) => {
    const classNames = "rct-item" + (item.className ? ` ${item.className}` : "");
    const result: TimelineItemProps & { title: string | undefined } = {
      className: classNames + ` ${props.className ? props.className : ""}`,
      key: item.id,
      onContextMenu: composeEvents(handleContextMenu, props.onContextMenu),
      onDoubleClick: composeEvents(handleDoubleClick, props.onDoubleClick),
      onMouseDown: composeEvents(onMouseDown, props.onMouseDown),
      onMouseUp: composeEvents(onMouseUp, props.onMouseUp),
      onTouchEnd: composeEvents(onTouchEnd, props.onTouchEnd),
      onTouchStart: composeEvents(onTouchStart, props.onTouchStart),
      ref: _item,
      style: Object.assign({}, getItemStyle(props)),
      title: item.title,
    };
    return result;
  };

  const getResizeProps = (props: ResizeStyles = {}) => {
    let leftName = "rct-item-handler rct-item-handler-left rct-item-handler-resize-left";
    if (props.leftClassName) leftName += ` ${props.leftClassName}`;

    let rightName = "rct-item-handler rct-item-handler-right rct-item-handler-resize-right";
    if (props.rightClassName) rightName += ` ${props.rightClassName}`;

    return {
      left: {
        className: leftName,
        ref: _dragLeft,
        style: Object.assign({}, leftResizeStyle, props.leftStyle),
      },
      right: {
        className: rightName,
        ref: _dragRight,
        style: Object.assign({}, rightResizeStyle, props.rightStyle),
      },
    };
  };

  const getItemStyle = (p: React.HTMLAttributes<HTMLDivElement>) => {
    const { dimensions } = props;
    const baseStyles = {
      position: "absolute",
      boxSizing: "border-box",
      left: `${dimensions.left}px`,
      top: `${dimensions.top}px`,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      lineHeight: `${dimensions.height}px`,
    };

    return Object.assign(
      {},
      overridableStyles,
      props.selected ? selectedStyle : {},
      props.selected && canMove(props) ? selectedAndCanMove : {},
      props.selected && canResizeLeft(props) ? selectedAndCanResizeLeft : {},
      props.selected && canResizeLeft(props) && dragging.current
        ? selectedAndCanResizeLeftAndDragLeft
        : {},
      props.selected && canResizeRight(props) ? selectedAndCanResizeRight : {},
      props.selected && canResizeRight(props) && dragging.current
        ? selectedAndCanResizeRightAndDragRight
        : {},
      p.style,
      baseStyles
    );
  };

  React.useEffect(() => {
    let mounted = interactMounted;

    const couldDrag = prevProps?.selected && canMove(prevProps);
    const couldResizeLeft = prevProps?.selected && canResizeLeft(prevProps);
    const couldResizeRight = prevProps?.selected && canResizeRight(prevProps);
    const willBeAbleToDrag = props.selected && canMove(props);
    const willBeAbleToResizeLeft = props.selected && canResizeLeft(props);
    const willBeAbleToResizeRight = props.selected && canResizeRight(props);

    if (!!_item.current) {
      if (props.selected && !mounted) {
        mountInteract();
        mounted = true;
      }

      if (
        mounted &&
        (couldResizeLeft !== willBeAbleToResizeLeft || couldResizeRight !== willBeAbleToResizeRight)
      ) {
        const leftResize = props.useResizeHandle ? _dragLeft.current : true;
        const rightResize = props.useResizeHandle ? _dragRight.current : true;

        if (leftResize !== null && rightResize !== null) {
          interact(_item.current).resizable({
            enabled: willBeAbleToResizeLeft || willBeAbleToResizeRight,
            edges: {
              bottom: false,
              left: willBeAbleToResizeLeft && leftResize,
              right: willBeAbleToResizeRight && rightResize,
              top: false,
            },
          });
        }
      }

      if (mounted && couldDrag !== willBeAbleToDrag) {
        interact(_item.current).draggable({ enabled: willBeAbleToDrag });
      }
    } else {
      mounted = false;
    }

    if (interactMounted !== mounted) {
      setInteractMounted(mounted);
    }
  });

  const itemContext: ItemContext<TGroup> = {
    canMove: canMove(props),
    canResizeLeft: canResizeLeft(props),
    canResizeRight: canResizeRight(props),
    dimensions: props.dimensions,
    dragging: dragging.current,
    dragGroupDelta: dragGroupDelta.current,
    dragStart: dragStart.current,
    dragTime: dragTime,
    resizeEdge: resizeEdge.current,
    resizeStart: resizeStart.current,
    resizeTime: resizeTime,
    resizing: resizing.current,
    selected: props.selected,
    title: item.title,
    useResizeHandle: props.useResizeHandle,
    width: props.dimensions.width,
  };

  return itemRenderer({
    getItemProps,
    getResizeProps,
    item,
    itemContext,
    timelineContext,
  });
};
