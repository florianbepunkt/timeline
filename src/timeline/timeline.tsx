import {
  calculateScrollCanvas,
  calculateTimeForXPosition,
  Dimensions,
  getCanvasBoundariesFromVisibleTime,
  getCanvasWidth,
  getMinUnit,
  ItemDimensions,
  stackTimelineItems,
} from "../utility/calendar";
import {
  calculateVisibleGroups,
  findFirstFullyVisibleGroupIndex,
  getNewVerticalCanvasDimensions,
  needNewVerticalCanvas,
} from "./virtualization";
import { Columns } from "../columns";
import { DateHeader, TimelineHeaders, HeadersProvider } from "../headers";
import { defaultTimeSteps } from "../default-config";
import { GroupRows } from "../row";
import { isEqual } from "lodash-es";
import { Items } from "../items";
import { ScrollElement } from "../scroll";
import { Sidebar } from "../sidebar";
import { TimelineMarkersProvider } from "../markers/TimelineMarkersContext";
import { TimelineProvider } from "./timeline-context";
import MarkerCanvas from "../markers/MarkerCanvas";
import React, { Component } from "react";
import type {
  ClickType,
  CompleteTimeSteps,
  Id,
  TimeSteps,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemEdge,
  TimeUnit,
} from "../types";
import { TimelineProps } from "./props";

type ReactNodeWithPossibleTypeAndSecretKey = React.ReactNode & { type?: { secretKey?: unknown } };
type ReactElementWithPossibleTypeAndSecretKey = React.ReactElement & { type?: { secretKey?: unknown } };
type ReactCalendarTimelineState<CustomGroup extends TimelineGroupBase> = {
  canvasBottom: number;
  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasTop: number;
  dragGroupTitle: React.ReactNode | null;
  dragTime: number | null;
  resizeTime: number | null;
  resizingEdge: TimelineItemEdge | null;
  resizingItem: Id | null;
  selectedItem: null | Id;
  visibleTimeEnd: number;
  visibleTimeStart: number;
  width: number;

  // Hidden props without initial values (at least in the original implementation)
  dimensionItems: {
    id: Id;
    dimensions: Dimensions<CustomGroup>;
  }[];
  height: number;
  groupHeights: number[];
  groupTops: number[];
  newGroupOrder: number | null;
  draggingItem: Id | null;
};

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

export class Timeline<
  CustomItem extends TimelineItemBase = TimelineItemBase,
  CustomGroup extends TimelineGroupBase = TimelineGroupBase
