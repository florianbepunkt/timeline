import { binarySearch } from "../utility/search";
import { Component } from "react";
import { composeEvents } from "../utility/events";
import { dateDriver } from "../utility";
import { defaultItemRenderer } from "./defaultItemRenderer";
import { DragEvent, ResizeEvent, PointerEvent } from "@interactjs/types";
import { getSumScroll, getSumOffset } from "../utility/dom-helpers";
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
import { millisecondsInPixel } from "../utility/calendar";
import interact from "interactjs";
import isEqual from "lodash.isequal";
import React from "react";
import type {
  ClickType,
  Id,
  ItemContext,
  MoveResizeValidator,
  ReactCalendarItemRendererProps,
  ResizeStyles,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemEdge,
  TimelineItemProps,
} from "../types";
import { TimelineContext } from "../timeline/timeline-context";
import type { Dimensions, GroupOrder } from "../utility/calendar";

type ItemProps<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase> = {
  canvasTimeStart: number;
  canvasTimeEnd: number;
  canvasWidth: number;
  canvasTop: number;
  order: GroupOrder<TGroup>; // Maybe this can be empty... But it seems defined where we use it.
  dragSnap: number;
  minResizeWidth: number;
  selected: boolean; // This had a default value but never would be empty, so I removed the default value completely
  canChangeGroup: boolean;
  canMove: boolean;
  canResizeLeft: boolean;
  canResizeRight: boolean;
  item: TItem;
  onSelect: (item: Id, clickType: ClickType, event: React.MouseEvent | React.TouchEvent) => void;
  onDrag: (item: Id, dragTime: number, newGroupIndex: number) => void;
  onDrop: (item: Id, dragTime: number, newGroupIndex: number) => void;
  onResizing: (item: Id, resizeTime: number, edge: TimelineItemEdge) => void;
  onResized: (item: Id, resizeTime: number, edge: TimelineItemEdge, timeDelta: number) => void;
  onContextMenu: (item: Id, event: React.MouseEvent) => void;
  itemRenderer?: (props: ReactCalendarItemRendererProps<TItem, TGroup>) => React.ReactNode;
  itemProps?: object; // Is this used anywhere???
  canSelect: boolean;
  dimensions: Dimensions<TGroup>;
  groupTops: number[];
  useResizeHandle: boolean;
  moveResizeValidator?: MoveResizeValidator<TItem>;
  onItemDoubleClick: (item: Id, event: React.MouseEvent) => void;
  scrollRef: HTMLDivElement | null;
};

type ItemState = {
  interactMounted: boolean;

  // Wheter a dragging is active
  dragging: boolean | null; // TODO: this could be false instead of null
  dragStart: {
    x: number;
    y: number;
    offset: number; // This was a hidden value...
  } | null;
  preDragPosition: { x: number; y: number } | null;
  dragTime: number | null;
  dragGroupDelta: number | null;

  // Wheter a resizing is active
  resizing: boolean | null; // TODO: this could be false instead of null
  resizeEdge: TimelineItemEdge | null;
  resizeStart: number | null;
  resizeTime: number | null;
};

export default class Item<
  TGroup extends TimelineGroupBase,
  TItem extends TimelineItemBase
