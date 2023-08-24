import {
  calculateScrollCanvas,
  calculateTimeForXPosition,
  Dimensions,
  getCanvasBoundariesFromVisibleTime,
  getCanvasWidth,
  getMinUnit,
  ItemDimensions,
  stackTimelineItems,
} from "../utility/calendar/index.js";
import {
  calculateVisibleGroups,
  getNewVerticalCanvasDimensions,
  needNewVerticalCanvas,
} from "./virtualization.js";
import { Columns } from "../columns/index.js";
import { DateHeader, TimelineHeaders, HeadersProvider } from "../headers/index.js";
import { defaultTimeSteps } from "../default-config.js";
import { GroupRows } from "../row/index.js";
import { isEqual } from "lodash-es";
import { Items } from "../items/index.js";
import { LocalizationContext } from "./localization.js";
import { MarkerCanvas, MarkersProvider } from "../markers/index.js";
import { ScrollElement } from "../scroll/index.js";
import { Sidebar } from "../sidebar/index.js";
import { TimelineProvider } from "./timeline-context.js";
import React from "react";
import type {
  ClickType,
  CompleteTimeSteps,
  Id,
  TimeSteps,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemEdge,
  TimeUnit,
  TimelineState,
} from "../shared-model.js";
import type { TimelineProps } from "./props.js";
import { usePrevious } from "../utility/use-previous.js";
import useResizeObserver from "@react-hook/resize-observer";

type ReactNodeWithPossibleTypeAndSecretKey = React.ReactNode & { type?: { secretKey?: unknown } };
type ReactElementWithPossibleTypeAndSecretKey = React.ReactElement & { type?: { secretKey?: unknown } };
const defaultCalculateExtraSpace = false;
const defaultCanChangeGroup = true;
const defaultCanMove = true;
const defaultCanResize = "right";
const defaultCanSelect = true;
const defaultClassName = "";
const defaultClickTolerance = 3; // how many pixels can we drag for it to be still considered a click?
const defaultContainerStyle: React.CSSProperties = { height: "100%", overflowY: "auto" };
const defaultDragSnap = 1000 * 60 * 15; // 15min
const defaultItemHeight = 28;
const defaultItemTouchSendsClick = false;
const defaultLineHeight = 36;
const defaultMaxZoom = 5 * 365.24 * 86400 * 1000; // 5 years
const defaultMinResizeWidth = 20;
const defaultMinZoom = 60 * 60 * 1000; // 1 hour
const defaultRightSidebarWidth = 0;
const defaultSidebarWidth = 150;
const defaultStackItems = false;
const defaultStyle: React.CSSProperties = {};
const defaultUseResizeHandle = false;
const defaultWidthState = 1000;

export const Timeline = <
  CustomItem extends TimelineItemBase = TimelineItemBase,
  CustomGroup extends TimelineGroupBase = TimelineGroupBase