> extends Component<TimelineProps<CustomItem, CustomGroup>, ReactCalendarTimelineState<CustomGroup>> {
  getTimelineContext = () => {
    const { width, visibleTimeStart, visibleTimeEnd, canvasTimeStart, canvasTimeEnd } = this.state;
    return {
      canvasTimeEnd,
      canvasTimeStart,
      timelineWidth: width,
      visibleTimeEnd,
      visibleTimeStart,
    };
  };

  private _containerHeight: number;
  private _containerWidth: number;
  private _resizeObserver: ResizeObserver;

  // Keep track of the visible groups (on the canvas)
  private _visibleGroupIds: Id[];

  constructor(props: TimelineProps<CustomItem, CustomGroup>) {
    super(props);

    this.getSelected = this.getSelected.bind(this);
    this.hasSelectedItem = this.hasSelectedItem.bind(this);
    this.isItemSelected = this.isItemSelected.bind(this);

    // Bind this listener so we can reach the Timeline (and call setState) in it. Without binding,
    // the 'this' inside the function would point directly to the container. Note that we can
    // still reach the container as well if the listener is bound because the Timeline keeps a
    // reference to it.
    this.containerScrollOrResizeListener = this.containerScrollOrResizeListener.bind(this);

    // Keep track of the current height and width of the container.
    this._containerHeight = 0;
    this._containerWidth = 0;
    this._resizeObserver = new ResizeObserver((entries) => {
      const { height, width } = entries[0].contentRect;

      if (this._containerHeight !== height) {
        this._containerHeight = height;
        // The height changed, update the vertical scroll canvas
        this.containerScrollOrResizeListener();
      }

      if (this._containerWidth !== width) {
        this._containerWidth = width;
        // The width changed, update the horizontal scroll canvas
        this.resize();
      }
    });

    let visibleTimeStart: null | number = null;
    let visibleTimeEnd: null | number = null;

    if (this.props.defaultTimeStart && this.props.defaultTimeEnd) {
      visibleTimeStart = this.props.defaultTimeStart.valueOf();
      visibleTimeEnd = this.props.defaultTimeEnd.valueOf();
    } else if (this.props.visibleTimeStart && this.props.visibleTimeEnd) {
      visibleTimeStart = this.props.visibleTimeStart;
      visibleTimeEnd = this.props.visibleTimeEnd;
    } else {
      //throwing an error because neither default or visible time props provided
      throw new Error(
        'You must provide either "defaultTimeStart" and "defaultTimeEnd" or "visibleTimeStart" and "visibleTimeEnd" to initialize the Timeline'
      );
    }

    this._visibleGroupIds = [];

    const [canvasTimeStart, canvasTimeEnd] = getCanvasBoundariesFromVisibleTime(
      visibleTimeStart,
      visibleTimeEnd
    );

    const canvasWidth = getCanvasWidth(defaultWidthState); // We can't use state.width here. So let's use the default value.

    const { dimensionItems, height, groupHeights, groupTops } = stackTimelineItems({
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
    });

    this.state = {
      canvasTop: 0,
      canvasBottom: 500,
      width: defaultWidthState,
      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd,
      canvasTimeStart: canvasTimeStart,
      canvasTimeEnd: canvasTimeEnd,
      selectedItem: null,
      dragTime: null,
      dragGroupTitle: null,
      resizeTime: null,
      resizingItem: null,
      resizingEdge: null,

      dimensionItems: dimensionItems,
      height: height,
      groupHeights: groupHeights,
      groupTops: groupTops,
      newGroupOrder: null,
      draggingItem: null,
    };
  }

  private _container: HTMLDivElement | null = null;

  /**
   * Event listener that is called when the Timeline container div is scrolled (vertically) or is
   * resized. Checks whether the current vertical canvas still comfortably covers the visible area
   * and sets the new canvas position if it doesn't. Triggers a rerender if and only if a new vertical
   * canvas is needed.
   */
  containerScrollOrResizeListener() {
    if (this._container === null) {
      throw new Error(`This should never happen: the container reference is null`);
    }
    const visibleTop = this._container.scrollTop;
    const visibleHeight = this._containerHeight;

    if (
      needNewVerticalCanvas(visibleTop, visibleHeight, this.state.canvasTop, this.state.canvasBottom)
    ) {
      const { top, bottom } = getNewVerticalCanvasDimensions(visibleTop, visibleHeight);
      this.setState({ canvasTop: top, canvasBottom: bottom });
    }
  }

  updateVisibleGroupIds() {
    const newVisibleGroupIds = calculateVisibleGroups(
      this.props.groups,
      this.state.groupTops,
      this.props.lineHeight ?? defaultLineHeight,
      this.state.canvasTop,
      this.state.canvasBottom
    );
    if (!isEqual(this._visibleGroupIds, newVisibleGroupIds)) {
      this._visibleGroupIds = newVisibleGroupIds;
      // The visible groups have changed? Report it!
      if (this.props.onVisibleGroupsChanged) {
        this.props.onVisibleGroupsChanged(this._visibleGroupIds);
      }
    }
  }

  componentDidMount() {
    // The following was never used. It was just set to null after the component mounted. Why???
    // this._lastTouchDistance = null;

    if (this._container === null) {
      throw new Error(`This should never happen: the container reference is null`);
    }

    // Listen for vertical scrolling on the container div.
    this._container.addEventListener("scroll", this.containerScrollOrResizeListener);

    // Starting the observation will call the listeners once. That initial call will
    // set up the initial horizontal and vertical canvas properly.
    this._resizeObserver.observe(this._container);

    this.updateVisibleGroupIds();
  }

  componentWillUnmount() {
    if (this._container === null) {
      throw new Error(`This should never happen: the container reference is null`);
    }
    this._container.removeEventListener("scroll", this.containerScrollOrResizeListener);
    this._resizeObserver.unobserve(this._container);
  }

  static getDerivedStateFromProps<
    CustomItem extends TimelineItemBase = TimelineItemBase,
    CustomGroup extends TimelineGroupBase = TimelineGroupBase
  >(
    nextProps: Readonly<TimelineProps<CustomItem, CustomGroup>>,
    prevState: Readonly<ReactCalendarTimelineState<CustomGroup>> & {
      items?: CustomItem[];
      groups?: CustomGroup[];
    }
  ) {
    const { visibleTimeStart, visibleTimeEnd, items, groups } = nextProps;

    // This is a gross hack pushing items and groups in to state only to allow
    // For the forceUpdate check
    const derivedState = { items, groups };

    // if the items or groups have changed we must re-render
    const forceUpdate = items !== prevState.items || groups !== prevState.groups; // TODO: please check this, I think this never worked

    // We are a controlled component
    if (visibleTimeStart && visibleTimeEnd) {
      // Get the new canvas position
      Object.assign(
        derivedState,
        calculateScrollCanvas(
          visibleTimeStart,
          visibleTimeEnd,
          forceUpdate,
          items,
          groups,
          {
            // Provide default values
            lineHeight: defaultLineHeight,
            itemHeight: defaultItemHeight,
            stackItems: defaultStackItems,
            ...nextProps,
          },
          prevState
        )
      );
    } else if (forceUpdate) {
      // Calculate new item stack position as canvas may have changed
      const canvasWidth = getCanvasWidth(prevState.width);
      Object.assign(
        derivedState,
        stackTimelineItems({
          items,
          groups,
          canvasWidth,
          canvasTimeStart: prevState.canvasTimeStart,
          canvasTimeEnd: prevState.canvasTimeEnd,
          lineHeight: nextProps.lineHeight ?? defaultLineHeight,
          itemHeight: nextProps.itemHeight ?? defaultItemHeight,
          stackItems: nextProps.stackItems ?? defaultStackItems,
          calculateExtraSpace: nextProps.calculateExtraSpace ?? defaultCalculateExtraSpace,
          draggingItem: prevState.draggingItem,
          resizingItem: prevState.resizingItem,
          dragTime: prevState.dragTime,
          resizingEdge: prevState.resizingEdge,
          resizeTime: prevState.resizeTime,
          newGroupOrder: prevState.newGroupOrder,
        })
      );
    }

    return derivedState;
  }

  componentDidUpdate(
    prevProps: Readonly<TimelineProps<CustomItem, CustomGroup>>,
    prevState: Readonly<ReactCalendarTimelineState<CustomGroup>>
  ) {
    const newZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart;
    const oldZoom = prevState.visibleTimeEnd - prevState.visibleTimeStart;

    // are we changing zoom? Report it!
    if (this.props.onZoom && newZoom !== oldZoom) {
      this.props.onZoom(this.getTimelineContext());
    }

    // If the group tops have changed but the groups are the same keep the first currently
    // visible group in a fixed scroll position. This prevents the chart from jumping randomly
    // when fresh item data is loaded to the chart.
    if (prevProps.groups === this.props.groups && !isEqual(prevState.groupTops, this.state.groupTops)) {
      if (this._container === null) {
        throw new Error(`This should never happen: the container reference is null`);
      }
      const visibleTop = this._container.scrollTop;
      const prevGroupTops = prevState.groupTops;

      // Find what was the first visible group id in the previous state
      const index = findFirstFullyVisibleGroupIndex(prevGroupTops, visibleTop);

      // Adjust the scroll to keep the first visible group in the same position
      this._container.scrollBy(0, this.state.groupTops[index] - prevGroupTops[index]);
    }

    // The bounds have changed? Report it!
    if (this.props.onBoundsChange && this.state.canvasTimeStart !== prevState.canvasTimeStart) {
      this.props.onBoundsChange(this.state.canvasTimeStart, this.state.canvasTimeStart + newZoom * 3);
    }

    this.updateVisibleGroupIds();

    // Check the scroll is correct
    const scrollLeft = Math.round(
      (this.state.width * (this.state.visibleTimeStart - this.state.canvasTimeStart)) / newZoom
    );
    const componentScrollLeft = Math.round(
      (prevState.width * (prevState.visibleTimeStart - prevState.canvasTimeStart)) / oldZoom
    );
    if (componentScrollLeft !== scrollLeft) {
      if (this._scrollComponent === null) {
        throw new Error(`This should never happen: the scroll component is null`);
      }
      if (this._scrollHeaderRef === null) {
        throw new Error(`This should never happen: the scroll header ref is null`);
      }
      this._scrollComponent.scrollLeft = scrollLeft;
      this._scrollHeaderRef.scrollLeft = scrollLeft;
    }
  }

  resize = (props = this.props) => {
    const width =
      this._containerWidth -
      (props.sidebarWidth ?? defaultSidebarWidth) -
      (props.rightSidebarWidth ?? defaultRightSidebarWidth);
    const canvasWidth = getCanvasWidth(width);
    const { dimensionItems, height, groupHeights, groupTops } = stackTimelineItems({
      calculateExtraSpace: props.calculateExtraSpace ?? defaultCalculateExtraSpace,
      canvasTimeEnd: this.state.canvasTimeEnd,
      canvasTimeStart: this.state.canvasTimeStart,
      canvasWidth,
      draggingItem: this.state.draggingItem,
      dragTime: this.state.dragTime,
      groups: props.groups,
      itemHeight: props.itemHeight ?? defaultItemHeight,
      items: props.items,
      lineHeight: props.lineHeight ?? defaultLineHeight,
      newGroupOrder: this.state.newGroupOrder,
      resizeTime: this.state.resizeTime,
      resizingEdge: this.state.resizingEdge,
      resizingItem: this.state.resizingItem,
      stackItems: props.stackItems ?? defaultStackItems,
    });

    // this is needed by dragItem since it uses pageY from the drag events
    // if this was in the context of the scrollElement, this would not be necessary

    this.setState({
      width,
      dimensionItems,
      height,
      groupHeights,
      groupTops,
    });

    if (this._scrollComponent === null) {
      throw new Error(`This should never happen: the scroll component is null`);
    }
    if (this._scrollHeaderRef === null) {
      throw new Error(`This should never happen: the scroll header ref is null`);
    }

    this._scrollComponent.scrollLeft = width;
    this._scrollHeaderRef.scrollLeft = width;
  };

  onTimeChange = (
    visibleTimeStart: number,
    visibleTimeEnd: number,
    updateScrollCanvas: (start: number, end: number) => void
  ) => {
    if (this.props.onTimeChange !== undefined) {
      this.props.onTimeChange(visibleTimeStart, visibleTimeEnd, updateScrollCanvas);
    } else {
      // This is the default value when the onTimeChange is empty
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    }
  };

  scrollHorizontally = (scrollX: number) => {
    const visibleDuration = this.state.visibleTimeEnd - this.state.visibleTimeStart;
    const millisecondsPerPixel = visibleDuration / this.state.width;

    const canvasTimeStart = this.state.canvasTimeStart;
    const visibleTimeStart = canvasTimeStart + millisecondsPerPixel * scrollX;

    if (this.state.visibleTimeStart !== visibleTimeStart) {
      this.onTimeChange(visibleTimeStart, visibleTimeStart + visibleDuration, this.updateScrollCanvas);
    }
  };

  /**
   * Scrolls the timeline by the given time delta.
   *
   * @param timeDelta  The time delta in milliseconds (either negative or positive) to scroll the timeline by.
   */
  scrollHorizontallyByTime = (timeDelta: number) => {
    if (timeDelta !== 0) {
      this.onTimeChange(
        this.state.visibleTimeStart + timeDelta,
        this.state.visibleTimeEnd + timeDelta,
        this.updateScrollCanvas
      );
    }
  };

  /**
   * Returns the currently visible time window.
   */
  getVisibleTimeWindow = () => {
    return { visibleTimeStart: this.state.visibleTimeStart, visibleTimeEnd: this.state.visibleTimeEnd };
  };

  scrollVerticallyBy = (deltaY: number) => {
    if (deltaY) {
      this._container?.scrollBy(0, deltaY);
    }
  };

  // called when the visible time changes
  updateScrollCanvas = (
    visibleTimeStart: number,
    visibleTimeEnd: number,
    forceUpdateDimensions = false, // Originally this could be undefined, I use default false instead
    items: CustomItem[] = this.props.items,
    groups: CustomGroup[] = this.props.groups
  ) => {
    this.setState(
      calculateScrollCanvas(
        visibleTimeStart,
        visibleTimeEnd,
        forceUpdateDimensions,
        items,
        groups,
        {
          // DON'T FORGET THE DEFAULT VALUES!
          lineHeight: defaultLineHeight,
          itemHeight: defaultItemHeight,
          stackItems: defaultStackItems,
          ...this.props,
        },
        this.state
      ) as ReactCalendarTimelineState<CustomGroup> // TODO: this is ugly, we need to use proper state type in the calculateScrollCanvas
    );
  };

  handleWheelZoom = (speed: number, xPosition: number, deltaY: number) => {
    this.changeZoom(1.0 + (speed * deltaY) / 500, xPosition / this.state.width);
  };

  changeZoom = (scale: number, offset = 0.5) => {
    const { minZoom = defaultMinZoom, maxZoom = defaultMaxZoom } = this.props;
    const oldZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart;
    const newZoom = Math.min(Math.max(Math.round(oldZoom * scale), minZoom), maxZoom); // min 1 min, max 20 years
    const newVisibleTimeStart = Math.round(this.state.visibleTimeStart + (oldZoom - newZoom) * offset);

    this.onTimeChange(newVisibleTimeStart, newVisibleTimeStart + newZoom, this.updateScrollCanvas);
  };

  showPeriod = (from: Date | number, to: Date | number) => {
    const visibleTimeStart = from.valueOf();
    const visibleTimeEnd = to.valueOf();
    const zoom = visibleTimeEnd - visibleTimeStart;
    if (zoom < 360000) return; // can't zoom in more than to show one hour
    this.onTimeChange(visibleTimeStart, visibleTimeStart + zoom, this.updateScrollCanvas);
  };

  selectItem = (
    item: Id | null,
    clickType: ClickType | undefined,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (
      this.isItemSelected(item) ||
      ((this.props.itemTouchSendsClick ?? defaultItemTouchSendsClick) && clickType === "touch")
    ) {
      if (item && this.props.onItemClick) {
        const time = this.timeFromItemEvent(e);
        this.props.onItemClick(item, e, time);
      }
    } else {
      this.setState({ selectedItem: item });
      if (item && this.props.onItemSelect) {
        const time = this.timeFromItemEvent(e);
        this.props.onItemSelect(item, e, time);
      } else if (item === null && this.props.onItemDeselect) {
        this.props.onItemDeselect(e); // this isnt in the docs. Is this function even used?
      }
    }
  };

  doubleClickItem = (item: Id, e: React.MouseEvent) => {
    if (this.props.onItemDoubleClick) {
      const time = this.timeFromItemEvent(e);
      this.props.onItemDoubleClick(item, e, time);
    }
  };

  contextMenuClickItem = (item: Id, e: React.MouseEvent) => {
    if (this.props.onItemContextMenu) {
      const time = this.timeFromItemEvent(e);
      this.props.onItemContextMenu(item, e, time);
    }
  };

  // TODO: this is very similar to timeFromItemEvent, aside from which element to get offsets
  // from.  Look to consolidate the logic for determining coordinate to time
  // as well as generalizing how we get time from click on the canvas
  getTimeFromRowClickEvent = (e: React.MouseEvent<Element, MouseEvent>) => {
    const { dragSnap = defaultDragSnap } = this.props;
    const { width, canvasTimeStart, canvasTimeEnd } = this.state;
    // this gives us distance from left of row element, so event is in
    // context of the row element, not client or page
    const { offsetX } = e.nativeEvent;

    let time = calculateTimeForXPosition(
      canvasTimeStart,

      canvasTimeEnd,
      getCanvasWidth(width),
      offsetX
    );
    time = Math.floor(time / dragSnap) * dragSnap;

    return time;
  };

  timeFromItemEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const { width, visibleTimeStart, visibleTimeEnd } = this.state;
    const { dragSnap = defaultDragSnap } = this.props;

    if (this._scrollComponent === null) {
      throw new Error(`This should never happen: the scroll component is null`);
    }

    const scrollComponent = this._scrollComponent;
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

  dragItem = (item: Id, dragTime: number, newGroupOrder: number) => {
    const newGroup = this.props.groups[newGroupOrder];

    this.setState({
      draggingItem: item,
      dragTime: dragTime,
      newGroupOrder: newGroupOrder,
      dragGroupTitle: newGroup ? newGroup.title : "",
    });

    if (this.props.onItemDrag) {
      this.props.onItemDrag({ eventType: "move", itemId: item, time: dragTime, newGroupOrder });
    }
  };

  dropItem = (item: Id, dragTime: number, newGroupOrder: number) => {
    this.setState({ draggingItem: null, dragTime: null, dragGroupTitle: null });
    if (this.props.onItemMove) {
      this.props.onItemMove(item, dragTime, newGroupOrder);
    }
  };

  resizingItem = (item: Id, resizeTime: number, edge: TimelineItemEdge) => {
    this.setState({
      resizingItem: item,
      resizingEdge: edge,
      resizeTime: resizeTime,
    });

    if (this.props.onItemDrag) {
      this.props.onItemDrag({ eventType: "resize", itemId: item, time: resizeTime, edge });
    }
  };

  resizedItem = (item: Id, resizeTime: number, edge: TimelineItemEdge, timeDelta: number) => {
    this.setState({ resizingItem: null, resizingEdge: null, resizeTime: null });
    if (this.props.onItemResize && timeDelta !== 0) {
      this.props.onItemResize(item, resizeTime, edge);
    }
  };

  columns(
    canvasTimeStart: number,
    canvasTimeEnd: number,
    canvasWidth: number,
    minUnit: TimeUnit,
    timeSteps: CompleteTimeSteps,
    height: number
  ) {
    return (
      <Columns
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        lineCount={this.props.groups.length}
        minUnit={minUnit}
        timeSteps={timeSteps}
        height={height}
        verticalLineClassNamesForTime={this.props.verticalLineClassNamesForTime}
      />
    );
  }

  handleRowClick = (e: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => {
    // shouldnt this be handled by the user, as far as when to deselect an item?
    if (this.hasSelectedItem()) {
      this.selectItem(null, undefined, e); // I added the event param, I have no idea how has this even worked before...
    }

    if (this.props.onCanvasClick === null || this.props.onCanvasClick === undefined) return;

    const time = this.getTimeFromRowClickEvent(e);
    const groupId = this.props.groups[rowIndex].id;
    this.props.onCanvasClick(groupId, time, e);
  };

  handleRowDoubleClick = (e: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => {
    if (this.props.onCanvasDoubleClick === null || this.props.onCanvasDoubleClick === undefined) return;

    const time = this.getTimeFromRowClickEvent(e);
    const groupId = this.props.groups[rowIndex].id;
    this.props.onCanvasDoubleClick(groupId, time, e);
  };

  handleScrollContextMenu = (e: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => {
    if (this.props.onCanvasContextMenu === null) return;

    const timePosition = this.getTimeFromRowClickEvent(e);

    const groupId = this.props.groups[rowIndex].id;

    if (this.props.onCanvasContextMenu) {
      e.preventDefault();
      this.props.onCanvasContextMenu(groupId, timePosition, e);
    }
  };

  handleScrollDrop = (e: React.DragEvent<Element>, rowIndex: number) => {
    if (this.props.onCanvasDrop === undefined) return;

    const time = this.getTimeFromRowClickEvent(e);
    const groupId = this.props.groups[rowIndex].id;
    this.props.onCanvasDrop(groupId, time, e);
  };

  rows(
    canvasWidth: number,
    canvasTop: number,
    canvasBottom: number,
    groupHeights: number[],
    groups: CustomGroup[]
  ) {
    return (
      <GroupRows
        groups={groups}
        canvasWidth={canvasWidth}
        canvasTop={canvasTop}
        canvasBottom={canvasBottom}
        lineCount={this.props.groups.length}
        groupHeights={groupHeights}
        clickTolerance={this.props.clickTolerance ?? defaultClickTolerance}
        onRowClick={this.handleRowClick}
        onRowDoubleClick={this.handleRowDoubleClick}
        onRowDrop={this.props.onCanvasDrop !== undefined ? this.handleScrollDrop : undefined}
        horizontalLineClassNamesForGroup={this.props.horizontalLineClassNamesForGroup}
        onRowContextClick={this.handleScrollContextMenu}
      />
    );
  }

  items(
    canvasTimeStart: number,
    canvasTimeEnd: number,
    canvasWidth: number,
    canvasTop: number,
    canvasBottom: number,
    dimensionItems: ItemDimensions<CustomGroup>[],
    groupTops: number[] | undefined
  ) {
    return (
      <Items
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        canvasTop={canvasTop}
        canvasBottom={canvasBottom}
        dimensionItems={dimensionItems}
        groupTops={groupTops}
        items={this.props.items}
        groups={this.props.groups}
        selectedItem={this.state.selectedItem}
        dragSnap={this.props.dragSnap ?? defaultDragSnap}
        minResizeWidth={this.props.minResizeWidth ?? defaultMinResizeWidth}
        canChangeGroup={this.props.canChangeGroup ?? defaultCanChangeGroup}
        canMove={this.props.canMove ?? defaultCanMove}
        canResize={this.props.canResize ?? defaultCanResize}
        useResizeHandle={this.props.useResizeHandle ?? defaultUseResizeHandle}
        canSelect={this.props.canSelect ?? defaultCanSelect}
        moveResizeValidator={this.props.moveResizeValidator}
        itemSelect={this.selectItem}
        itemDrag={this.dragItem}
        itemDrop={this.dropItem}
        onItemDoubleClick={this.doubleClickItem}
        onItemContextMenu={this.contextMenuClickItem}
        itemResizing={this.resizingItem}
        itemResized={this.resizedItem}
        itemRenderer={this.props.itemRenderer}
        selected={this.props.selected}
        scrollRef={this._scrollComponent}
      />
    );
  }

  private _scrollHeaderRef: HTMLElement | null = null;

  handleHeaderRef = (el: HTMLElement | null) => {
    this._scrollHeaderRef = el;
    if (this.props.headerRef) {
      this.props.headerRef(el);
    }
  };

  sidebar(groupHeights: number[], canvasTop: number, canvasBottom: number) {
    const { sidebarWidth = defaultSidebarWidth } = this.props;
    return (
      sidebarWidth && (
        <Sidebar
          groups={this.props.groups}
          groupRenderer={this.props.groupRenderer}
          width={sidebarWidth}
          groupHeights={groupHeights}
          canvasTop={canvasTop}
          canvasBottom={canvasBottom}
        />
      )
    );
  }

  rightSidebar(groupHeights: number[], canvasTop: number, canvasBottom: number) {
    const { rightSidebarWidth = defaultRightSidebarWidth } = this.props;
    return (
      rightSidebarWidth && (
        <Sidebar
          groups={this.props.groups}
          groupRenderer={this.props.groupRenderer}
          isRightSidebar
          width={rightSidebarWidth}
          groupHeights={groupHeights}
          canvasTop={canvasTop}
          canvasBottom={canvasBottom}
        />
      )
    );
  }

  /**
   * check if child of type TimelineHeader
   * refer to for explanation https://github.com/gaearon/react-hot-loader#checking-element-types
   */
  isTimelineHeader = (child: ReactNodeWithPossibleTypeAndSecretKey) => {
    if (child.type === undefined) return false;
    return child.type.secretKey === TimelineHeaders.secretKey;
  };

  childrenWithProps(
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
  ) {
    if (!this.props.children) {
      return null;
    }

    // convert to an array and remove the nulls
    const childArray = Array.isArray(this.props.children)
      ? this.props.children.filter((c) => c)
      : [this.props.children];

    const childProps = {
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd,
      dimensionItems,
      items: this.props.items,
      groups: this.props.groups,
      groupHeights: groupHeights,
      groupTops: groupTops,
      selected: this.getSelected(),
      height: height,
      minUnit: minUnit,
      timeSteps: timeSteps,
    };

    return React.Children.map(childArray, (child: ReactElementWithPossibleTypeAndSecretKey) => {
      if (!this.isTimelineHeader(child)) {
        return React.cloneElement(child, childProps);
      } else {
        return null;
      }
    });
  }

  renderHeaders = () => {
    if (this.props.children) {
      let headerRenderer;
      React.Children.map(this.props.children, (child: ReactNodeWithPossibleTypeAndSecretKey) => {
        if (this.isTimelineHeader(child)) {
          headerRenderer = child;
        }
      });
      if (headerRenderer) {
        return headerRenderer;
      }
    }
    return (
      <TimelineHeaders>
        <DateHeader unit="primaryHeader" />
        <DateHeader />
      </TimelineHeaders>
    );
  };

  getSelected() {
    return this.state.selectedItem && !this.props.selected
      ? [this.state.selectedItem]
      : this.props.selected || [];
  }

  hasSelectedItem() {
    if (!Array.isArray(this.props.selected)) return !!this.state.selectedItem;
    return this.props.selected.length > 0;
  }

  isItemSelected(itemId: Id | null) {
    const selectedItems = this.getSelected();
    return selectedItems.some((i) => i === itemId);
  }

  private _scrollComponent: HTMLDivElement | null = null;

  getScrollElementRef: React.RefCallback<HTMLDivElement> = (el: HTMLDivElement) => {
    if (this.props.scrollRef) {
      this.props.scrollRef(el);
    }
    this._scrollComponent = el;
  };

  render() {
    // We need a complete time steps, partial is not enough, so the missing parts will be overwritten
    const timeSteps: CompleteTimeSteps = { ...defaultTimeSteps, ...this.props.timeSteps };
    const {
      groups,
      items,
      rightSidebarWidth = defaultRightSidebarWidth,
      sidebarWidth = defaultSidebarWidth,
    } = this.props;
    const {
      canvasBottom,
      canvasTimeEnd,
      canvasTimeStart,
      canvasTop,
      draggingItem,
      resizingItem,
      selectedItem,
      visibleTimeEnd,
      visibleTimeStart,
      width,
    } = this.state;

    let { dimensionItems, height, groupHeights, groupTops } = this.state;
    const zoom = visibleTimeEnd - visibleTimeStart;
    const canvasWidth = getCanvasWidth(width);
    const canvasHeight = canvasBottom - canvasTop;
    const minUnit = getMinUnit(zoom, width, timeSteps);
    const isInteractingWithItem = !!draggingItem || !!resizingItem || !!selectedItem;

    if (isInteractingWithItem) {
      const stackResults = stackTimelineItems({
        calculateExtraSpace: this.props.calculateExtraSpace ?? defaultCalculateExtraSpace,
        canvasTimeEnd: this.state.canvasTimeEnd,
        canvasTimeStart: this.state.canvasTimeStart,
        canvasWidth,
        draggingItem: this.state.draggingItem,
        dragTime: this.state.dragTime,
        groups,
        itemHeight: this.props.itemHeight ?? defaultItemHeight,
        items,
        lineHeight: this.props.lineHeight ?? defaultLineHeight,
        newGroupOrder: this.state.newGroupOrder,
        resizeTime: this.state.resizeTime,
        resizingEdge: this.state.resizingEdge,
        resizingItem: this.state.resizingItem,
        stackItems: this.props.stackItems ?? defaultStackItems,
      });

      dimensionItems = stackResults.dimensionItems;
      height = stackResults.height;
      groupHeights = stackResults.groupHeights;
      groupTops = stackResults.groupTops;
    }

    const outerComponentStyle = {
      height: `${height}px`,
    };

    return (
      <TimelineProvider
        canvasTimeEnd={canvasTimeEnd}
        canvasTimeStart={canvasTimeStart}
        canvasWidth={canvasWidth}
        showPeriod={this.showPeriod}
        timelineUnit={minUnit}
        timelineWidth={this.state.width}
        visibleTimeEnd={visibleTimeEnd}
        visibleTimeStart={visibleTimeStart}
      >
        <TimelineMarkersProvider>
          <HeadersProvider
            leftSidebarWidth={this.props.sidebarWidth ?? defaultSidebarWidth}
            registerScroll={this.handleHeaderRef}
            rightSidebarWidth={this.props.rightSidebarWidth ?? defaultRightSidebarWidth}
            timeSteps={timeSteps}
          >
            <div
              style={{ ...defaultContainerStyle, ...(this.props.style ?? defaultStyle) }}
              ref={(el) => (this._container = el)}
              className={`react-calendar-timeline ${this.props.className ?? defaultClassName}`}
            >
              {this.renderHeaders()}
              <div style={outerComponentStyle} className="rct-outer">
                {sidebarWidth > 0 ? this.sidebar(groupHeights, canvasTop, canvasBottom) : null}
                <ScrollElement
                  getVisibleTimeWindow={this.getVisibleTimeWindow}
                  height={canvasHeight}
                  isInteractingWithItem={isInteractingWithItem}
                  onHorizontalScroll={this.scrollHorizontally}
                  onVerticalScrollBy={this.scrollVerticallyBy}
                  onWheelZoom={this.handleWheelZoom}
                  onZoom={this.changeZoom}
                  scrollHorizontallyByTime={this.scrollHorizontallyByTime}
                  scrollRef={this.getScrollElementRef}
                  top={canvasTop}
                  width={width}
                  zoomSpeed={this.props.zoomSpeed}
                >
                  <MarkerCanvas>
                    {this.columns(
                      canvasTimeStart,
                      canvasTimeEnd,
                      canvasWidth,
                      minUnit,
                      timeSteps,
                      canvasHeight
                    )}
                    {this.rows(canvasWidth, canvasTop, canvasBottom, groupHeights, groups)}
                    {this.items(
                      canvasTimeStart,
                      canvasTimeEnd,
                      canvasWidth,
                      canvasTop,
                      canvasBottom,
                      dimensionItems,
                      groupTops
                    )}
                    {this.childrenWithProps(
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
                {rightSidebarWidth > 0 ? this.rightSidebar(groupHeights, canvasTop, canvasBottom) : null}
              </div>
            </div>
          </HeadersProvider>
        </TimelineMarkersProvider>
      </TimelineProvider>
    );
  }
}