> extends Component<ItemProps<TGroup, TItem>, ItemState> {
  static contextType = TimelineContext;

  // TODO: storybook webpack freaks out... should be resolved once this component is refactored as function, using context hooks
  // declare context: React.ContextType<typeof TimelineContext>;

  constructor(props: ItemProps<TGroup, TItem>) {
    super(props);

    this.state = {
      interactMounted: false,
      dragging: null,
      dragStart: null,
      preDragPosition: null,
      dragTime: null,
      dragGroupDelta: null,
      resizing: null,
      resizeEdge: null,
      resizeStart: null,
      resizeTime: null,
    };
  }

  shouldComponentUpdate(nextProps: Readonly<ItemProps<TGroup, TItem>>, nextState: Readonly<ItemState>) {
    const shouldUpdate =
      nextState.dragging !== this.state.dragging ||
      nextState.dragTime !== this.state.dragTime ||
      nextState.dragGroupDelta !== this.state.dragGroupDelta ||
      nextState.resizing !== this.state.resizing ||
      nextState.resizeTime !== this.state.resizeTime ||
      !isEqual(nextProps.itemProps, this.props.itemProps) ||
      nextProps.selected !== this.props.selected ||
      nextProps.item !== this.props.item ||
      nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
      nextProps.canvasTimeEnd !== this.props.canvasTimeEnd ||
      nextProps.canvasWidth !== this.props.canvasWidth ||
      (nextProps.order ? nextProps.order.index : undefined) !==
        (this.props.order ? this.props.order.index : undefined) ||
      nextProps.dragSnap !== this.props.dragSnap ||
      nextProps.minResizeWidth !== this.props.minResizeWidth ||
      nextProps.canChangeGroup !== this.props.canChangeGroup ||
      nextProps.canSelect !== this.props.canSelect ||
      nextProps.canMove !== this.props.canMove ||
      nextProps.canResizeLeft !== this.props.canResizeLeft ||
      nextProps.canResizeRight !== this.props.canResizeRight ||
      nextProps.dimensions !== this.props.dimensions;
    return shouldUpdate;
  }

  getTimeRatio() {
    const { canvasTimeStart, canvasTimeEnd, canvasWidth } = this.props;
    return millisecondsInPixel(canvasTimeStart, canvasTimeEnd, canvasWidth);
  }

  // TODO: Please make the optional `considerOffset` parameter required!
  dragTimeSnap(dragTime: number, considerOffset?: boolean) {
    const { dragSnap } = this.props;

    if (dragSnap) {
      const offset = considerOffset ? dateDriver().utcOffset() * 60 * 1000 : 0;
      return Math.round(dragTime / dragSnap) * dragSnap - (offset % dragSnap);
    } else {
      return dragTime;
    }
  }

  resizeTimeSnap(dragTime: number) {
    const { dragSnap } = this.props;
    if (dragSnap) {
      const endTime = this.props.item.endTime % dragSnap;
      return Math.round((dragTime - endTime) / dragSnap) * dragSnap + endTime;
    } else {
      return dragTime;
    }
  }

  dragTime(e: DragEvent): number {
    const startTime = dateDriver(this.props.item.startTime);

    if (this.state.dragStart === null) {
      throw new Error(
        `This should never happen: the "dragStart" value is "null" when we try to calculate the drag time`
      );
    }

    if (this.state.dragging) {
      return this.dragTimeSnap(this.timeFor(e) + this.state.dragStart.offset, true);
    } else {
      return startTime.valueOf(); // This was originally just a `startTime` return, but I think we need number here.
    }
  }

  timeFor(e: DragEvent | ResizeEvent) {
    const ratio = millisecondsInPixel(
      this.props.canvasTimeStart,
      this.props.canvasTimeEnd,
      this.props.canvasWidth
    );

    const offset = getSumOffset(this.props.scrollRef).offsetLeft;
    const scrolls = getSumScroll(this.props.scrollRef);

    return (e.pageX - offset + scrolls.scrollLeft) * ratio + this.props.canvasTimeStart;
  }

  dragGroupDelta(e: DragEvent) {
    const { canvasTop, canChangeGroup, groupTops, order } = this.props;

    if (!(this.state.dragging && canChangeGroup)) return 0;

    const offset = getSumOffset(this.props.scrollRef).offsetTop;
    const scrollTop = getSumScroll(this.props.scrollRef).scrollTop;
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
  }

  resizeTimeDelta(e: ResizeEvent, resizeEdge: TimelineItemEdge | null) {
    const length = this.props.item.endTime - this.props.item.startTime;

    if (this.state.resizeStart === null) {
      throw new Error(
        `This should never happen: the "resizeStart" is null when we try to calculate resize time delta`
      );
    }

    const timeDelta = this.dragTimeSnap((e.pageX - this.state.resizeStart) * this.getTimeRatio());

    if (length + (resizeEdge === "left" ? -timeDelta : timeDelta) < (this.props.dragSnap || 1000)) {
      if (resizeEdge === "left") {
        return length - (this.props.dragSnap || 1000);
      } else {
        return (this.props.dragSnap || 1000) - length;
      }
    } else {
      return timeDelta;
    }
  }

  mountInteract() {
    const leftResize = this.props.useResizeHandle ? ".rct-item-handler-resize-left" : true;
    const rightResize = this.props.useResizeHandle ? ".rct-item-handler-resize-right" : true;

    if (this._item === null) {
      throw new Error(`Item reference should be never emtpy.`);
    }

    interact(this._item)
      .resizable({
        edges: {
          left: this.canResizeLeft() && leftResize,
          right: this.canResizeRight() && rightResize,
          top: false,
          bottom: false,
        },
        enabled: this.props.selected && (this.canResizeLeft() || this.canResizeRight()),
      })
      .draggable({
        enabled: this.props.selected && this.canMove(),
      })
      .styleCursor(false)
      .on("dragstart", (e: DragEvent) => {
        if (this.props.selected) {
          const clickTime = this.timeFor(e);
          const hackedTarget = e.target as { offsetLeft: number; offsetTop: number }; // TODO: remove this ugly type hack
          this.setState({
            dragging: true,
            dragStart: {
              x: e.pageX,
              y: e.pageY,
              offset: this.props.item.startTime - clickTime,
            },
            preDragPosition: { x: hackedTarget.offsetLeft, y: hackedTarget.offsetTop },
            dragTime: this.props.item.startTime,
            dragGroupDelta: 0,
          });
          return;
        } else {
          return false;
        }
      })
      .on("dragmove", (e: DragEvent) => {
        if (this.state.dragging) {
          let dragTime = this.dragTime(e);
          const dragGroupDelta = this.dragGroupDelta(e);
          if (this.props.moveResizeValidator) {
            dragTime = this.props.moveResizeValidator("move", this.props.item, dragTime);
          }

          if (this.props.onDrag) {
            this.props.onDrag(this.props.item.id, dragTime, this.props.order.index + dragGroupDelta);
          }

          this.setState({
            dragTime: dragTime,
            dragGroupDelta: dragGroupDelta,
          });
        }
      })
      .on("dragend", (e: DragEvent) => {
        if (this.state.dragging) {
          if (this.props.onDrop) {
            let dragTime = this.dragTime(e);

            if (this.props.moveResizeValidator) {
              dragTime = this.props.moveResizeValidator("move", this.props.item, dragTime);
            }

            this.props.onDrop(
              this.props.item.id,
              dragTime,
              this.props.order.index + this.dragGroupDelta(e)
            );
          }

          this.setState({
            dragging: false,
            dragStart: null,
            preDragPosition: null,
            dragTime: null,
            dragGroupDelta: null,
          });
        }
      })
      .on("resizestart", (e: ResizeEvent) => {
        if (this.props.selected) {
          this.setState({
            resizing: true,
            resizeEdge: null, // we don't know yet
            resizeStart: e.pageX,
            resizeTime: 0,
          });
          return;
        } else {
          return false;
        }
      })
      .on("resizemove", (e: ResizeEvent) => {
        if (this.state.resizing) {
          let resizeEdge = this.state.resizeEdge;

          if (!resizeEdge) {
            resizeEdge = e.deltaRect?.left !== 0 ? "left" : "right";
            this.setState({ resizeEdge });
          }
          let resizeTime = this.resizeTimeSnap(this.timeFor(e));

          if (this.props.moveResizeValidator) {
            resizeTime = this.props.moveResizeValidator(
              "resize",
              this.props.item,
              resizeTime,
              resizeEdge
            );
          }

          if (this.props.onResizing) {
            this.props.onResizing(this.props.item.id, resizeTime, resizeEdge);
          }

          this.setState({
            resizeTime,
          });
        }
      })
      .on("resizeend", (e: ResizeEvent) => {
        if (this.state.resizing) {
          const { resizeEdge } = this.state;
          let resizeTime = this.resizeTimeSnap(this.timeFor(e));

          if (this.props.moveResizeValidator) {
            if (resizeEdge === null) {
              throw new Error(`This should never happen: resize edge is null when resize ended`);
            }
            resizeTime = this.props.moveResizeValidator(
              "resize",
              this.props.item,
              resizeTime,
              resizeEdge
            );
          }

          if (this.props.onResized) {
            if (resizeEdge === null) {
              throw new Error(`This should never happen: resize edge is null when resize ended`);
            }
            this.props.onResized(
              this.props.item.id,
              resizeTime,
              resizeEdge,
              this.resizeTimeDelta(e, resizeEdge)
            );
          }
          this.setState({
            resizing: null,
            resizeStart: null,
            resizeEdge: null,
            resizeTime: null,
          });
        }
      })
      // TODO: Dangerous type hack, should be removed
      .on("tap", (e: PointerEvent & React.MouseEvent) => {
        this.actualClick(e, e.pointerType === "mouse" ? "click" : "touch");
      });

    this.setState({
      interactMounted: true,
    });
  }

  canResizeLeft(props = this.props) {
    if (!props.canResizeLeft) {
      return false;
    }
    const width = parseInt(`${props.dimensions.width}`, 10); // TODO: Really?!
    return width >= props.minResizeWidth;
  }

  canResizeRight(props = this.props) {
    if (!props.canResizeRight) {
      return false;
    }
    const width = parseInt(`${props.dimensions.width}`, 10); // TODO: Really?!
    return width >= props.minResizeWidth;
  }

  canMove(props = this.props) {
    return !!props.canMove;
  }

  componentDidUpdate(prevProps: Readonly<ItemProps<TGroup, TItem>>) {
    let { interactMounted } = this.state;
    const couldDrag = prevProps.selected && this.canMove(prevProps);
    const couldResizeLeft = prevProps.selected && this.canResizeLeft(prevProps);
    const couldResizeRight = prevProps.selected && this.canResizeRight(prevProps);
    const willBeAbleToDrag = this.props.selected && this.canMove(this.props);
    const willBeAbleToResizeLeft = this.props.selected && this.canResizeLeft(this.props);
    const willBeAbleToResizeRight = this.props.selected && this.canResizeRight(this.props);

    if (!!this._item) {
      if (this.props.selected && !interactMounted) {
        this.mountInteract();
        interactMounted = true;
      }
      if (
        interactMounted &&
        (couldResizeLeft !== willBeAbleToResizeLeft || couldResizeRight !== willBeAbleToResizeRight)
      ) {
        const leftResize = this.props.useResizeHandle ? this._dragLeft : true;
        const rightResize = this.props.useResizeHandle ? this._dragRight : true;

        if (leftResize !== null && rightResize !== null) {
          interact(this._item).resizable({
            enabled: willBeAbleToResizeLeft || willBeAbleToResizeRight,
            edges: {
              top: false,
              bottom: false,
              left: willBeAbleToResizeLeft && leftResize,
              right: willBeAbleToResizeRight && rightResize,
            },
          });
        } else {
          // This should never happen
        }
      }
      if (interactMounted && couldDrag !== willBeAbleToDrag) {
        interact(this._item).draggable({ enabled: willBeAbleToDrag });
      }
    } else {
      interactMounted = false;
    }

    this.setState({ interactMounted });
  }

  private _startedClicking = false;
  private _startedTouching = false;

  onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!this.state.interactMounted) {
      e.preventDefault();
      this._startedClicking = true;
    }
  };

  onMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!this.state.interactMounted && this._startedClicking) {
      this._startedClicking = false;
      this.actualClick(e, "click");
    }
  };

  onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!this.state.interactMounted) {
      e.preventDefault();
      this._startedTouching = true;
    }
  };

  onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!this.state.interactMounted && this._startedTouching) {
      this._startedTouching = false;
      this.actualClick(e, "touch");
    }
  };

  handleDoubleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (this.props.onItemDoubleClick) {
      this.props.onItemDoubleClick(this.props.item.id, e);
    }
  };

  handleContextMenu = (e: React.MouseEvent) => {
    if (this.props.onContextMenu) {
      e.preventDefault();
      e.stopPropagation();
      this.props.onContextMenu(this.props.item.id, e);
    }
  };

  actualClick(e: React.MouseEvent | React.TouchEvent, clickType: "touch" | "click") {
    if (this.props.canSelect && this.props.onSelect) {
      this.props.onSelect(this.props.item.id, clickType, e);
    }
  }

  private _item: HTMLDivElement | null = null;
  private _dragLeft: HTMLDivElement | null = null;
  private _dragRight: HTMLDivElement | null = null;

  getItemRef = (el: HTMLDivElement | null) => (this._item = el);
  getDragLeftRef = (el: HTMLDivElement | null) => (this._dragLeft = el);
  getDragRightRef = (el: HTMLDivElement | null) => (this._dragRight = el);

  getItemProps = (props: Partial<Omit<TimelineItemProps, "key" | "ref">> = {}) => {
    //TODO: maybe shouldnt include all of these classes
    const classNames = "rct-item" + (this.props.item.className ? ` ${this.props.item.className}` : "");

    const result: TimelineItemProps & { title: string | undefined } = {
      key: this.props.item.id,
      ref: this.getItemRef,
      title: this.props.item.title,
      className: classNames + ` ${props.className ? props.className : ""}`,
      onMouseDown: composeEvents(this.onMouseDown, props.onMouseDown),
      onMouseUp: composeEvents(this.onMouseUp, props.onMouseUp),
      onTouchStart: composeEvents(this.onTouchStart, props.onTouchStart),
      onTouchEnd: composeEvents(this.onTouchEnd, props.onTouchEnd),
      onDoubleClick: composeEvents(this.handleDoubleClick, props.onDoubleClick),
      onContextMenu: composeEvents(this.handleContextMenu, props.onContextMenu),
      style: Object.assign({}, this.getItemStyle(props)),
    };
    return result;
  };

  getResizeProps = (props: ResizeStyles = {}) => {
    let leftName = "rct-item-handler rct-item-handler-left rct-item-handler-resize-left";
    if (props.leftClassName) {
      leftName += ` ${props.leftClassName}`;
    }

    let rightName = "rct-item-handler rct-item-handler-right rct-item-handler-resize-right";
    if (props.rightClassName) {
      rightName += ` ${props.rightClassName}`;
    }
    return {
      left: {
        ref: this.getDragLeftRef,
        className: leftName,
        style: Object.assign({}, leftResizeStyle, props.leftStyle),
      },
      right: {
        ref: this.getDragRightRef,
        className: rightName,
        style: Object.assign({}, rightResizeStyle, props.rightStyle),
      },
    };
  };

  getItemStyle(props: React.HTMLAttributes<HTMLDivElement>) {
    const dimensions = this.props.dimensions;

    const baseStyles = {
      position: "absolute",
      boxSizing: "border-box",
      left: `${dimensions.left}px`,
      top: `${dimensions.top}px`,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      lineHeight: `${dimensions.height}px`,
    };

    const finalStyle = Object.assign(
      {},
      overridableStyles,
      this.props.selected ? selectedStyle : {},
      this.props.selected && this.canMove(this.props) ? selectedAndCanMove : {},
      this.props.selected && this.canResizeLeft(this.props) ? selectedAndCanResizeLeft : {},
      this.props.selected && this.canResizeLeft(this.props) && this.state.dragging
        ? selectedAndCanResizeLeftAndDragLeft
        : {},
      this.props.selected && this.canResizeRight(this.props) ? selectedAndCanResizeRight : {},
      this.props.selected && this.canResizeRight(this.props) && this.state.dragging
        ? selectedAndCanResizeRightAndDragRight
        : {},
      props.style,
      baseStyles
    );
    return finalStyle;
  }

  render() {
    if (typeof this.props.order === "undefined" || this.props.order === null) {
      return null;
    }

    const timelineContext = this.context as TimelineContext;
    const itemContext: ItemContext<TGroup> = {
      dimensions: this.props.dimensions,
      useResizeHandle: this.props.useResizeHandle,
      title: this.props.item.title,
      canMove: this.canMove(this.props),
      canResizeLeft: this.canResizeLeft(this.props),
      canResizeRight: this.canResizeRight(this.props),
      selected: this.props.selected,
      dragging: this.state.dragging,
      dragStart: this.state.dragStart,
      dragTime: this.state.dragTime,
      dragGroupDelta: this.state.dragGroupDelta,
      resizing: this.state.resizing,
      resizeEdge: this.state.resizeEdge,
      resizeStart: this.state.resizeStart,
      resizeTime: this.state.resizeTime,
      width: this.props.dimensions.width,
    }; // I am too tired for this...

    const itemRenderer = this.props.itemRenderer ?? defaultItemRenderer;
    return itemRenderer({
      item: this.props.item,
      timelineContext,
      itemContext,
      getItemProps: this.getItemProps,
      getResizeProps: this.getResizeProps,
    });
  }
}