>(
  props: TimelineProps<CustomItem, CustomGroup>
) => {
  const getInitialVisibleCanvas = () => {
    let visibleTimeStart: null | number = null;
    let visibleTimeEnd: null | number = null;

    if (props.defaultTimeStart && props.defaultTimeEnd) {
      visibleTimeStart = props.defaultTimeStart.valueOf();
      visibleTimeEnd = props.defaultTimeEnd.valueOf();
    } else if (props.visibleTimeStart && props.visibleTimeEnd) {
      visibleTimeStart = props.visibleTimeStart;
      visibleTimeEnd = props.visibleTimeEnd;
    } else {
      //throwing an error because neither default or visible time props provided
      throw new Error(
        'You must provide either "defaultTimeStart" and "defaultTimeEnd" or "visibleTimeStart" and "visibleTimeEnd" to initialize the Timeline'
      );
    }

    if (visibleTimeStart > visibleTimeEnd) {
      throw new Error(
        `You must obey the laws of time – visibleTimeStart ${visibleTimeStart} is after visibleTimeEnd ${visibleTimeEnd}`
      );
    }

    return { visibleTimeStart, visibleTimeEnd };
  };

  const container = React.useRef<HTMLDivElement | null>(null);
  const containerHeight = React.useRef<number>(0);
  const containerWidth = React.useRef<number>(0);

  const [visibleCanvas, setVisibleCanvas] = React.useState(getInitialVisibleCanvas);
  const { visibleTimeStart, visibleTimeEnd } = visibleCanvas;
  const [canvas, setCanvas] = React.useState(() => {
    const { visibleTimeStart, visibleTimeEnd } = getInitialVisibleCanvas();
    const [canvasTimeStart, canvasTimeEnd] = getCanvasBoundariesFromVisibleTime(
      visibleTimeStart,
      visibleTimeEnd
    );
    return { canvasTimeStart, canvasTimeEnd };
  });
  const { canvasTimeStart, canvasTimeEnd } = canvas;
  const [canvasTop, setCanvasTop] = React.useState(0);
  const [canvasBottom, setCanvasBottom] = React.useState(500);
  const [width, setWidth] = React.useState(defaultWidthState);
  const [selectedItem, setSelectedItem] = React.useState<Id | null>(null);
  const [dragTime, setDragTime] = React.useState<number | null>(null);
  const [dragGroupTitle, setDragGroupTitle] = React.useState<React.ReactNode | null>(null);
  const [resizeTime, setResizeTime] = React.useState<number | null>(null);
  const [resizingItem, setResizingItem] = React.useState<Id | null>(null);
  const [resizingEdge, setResizingEdge] = React.useState<TimelineItemEdge | null>(null);
  const [newGroupOrder, setNewGroupOrder] = React.useState<number | null>(null);
  const [draggingItem, setDraggingItem] = React.useState<Id | null>(null);

  const _scrollComponent = React.useRef<HTMLDivElement | null>(null);
  const _scrollHeaderRef = React.useRef<HTMLElement | null>(null);
  const visibleGroupIds = React.useRef<Id[]>([]); // Keep track of the visible groups (on the canvas)

  const canvasWidth = getCanvasWidth(width);
  const [{ dimensionItems, height, groupHeights, groupTops }, setStackedItems] = React.useState(
    stackTimelineItems({
      calculateExtraSpace: props.calculateExtraSpace ?? defaultCalculateExtraSpace,
      canvasTimeEnd,
      canvasTimeStart,
      canvasWidth,
      draggingItem: null, // this.state.draggingItem,
      dragTime: null, // this.state.dragTime,
      groups: props.groups,
      itemHeight: props.itemHeight ?? defaultItemHeight,
      items: props.items,
      lineHeight: props.lineHeight ?? defaultLineHeight,
      newGroupOrder: null, // this.state.newGroupOrder,
      resizeTime: null, // this.state.resizeTime,
      resizingEdge: null, // this.state.resizingEdge,
      resizingItem: null, // this.state.resizingItem,
      stackItems: props.stackItems ?? defaultStackItems,
    })
  );

  const prevVisibleTimeStart = usePrevious(visibleTimeStart);
  const prevVisibleTimeEnd = usePrevious(visibleTimeEnd);
  const prevGroups = usePrevious(props.groups);
  const prevGroupTops = usePrevious(groupTops);
  const prevCanvasTimeStart = usePrevious(canvasTimeStart);
  const prevWidth = usePrevious(width);
  const prevCanvasTimeEnd = usePrevious(canvasTimeEnd);
  const prevDraggingItem = usePrevious(draggingItem);
  const prevResizingItem = usePrevious(resizingItem);
  const prevDragTime = usePrevious(dragTime);
  const prevResizingEdge = usePrevious(resizingEdge);
  const prevResizeTime = usePrevious(resizeTime);
  const prevNewGroupOrder = usePrevious(newGroupOrder);
  const prevSelected = usePrevious(props.selected);

  const sidebarWidth = props.sidebarWidth ?? defaultSidebarWidth;
  const rightSidebarWidth = props.rightSidebarWidth ?? defaultRightSidebarWidth;
  const timeSteps: CompleteTimeSteps = { ...defaultTimeSteps, ...props.timeSteps };
  const zoom = visibleTimeEnd - visibleTimeStart;
  const canvasHeight = canvasBottom - canvasTop;
  const minUnit = getMinUnit(zoom, width, timeSteps);
  const isInteractingWithItem = !!draggingItem || !!resizingItem || !!selectedItem;
  const outerComponentStyle = { height: `${height}px` };

  /**
   * Event listener that is called when the Timeline container div is scrolled (vertically) or is
   * resized. Checks whether the current vertical canvas still comfortably covers the visible area
   * and sets the new canvas position if it doesn't. Triggers a rerender if and only if a new vertical
   * canvas is needed.
   */
  const containerScrollOrResizeListener = () => {
    if (container.current === null) throw new Error(`Container reference is null`);
    const visibleTop = container.current.scrollTop;
    const visibleHeight = containerHeight.current;
    const needsNewVerticalCanvas = needNewVerticalCanvas(
      visibleTop,
      visibleHeight,
      canvasTop,
      canvasBottom
    );

    if (needsNewVerticalCanvas) {
      const { top, bottom } = getNewVerticalCanvasDimensions(visibleTop, visibleHeight);
      setCanvasTop(top);
      setCanvasBottom(bottom);
    }
  };

  const updateVisibleGroupIds = () => {
    const newVisibleGroupIds = calculateVisibleGroups(
      props.groups,
      groupTops,
      props.lineHeight ?? defaultLineHeight,
      canvasTop,
      canvasBottom
    );

    if (!isEqual(visibleGroupIds.current, newVisibleGroupIds)) {
      visibleGroupIds.current = newVisibleGroupIds;
      if (props.onVisibleGroupsChanged) props.onVisibleGroupsChanged(visibleGroupIds.current);
    }
  };

  const resize = (params = props) => {
    const width =
      containerWidth.current -
      (params.sidebarWidth ?? defaultSidebarWidth) -
      (params.rightSidebarWidth ?? defaultRightSidebarWidth);
    const canvasWidth = getCanvasWidth(width);
    setWidth(width);
    setStackedItems(
      stackTimelineItems({
        calculateExtraSpace: params.calculateExtraSpace ?? defaultCalculateExtraSpace,
        canvasTimeEnd,
        canvasTimeStart,
        canvasWidth,
        draggingItem,
        dragTime,
        groups: params.groups,
        itemHeight: params.itemHeight ?? defaultItemHeight,
        items: params.items,
        lineHeight: params.lineHeight ?? defaultLineHeight,
        newGroupOrder,
        resizeTime,
        resizingEdge,
        resizingItem,
        stackItems: params.stackItems ?? defaultStackItems,
      })
    );

    if (_scrollComponent.current === null) throw new Error(`Scroll component is null`);
    if (_scrollHeaderRef.current === null) throw new Error(`Scroll header ref is null`);

    _scrollComponent.current.scrollLeft = width;
    _scrollHeaderRef.current.scrollLeft = width;
  };

  const onTimeChange = (
    visibleTimeStart: number,
    visibleTimeEnd: number,
    updateScrollCanvas: (start: number, end: number) => void
  ) => {
    if (props.onTimeChange !== undefined) {
      props.onTimeChange(visibleTimeStart, visibleTimeEnd, updateScrollCanvas);
    } else {
      // This is the default value when the onTimeChange is empty
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    }
  };

  const getVisibleTimeWindow = () => ({ visibleTimeStart, visibleTimeEnd });

  const scrollHorizontally = (scrollX: number) => {
    const visibleDuration = visibleTimeEnd - visibleTimeStart;
    const millisecondsPerPixel = visibleDuration / width;
    const newVisibleTimeStart = canvasTimeStart + millisecondsPerPixel * scrollX;
    if (visibleTimeStart === newVisibleTimeStart) return;
    onTimeChange(newVisibleTimeStart, newVisibleTimeStart + visibleDuration, updateScrollCanvas);
  };

  const scrollHorizontallyByDelta = (deltaX: number) => {
    if (deltaX === 0) return;
    onTimeChange(visibleTimeStart + deltaX, visibleTimeEnd + deltaX, updateScrollCanvas);
  };

  const scrollVerticallyByDelta = (deltaY: number) => {
    if (deltaY === 0) return;
    container.current?.scrollBy(0, deltaY);
  };

  const updateScrollCanvas = (
    newVisibleTimeStart: number,
    newVisibleTimeEnd: number,
    forceUpdateDimensions = false,
    items: CustomItem[] = props.items,
    groups: CustomGroup[] = props.groups
  ) => {
    const oldCanvasTimeStart = canvasTimeStart;
    const oldZoom = visibleTimeEnd - visibleTimeStart;
    const newZoom = newVisibleTimeEnd - newVisibleTimeStart;

    // Check if the current canvas covers the new time period
    const canKeepCanvas =
      newZoom === oldZoom &&
      newVisibleTimeStart >= oldCanvasTimeStart + oldZoom * 0.5 &&
      newVisibleTimeStart <= oldCanvasTimeStart + oldZoom * 1.5 &&
      newVisibleTimeEnd >= oldCanvasTimeStart + oldZoom * 1.5 &&
      newVisibleTimeEnd <= oldCanvasTimeStart + oldZoom * 2.5;

    if (!canKeepCanvas || forceUpdateDimensions) {
      const [canvasTimeStart, canvasTimeEnd] = getCanvasBoundariesFromVisibleTime(
        newVisibleTimeStart,
        newVisibleTimeEnd
      );

      setCanvas({ canvasTimeStart, canvasTimeEnd });
      setStackedItems(
        stackTimelineItems({
          calculateExtraSpace: props.calculateExtraSpace ?? false,
          canvasTimeEnd,
          canvasTimeStart,
          canvasWidth: getCanvasWidth(width),
          draggingItem,
          dragTime,
          groups,
          itemHeight: props.itemHeight ?? 28, // TODO centralize default values
          items,
          lineHeight: props.lineHeight ?? 36, // TODO centralize default values
          newGroupOrder,
          resizeTime,
          resizingEdge,
          resizingItem,
          stackItems: props.stackItems ?? false, // TODO centralize default values
        })
      );
    }

    setVisibleCanvas({ visibleTimeEnd: newVisibleTimeEnd, visibleTimeStart: newVisibleTimeStart });
  };

  const handleWheelZoom = (speed: number, xPosition: number, deltaY: number) => {
    changeZoom(1.0 + (speed * deltaY) / 500, xPosition / width);
  };

  const changeZoom = (scale: number, offset = 0.5) => {
    const { minZoom = defaultMinZoom, maxZoom = defaultMaxZoom } = props;
    const oldZoom = visibleTimeEnd - visibleTimeStart;
    const newZoom = Math.min(Math.max(Math.round(oldZoom * scale), minZoom), maxZoom); // min 1 min, max 20 years
    const newVisibleTimeStart = Math.round(visibleTimeStart + (oldZoom - newZoom) * offset);
    onTimeChange(newVisibleTimeStart, newVisibleTimeStart + newZoom, updateScrollCanvas);
  };

  const showPeriod = (from: Date | number, to: Date | number) => {
    const visibleTimeStart = from.valueOf();
    const visibleTimeEnd = to.valueOf();
    const zoom = visibleTimeEnd - visibleTimeStart;
    if (zoom < 360000) return; // can't zoom in more than to show one hour
    onTimeChange(visibleTimeStart, visibleTimeStart + zoom, updateScrollCanvas);
  };

  const selectItem = (
    item: Id | null,
    clickType: ClickType | undefined,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    // if (item && props.onItemSelect) {
    //   if (isItemSelected(item)) {
    //     console.log("ITEM IS SELECTED", item);
    //   }
    //   const time = timeFromItemEvent(e);
    //   props.onItemSelect(item, e, time);
    // } else if (!item && props.onItemDeselect) {
    //   props.onItemDeselect(e);
    // }

    console.log(`does item ${item} exists in ${props.selected!.join(",")}`);
    if (
      isItemSelected(item) ||
      ((props.itemTouchSendsClick ?? defaultItemTouchSendsClick) && clickType === "touch")
    ) {
      console.log("ON ITEM CLICK");
      if (item && props.onItemClick) {
        const time = timeFromItemEvent(e);
        props.onItemClick(item, e, time);
      }
    } else {
      console.log("FOO");
      setSelectedItem((curr) => (curr === item || item === null ? null : item));
      if (item && props.onItemSelect) {
        const time = timeFromItemEvent(e);
        props.onItemSelect(item, e, time);
      } else if (item === null && props.onItemDeselect) {
        props.onItemDeselect(e);
      }
    }
  };

  const doubleClickItem = (item: Id, e: React.MouseEvent) => {
    if (props.onItemDoubleClick) {
      const time = timeFromItemEvent(e);
      props.onItemDoubleClick(item, e, time);
    }
  };

  const contextMenuClickItem = (item: Id, e: React.MouseEvent) => {
    if (props.onItemContextMenu) {
      const time = timeFromItemEvent(e);
      props.onItemContextMenu(item, e, time);
    }
  };

  // TODO: this is very similar to timeFromItemEvent, aside from which element to get offsets
  // from.  Look to consolidate the logic for determining coordinate to time
  // as well as generalizing how we get time from click on the canvas
  const getTimeFromRowClickEvent = (e: React.MouseEvent<Element, MouseEvent>) => {
    const { dragSnap = defaultDragSnap } = props;
    // this gives us distance from left of row element, so event is in
    // context of the row element, not client or page
    const { offsetX } = e.nativeEvent;

    let time = calculateTimeForXPosition(canvasTimeStart, canvasTimeEnd, getCanvasWidth(width), offsetX);

    time = Math.floor(time / dragSnap) * dragSnap;
    return time;
  };

  const timeFromItemEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const { dragSnap = defaultDragSnap } = props;
    if (_scrollComponent.current === null) throw new Error(`Scroll component is null`);
    const scrollComponent = _scrollComponent.current;
    const { left: scrollX } = scrollComponent.getBoundingClientRect();
    const clientX = "clientX" in e ? e.clientX : 0; // Touch event has no `clientX`. I think in this case we converted the undefined to 0.
    const xRelativeToTimeline = clientX - scrollX;
    const relativeItemPosition = xRelativeToTimeline / width;
    const zoom = visibleTimeEnd - visibleTimeStart;
    const timeOffset = relativeItemPosition * zoom;
    let time = Math.round(visibleTimeStart + timeOffset);
    time = Math.floor(time / dragSnap) * dragSnap;
    return time;
  };

  const dragItem = (item: Id, dragTime: number, newGroupOrder: number) => {
    const newGroup = props.groups[newGroupOrder];
    setDraggingItem(item);
    setDragTime(dragTime);
    setNewGroupOrder(newGroupOrder);
    setDragGroupTitle(newGroup ? newGroup.title : "");
    if (props.onItemDrag)
      props.onItemDrag({ eventType: "move", itemId: item, time: dragTime, newGroupOrder });
  };

  const dropItem = (item: Id, dragTime: number, newGroupOrder: number) => {
    setDraggingItem(null);
    setDragTime(null);
    setDragGroupTitle(null);
    if (props.onItemMove) props.onItemMove(item, dragTime, newGroupOrder);
  };

  const handleItemResizing = (item: Id, resizeTime: number, edge: TimelineItemEdge) => {
    setResizingItem(item);
    setResizingEdge(edge);
    setResizeTime(resizeTime);
    if (props.onItemDrag)
      props.onItemDrag({ eventType: "resize", itemId: item, time: resizeTime, edge });
  };

  const resizedItem = (item: Id, resizeTime: number, edge: TimelineItemEdge, timeDelta: number) => {
    setResizingItem(null);
    setResizingEdge(null);
    setResizeTime(null);
    if (props.onItemResize && timeDelta !== 0) props.onItemResize(item, resizeTime, edge);
  };

  const handleRowClick = (e: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => {
    if (hasSelectedItem()) selectItem(null, undefined, e);
    if (!props.onCanvasClick) return;
    const time = getTimeFromRowClickEvent(e);
    const groupId = props.groups[rowIndex].id;
    props.onCanvasClick(groupId, time, e);
  };

  const handleRowDoubleClick = (e: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => {
    if (!props.onCanvasDoubleClick) return;
    const time = getTimeFromRowClickEvent(e);
    const groupId = props.groups[rowIndex].id;
    props.onCanvasDoubleClick(groupId, time, e);
  };

  const handleScrollContextMenu = (e: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => {
    if (!props.onCanvasContextMenu) return;
    const timePosition = getTimeFromRowClickEvent(e);
    const groupId = props.groups[rowIndex].id;
    if (props.onCanvasContextMenu) {
      e.preventDefault();
      props.onCanvasContextMenu(groupId, timePosition, e);
    }
  };

  const handleScrollDrop = (e: React.DragEvent<Element>, rowIndex: number) => {
    if (!props.onCanvasDrop) return;
    const time = getTimeFromRowClickEvent(e);
    const groupId = props.groups[rowIndex].id;
    props.onCanvasDrop(groupId, time, e);
  };

  const handleHeaderRef = (el: HTMLElement | null) => {
    _scrollHeaderRef.current = el;
    if (props.headerRef) props.headerRef(el);
  };

  const getScrollElementRef: React.RefCallback<HTMLDivElement> = (el: HTMLDivElement) => {
    if (props.scrollRef) props.scrollRef(el);
    _scrollComponent.current = el;
  };

  // /**
  //  * check if child of type TimelineHeader
  //  * refer to for explanation https://github.com/gaearon/react-hot-loader#checking-element-types
  //  */
  const isTimelineHeader = (child: ReactNodeWithPossibleTypeAndSecretKey) => {
    if (child.type === undefined) return false;
    return child.type.secretKey === TimelineHeaders.secretKey;
  };

  const childrenWithProps = (
    canvasTimeStart: number,
    canvasTimeEnd: number,
    canvasWidth: number,
    dimensionItems: {
      id: Id;
      dimensions: Dimensions<CustomGroup>;
    }[],
    groupHeights: number[],
    groupTops: number[],
    height: number,
    visibleTimeStart: number | Date,
    visibleTimeEnd: number | Date,
    minUnit: TimeUnit,
    timeSteps: TimeSteps | undefined
  ) => {
    if (!props.children) return null;

    const childArray = Array.isArray(props.children)
      ? props.children.filter((c) => c)
      : [props.children];

    const childProps = {
      canvasTimeEnd,
      canvasTimeStart,
      canvasWidth,
      dimensionItems,
      groupHeights: groupHeights,
      groups: props.groups,
      groupTops: groupTops,
      height: height,
      items: props.items,
      minUnit: minUnit,
      selected: getSelected(),
      timeSteps,
      visibleTimeEnd,
      visibleTimeStart,
    };

    return React.Children.map(childArray, (child: ReactNodeWithPossibleTypeAndSecretKey) =>
      isTimelineHeader(child) || !React.isValidElement(child) ? null : React.cloneElement(child, childProps)
    );
  };

  const renderHeaders = () => {
    if (props.children) {
      let headerRenderer;

      React.Children.map(props.children, (child: ReactNodeWithPossibleTypeAndSecretKey) => {
        if (isTimelineHeader(child)) headerRenderer = child;
      });

      if (headerRenderer) return headerRenderer;
    }

    return (
      <TimelineHeaders>
        <DateHeader unit="primaryHeader" />
        <DateHeader />
      </TimelineHeaders>
    );
  };

  const hasSelectedItem = () => {
    if (!Array.isArray(props.selected)) return !!selectedItem;
    return props.selected.length > 0;
  };

  const getSelected = () => (selectedItem && !props.selected ? [selectedItem] : props.selected ?? []);

  const isItemSelected = (itemId: Id | null) => {
    const selectedItems = getSelected();
    return selectedItems.some((i) => i === itemId);
  };

  useResizeObserver(container, (entry) => {
    const { height, width } = entry.contentRect;
    if (containerHeight.current !== height) {
      containerHeight.current = height;
      containerScrollOrResizeListener(); // The height changed, update the vertical scroll canvas
    }

    if (containerWidth.current !== width) {
      containerWidth.current = width;
      resize(); // The width changed, update the horizontal scroll canvas
    }
  });

  const getDerivedStateFromProps = <
    CustomItem extends TimelineItemBase = TimelineItemBase,
    CustomGroup extends TimelineGroupBase = TimelineGroupBase
  >(
    nextProps: Readonly<TimelineProps<CustomItem, CustomGroup>>,
    prevState: Readonly<TimelineState<CustomGroup>> & {
      items?: CustomItem[];
      groups?: CustomGroup[];
    }
  ) => {
    const { visibleTimeStart, visibleTimeEnd, items, groups } = nextProps;

    // This is a gross hack pushing items and groups in to state only to allow
    // For the forceUpdate check
    const derivedState = { items, groups };

    // if the items or groups have changed we must re-render
    const forceUpdateDimensions = items !== prevState.items || groups !== prevState.groups; // TODO: please check this, I think this never worked

    // We are a controlled component
    if (visibleTimeStart && visibleTimeEnd) {
      // Get the new canvas position
      Object.assign(
        derivedState,
        calculateScrollCanvas({
          forceUpdateDimensions,
          groups,
          items,
          props: {
            // Provide default values
            lineHeight: defaultLineHeight,
            itemHeight: defaultItemHeight,
            stackItems: defaultStackItems,
            ...nextProps,
          } as any,
          state: prevState,
          visibleTimeEnd,
          visibleTimeStart,
        })
      );
    } else if (forceUpdateDimensions) {
      // Calculate new item stack position as canvas may have changed
      const canvasWidth = getCanvasWidth(prevState.width);
      Object.assign(
        derivedState,
        stackTimelineItems({
          calculateExtraSpace: nextProps.calculateExtraSpace ?? defaultCalculateExtraSpace,
          canvasTimeEnd: prevState.canvasTimeEnd,
          canvasTimeStart: prevState.canvasTimeStart,
          canvasWidth,
          draggingItem: prevState.draggingItem,
          dragTime: prevState.dragTime,
          groups,
          itemHeight: nextProps.itemHeight ?? defaultItemHeight,
          items,
          lineHeight: nextProps.lineHeight ?? defaultLineHeight,
          newGroupOrder: prevState.newGroupOrder,
          resizeTime: prevState.resizeTime,
          resizingEdge: prevState.resizingEdge,
          resizingItem: prevState.resizingItem,
          stackItems: nextProps.stackItems ?? defaultStackItems,
        })
      );
    }

    return derivedState;
  };

  // React.useEffect(() => {}, [props.visibleTimeStart, props.visibleTimeEnd]);

  React.useEffect(() => {
    setStackedItems(
      stackTimelineItems({
        items: props.items,
        groups: props.groups,
        canvasWidth,
        canvasTimeStart: prevCanvasTimeStart,
        canvasTimeEnd: prevCanvasTimeEnd,
        lineHeight: props.lineHeight ?? defaultLineHeight,
        itemHeight: props.itemHeight ?? defaultItemHeight,
        stackItems: props.stackItems ?? defaultStackItems,
        calculateExtraSpace: props.calculateExtraSpace ?? defaultCalculateExtraSpace,
        draggingItem: prevDraggingItem,
        resizingItem: prevResizingItem,
        dragTime: prevDragTime,
        resizingEdge: prevResizingEdge,
        resizeTime: prevResizeTime,
        newGroupOrder: prevNewGroupOrder,
      })
    );
  }, [props.items, props.groups]);

  React.useEffect(() => {
    if (container.current === null) throw new Error(`Container reference is null`);
    container.current.addEventListener("scroll", containerScrollOrResizeListener); // Listen for vertical scrolling on the container.

    updateVisibleGroupIds();

    return function cleanUp() {
      if (container.current === null) throw new Error(`Container reference is null`);
      container.current.removeEventListener("scroll", containerScrollOrResizeListener);
    };
  }, []);

  React.useEffect(() => {
    const newZoom = visibleTimeEnd - visibleTimeStart;
    const oldZoom = prevVisibleTimeEnd - prevVisibleTimeStart;

    // are we changing zoom? Report it!
    if (props.onZoom && newZoom !== oldZoom) {
      props.onZoom({
        canvasTimeEnd,
        canvasTimeStart,
        timelineWidth: width,
        visibleTimeEnd,
        visibleTimeStart,
      });
    }

    // // // If the group tops have changed but the groups are the same keep the first currently
    // // // visible group in a fixed scroll position. This prevents the chart from jumping randomly
    // // // when fresh item data is loaded to the chart.
    // if (prevGroups === props.groups && !isEqual(prevGroupTops, groupTops)) {
    //   if (container.current === null) throw new Error(`Container reference is null`);
    //   const visibleTop = container.current.scrollTop;
    //   // Find what was the first visible group id in the previous state
    //   const index = findFirstFullyVisibleGroupIndex(prevGroupTops ?? [], visibleTop);
    //   // Adjust the scroll to keep the first visible group in the same position
    //   // container.current.scrollBy(groupTops[index] - prevGroupTops![index] ?? 0, 0);
    // }

    // The bounds have changed? Report it!
    if (props.onBoundsChange && canvasTimeStart !== prevCanvasTimeStart) {
      props.onBoundsChange(canvasTimeStart, canvasTimeStart + newZoom * 3);
    }

    updateVisibleGroupIds();

    // Check the scroll is correct
    const scrollLeft = Math.round((width * (visibleTimeStart - canvasTimeStart)) / newZoom);
    const componentScrollLeft = Math.round(
      (prevWidth * (prevVisibleTimeStart - prevCanvasTimeStart)) / oldZoom
    );

    if (componentScrollLeft !== scrollLeft) {
      if (_scrollComponent.current === null) throw new Error(`Scroll component is null`);
      if (_scrollHeaderRef.current === null) throw new Error(`Scroll header ref is null`);
      _scrollComponent.current.scrollLeft = scrollLeft;
      _scrollHeaderRef.current.scrollLeft = scrollLeft;
    }
  }, [
    props.groups,
    props.onBoundsChange,
    props.onZoom,
    canvasTimeStart,
    groupTops,
    visibleTimeStart,
    visibleTimeEnd,
    width,
  ]);

  return (
    <LocalizationContext.Provider value={{ locale: props.locale }}>
      <TimelineProvider
        canvasTimeEnd={canvasTimeEnd}
        canvasTimeStart={canvasTimeStart}
        canvasWidth={canvasWidth}
        showPeriod={showPeriod}
        timelineUnit={minUnit}
        timelineWidth={width}
        visibleTimeEnd={visibleTimeEnd}
        visibleTimeStart={visibleTimeStart}
      >
        <MarkersProvider>
          <HeadersProvider
            leftSidebarWidth={props.sidebarWidth ?? defaultSidebarWidth}
            registerScroll={handleHeaderRef}
            rightSidebarWidth={props.rightSidebarWidth ?? defaultRightSidebarWidth}
            timeSteps={timeSteps}
          >
            <div
              className={`react-calendar-timeline ${props.className ?? defaultClassName}`}
              ref={container}
              style={{ ...defaultContainerStyle, ...(props.style ?? defaultStyle) }}
            >
              {renderHeaders()}
              <div style={outerComponentStyle} className="rct-outer">
                {(sidebarWidth ?? defaultSidebarWidth) > 0 && (
                  <Sidebar
                    groups={props.groups}
                    groupRenderer={props.groupRenderer}
                    width={sidebarWidth}
                    groupHeights={groupHeights}
                    canvasTop={canvasTop}
                    canvasBottom={canvasBottom}
                  />
                )}

                <ScrollElement
                  getVisibleTimeWindow={getVisibleTimeWindow}
                  height={canvasHeight}
                  isInteractingWithItem={isInteractingWithItem}
                  onHorizontalScroll={scrollHorizontally}
                  onHorizontalScrollByDelta={scrollHorizontallyByDelta}
                  onVerticalScrollByDelta={scrollVerticallyByDelta}
                  onWheelZoom={handleWheelZoom}
                  onZoom={changeZoom}
                  scrollRef={getScrollElementRef}
                  top={canvasTop}
                  width={width}
                  zoomSpeed={props.zoomSpeed}
                >
                  <MarkerCanvas>
                    <Columns
                      canvasTimeEnd={canvasTimeEnd}
                      canvasTimeStart={canvasTimeStart}
                      canvasWidth={canvasWidth}
                      height={height}
                      lineCount={props.groups.length}
                      minUnit={minUnit}
                      timeSteps={timeSteps}
                      verticalLineClassNamesForTime={props.verticalLineClassNamesForTime}
                    />
                    <GroupRows
                      canvasBottom={canvasBottom}
                      canvasTop={canvasTop}
                      canvasWidth={canvasWidth}
                      clickTolerance={props.clickTolerance ?? defaultClickTolerance}
                      groupHeights={groupHeights}
                      groups={props.groups}
                      horizontalLineClassNamesForGroup={props.horizontalLineClassNamesForGroup}
                      lineCount={props.groups.length}
                      onRowClick={handleRowClick}
                      onRowContextClick={handleScrollContextMenu}
                      onRowDoubleClick={handleRowDoubleClick}
                      onRowDrop={props.onCanvasDrop !== undefined ? handleScrollDrop : undefined}
                    />

                    <Items
                      canChangeGroup={props.canChangeGroup ?? defaultCanChangeGroup}
                      canMove={props.canMove ?? defaultCanMove}
                      canResize={props.canResize ?? defaultCanResize}
                      canSelect={props.canSelect ?? defaultCanSelect}
                      canvasBottom={canvasBottom}
                      canvasTimeEnd={canvasTimeEnd}
                      canvasTimeStart={canvasTimeStart}
                      canvasTop={canvasTop}
                      canvasWidth={canvasWidth}
                      dimensionItems={dimensionItems}
                      dragSnap={props.dragSnap ?? defaultDragSnap}
                      groups={props.groups}
                      groupTops={groupTops}
                      itemDrag={dragItem}
                      itemDrop={dropItem}
                      itemRenderer={props.itemRenderer}
                      itemResized={resizedItem}
                      itemResizing={handleItemResizing}
                      items={props.items}
                      itemSelect={selectItem}
                      minResizeWidth={props.minResizeWidth ?? defaultMinResizeWidth}
                      moveResizeValidator={props.moveResizeValidator}
                      onItemContextMenu={contextMenuClickItem}
                      onItemDoubleClick={doubleClickItem}
                      scrollRef={_scrollComponent.current}
                      selected={props.selected}
                      selectedItem={selectedItem}
                      useResizeHandle={props.useResizeHandle ?? defaultUseResizeHandle}
                    />
                    {childrenWithProps(
                      canvasTimeStart,
                      canvasTimeEnd,
                      canvasWidth,
                      dimensionItems,
                      groupHeights,
                      groupTops,
                      height,
                      visibleTimeStart,
                      visibleTimeEnd,
                      minUnit,
                      timeSteps
                    )}
                  </MarkerCanvas>
                </ScrollElement>

                {(rightSidebarWidth ?? defaultRightSidebarWidth) > 0 && (
                  <Sidebar
                    canvasBottom={canvasBottom}
                    canvasTop={canvasTop}
                    groupHeights={groupHeights}
                    groupRenderer={props.groupRenderer}
                    groups={props.groups}
                    isRightSidebar
                    width={rightSidebarWidth}
                  />
                )}
              </div>
            </div>
          </HeadersProvider>
        </MarkersProvider>
      </TimelineProvider>
    </LocalizationContext.Provider>
  );
};
