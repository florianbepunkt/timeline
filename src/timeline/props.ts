import type {
  Id,
  MoveResizeValidator,
  ReactCalendarGroupRendererProps,
  ReactCalendarItemRendererProps,
  ResizeOptions,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemEdge,
  TimeSteps,
} from "../types";
import React from "react";
import type { Locale } from "date-fns";
import type { TimelineContext } from ".";

export type TimelineProps<
  CustomItem extends TimelineItemBase = TimelineItemBase,
  CustomGroup extends TimelineGroupBase = TimelineGroupBase
> = {
  children?: React.ReactElement | React.ReactElement[];

  /**
   * Groups items are sorted into. If you use the right sidebar, you can pass optional rightTitle property here. If you want to overwrite the calculated height with a custom height, you can pass a height property as an int in pixels here. This can be very useful for categorized groups.
   */
  groups: CustomGroup[];

  /**
   * Items that are rendered on the timeline. The preferred (fastest) option is to give JS timestamps for start and end time
   */
  items: CustomItem[];

  /**
   * Whether to calculate extra space to the right and left of an item. The calculated value is returned as part of the item context.
   */
  calculateExtraSpace?: boolean;

  /**
   * Can items be moved between groups? Can be overridden in the items array. Defaults to true
   */
  canChangeGroup?: boolean;

  /**
   * Can items be dragged around? Can be overridden in the items array. Defaults to true
   */
  canMove?: boolean;

  /**
   * Can items be resized? Can be overridden in the items array. Accepted values: false, "left", "right", "both". Defaults to "right". If you pass true, it will be treated as "right" to not break compatibility with versions 0.9 and below.
   */
  canResize?: ResizeOptions;

  /**
   * Additional class names as a string for the root Timeline element.
   */
  className?: string;

  /**
   * How many pixels we can drag the background for it to be counted as a click on the background. Default 3
   */
  clickTolerance?: number;

  /**
   * Unless overridden by visibleTimeStart and visibleTimeEnd, specify where the calendar begins and where it ends.
   * You need to provide either defaultTimeStart/End or visibleTimeStart/End for the timeline to function.
   */
  defaultTimeEnd?: Date | number;

  /**
   * Unless overridden by visibleTimeStart and visibleTimeEnd, specify where the calendar begins and where it ends.
   * You need to provide either defaultTimeStart/End or visibleTimeStart/End for the timeline to function.
   */
  defaultTimeStart?: Date | number;

  /**
   * Snapping unit when dragging items. Defaults to 15 * 60 * 1000 or 15min. When so, the items will snap to 15min intervals when dragging.
   */
  dragSnap?: number;
  itemHeight?: number;

  /**
   * Normally tapping (touching) an item selects it. If this is set to true, a tap will have the same effect, as selecting with the first click and then clicking again to open and send the onItemClick event. Defaults to false.
   */
  itemTouchSendsClick?: boolean;

  /**
   * Height of one line in the calendar in pixels. Default 30
   */
  lineHeight?: number;

  /**
   * Locale for formatting dates
   */
  locale?: Locale;

  /**
   * Largest time the calendar can zoom to in milliseconds. Default 5 * 365.24 * 86400 * 1000 (5 years)
   */
  maxZoom?: number;

  /**
   * The minimum width, in pixels, of a timeline entry when it's possible to resize. If not reached, you must zoom in to resize more. Default to 20.
   */
  minResizeWidth?: number;

  /**
   * Smallest time the calendar can zoom to in milliseconds. Default 60 * 60 * 1000 (1 hour)
   * Please note than second won't show up unless you change this to 60 * 1000
   */
  minZoom?: number;

  /**
   * This function is called when an item is being moved or resized. It's up to this function to return a new version of `change`, when the proposed move would violate business logic.
   *
   * The argument action is one of `move` or `resize`.
   *
   * The argument `resizeEdge` is when resizing one of `left` or `right`.
   *
   * The argument `time` describes the proposed new time for either the start time of the item (for move) or the start or end time (for resize).
   *
   * The function must return a new unix timestamp in milliseconds... or just `time` if the proposed new time doesn't interfere with business logic.
   *
   * For example, to prevent moving of items into the past, but to keep them at 15min intervals, use this code:
   *
   * ```ts
   * function (action, item, time, resizeEdge) {
   *   if (time < new Date().getTime()) {
   *     var newTime = Math.ceil(new Date().getTime() / (15*60*1000)) * (15*60*1000);
   *     return newTime;
   *   }
   *
   *   return time
   * }
   * ```
   */
  moveResizeValidator?: MoveResizeValidator<CustomItem>;

  /**
   * Everything passed here will be displayed above the right sidebar. Use this to display small filters or so. Defaults to null.
   */
  rightSidebarContent?: React.ReactNode;

  /**
   * Width of the right sidebar in pixels. If set to 0, the right sidebar is not rendered. Defaults to 0.
   */
  rightSidebarWidth?: number;

  /**
   * Ref callback that gets a DOM reference to the scroll body element. Can be useful to programmatically scroll.
   */
  scrollRef?: React.RefCallback<HTMLElement>;

  /**
   * An array with id's corresponding to id's in items (item.id). If this prop is set you have to manage the selected items yourself within the onItemSelect handler to update the property with new id's and use onItemDeselect handler to clear selection. This overwrites the default behaviour of selecting one item on click.
   */
  selected?: Id[];

  /**
   * Everything passed here will be displayed above the left sidebar. Use this to display small filters or so. Defaults to null.
   */
  sidebarContent?: React.ReactNode;

  /**
   * Width of the sidebar in pixels. If set to 0, the sidebar is not rendered. Defaults to 150.
   */
  sidebarWidth?: number;

  /**
   * Stack items under each other, so there is no visual overlap when times collide. Can be overridden in the groups array. Defaults to false. Requires millisecond or Moment timestamps, not native JavaScript Date objects.
   */
  stackItems?: boolean;

  /**
   * With what step to display different units. E.g. 15 for minute means only minutes 0, 15, 30 and 45 will be shown.
   */
  timeSteps?: TimeSteps;

  /**
   * Append a special .rct-drag-right handle to the elements and only resize if dragged from there. Defaults to false
   */
  useResizeHandle?: boolean;

  /**
   * This function is called when the vertical line is rendered. start and end are unix timestamps in milliseconds for the current column. The function should return an array of strings containing the classNames which should be applied to the column. This makes it possible to visually highlight e.g. public holidays or office hours. An example could look like (see: demo/vertical-classes):
   *
   * ```ts
   * verticalLineClassNamesForTime = (timeStart, timeEnd) => {
   *   const currentTimeStart = moment(timeStart)
   *   const currentTimeEnd = moment(timeEnd)
   *   for (let holiday of holidays) {
   *     if (
   *       holiday.isSame(currentTimeStart, 'day') &&
   *       holiday.isSame(currentTimeEnd, 'day')
   *     ) {
   *       return ['holiday']
   *     }
   *   }
   * }
   * ```
   */
  verticalLineClassNamesForTime?: ((start: number, end: number) => string[]) | undefined;

  /**
   * The exact viewport of the calendar. When these are specified, scrolling in the calendar must be orchestrated by the onTimeChange function.
   * You need to provide either defaultTimeStart/End or visibleTimeStart/End for the timeline to function.
   */
  visibleTimeEnd?: number;

  /**
   * The exact viewport of the calendar. When these are specified, scrolling in the calendar must be orchestrated by the onTimeChange function.
   * You need to provide either defaultTimeStart/End or visibleTimeStart/End for the timeline to function.
   */
  visibleTimeStart?: number;
  zoomSpeed?: { alt: number; ctrl: number; meta: number };

  // Fields that are in propTypes but not documented
  headerRef?: React.RefCallback<HTMLElement>;
  canSelect?: boolean; // This was missing from the original type
  style?: React.CSSProperties; // This was missing from the original type

  /**
   * React component that will be used to render the content of groups in the sidebar. Will be passed the group and isRightSidebar as props.
   *
   * ```ts
   * let groups = [
   *   {
   *     id: 1,
   *     title: 'Title',
   *     tip: 'additional information'
   *   }
   * ]
   * groupRenderer = ({ group }) => {
   *   return (
   *     <div className="custom-group">
   *       <span className="title">{group.title}</span>
   *       <p className="tip">{group.tip}</p>
   *     </div>
   *   )
   * }
   * ```
   *
   * @param props
   * @returns
   */
  groupRenderer?: (props: ReactCalendarGroupRendererProps<CustomGroup>) => React.ReactNode;

  /**
   * This function is called when the horizontal line is rendered. group is the group which will be rendered into the current row. The function should return an array of strings containing the classNames which should be applied to the row. This makes it possible to visually highlight categories or important items. An example could look like:
   *
   * ```ts
   * horizontalLineClassNamesForGroup={(group) => group.root ? ["row-root"] : []}
   * ```
   * @param group
   * @returns
   */
  horizontalLineClassNamesForGroup?: (group: CustomGroup) => string[];

  /**
   * Render prop function used to render a customized item. The function provides multiple parameters that can be used to render each item.
   *
   * Parameters provided to the function has two types: context params which have the state of the item and timeline, and prop getters functions
   *
   * @param props
   * @returns
   */
  itemRenderer?: (props: ReactCalendarItemRendererProps<CustomItem, CustomGroup>) => React.ReactElement;

  /**
   * Called when the bounds in the calendar's canvas change. Use it for example to load new data to display. (see "Behind the scenes" below). `canvasTimeStart` and `canvasTimeEnd` are unix timestamps in milliseconds.
   *
   * @param canvasTimeStart
   * @param canvasTimeEnd
   */
  onBoundsChange?(canvasTimeStart: number, canvasTimeEnd: number): any;

  /**
   * Called when an empty spot on the canvas was clicked. Get the group ID and the time as arguments. For example open a "new item" window after this.
   * @param groupId
   * @param time
   * @param e
   */
  onCanvasClick?(groupId: Id, time: number, e: React.SyntheticEvent): void;

  /**
   * Called when the canvas is clicked by the right button of the mouse. Note: If this property is set the default context menu doesn't appear
   * @param groupId
   * @param time
   * @param e
   */
  onCanvasContextMenu?(groupId: Id, time: number, e: React.SyntheticEvent): void;

  /**
   * Called when an empty spot on the canvas was double clicked. Get the group ID and the time as arguments.
   * @param groupId
   * @param time
   * @param e
   */
  onCanvasDoubleClick?(groupId: Id, time: number, e: React.SyntheticEvent): void;
  onCanvasDrop?(groupId: Id, time: number, e: React.DragEvent): void;

  /**
   * Called when an item is clicked. Note: the item must be selected before it's clicked... except if it's a touch event and itemTouchSendsClick is enabled. time is the time that corresponds to where you click on the item in the timeline.
   * @param itemId
   * @param e
   * @param time
   */
  onItemClick?(itemId: Id, e: React.SyntheticEvent, time: number): void;

  /**
   * Called when the item is clicked by the right button of the mouse. time is the time that corresponds to where you context click on the item in the timeline. Note: If this property is set the default context menu doesn't appear.
   * @param itemId
   * @param e
   * @param time
   */
  onItemContextMenu?(itemId: Id, e: React.SyntheticEvent, time: number): void;

  /**
   * Called when deselecting an item. Used to clear controlled selected prop.
   * @param e
   */
  onItemDeselect?(e: React.SyntheticEvent): void;

  /**
   * Called when an item was double clicked. time is the time that corresponds to where you double click on the item in the timeline.
   * @param itemId
   * @param e
   * @param time
   */
  onItemDoubleClick?(itemId: Id, e: React.SyntheticEvent, time: number): void;

  /**
   * Called when an item is moving or resizing.
   * @param itemDragObject
   */
  onItemDrag?(itemDragObject: OnItemDragObjectMove | OnItemDragObjectResize): void;

  /**
   * Callback when an item is moved. Returns 1) the item's ID, 2) the new start time and 3) the index of the new group in the groups array.
   * @param itemId
   * @param dragTime
   * @param newGroupOrder
   */
  onItemMove?(itemId: Id, dragTime: number, newGroupOrder: number): void;

  /**
   * Callback when an item is resized. Returns 1) the item's ID, 2) the new start or end time of the item 3) The edge that was dragged (left or right)
   *
   * @param itemId
   * @param endTimeOrStartTime
   * @param edge
   */
  onItemResize?(itemId: Id, endTimeOrStartTime: number, edge: TimelineItemEdge): void;

  /**
   * Called when an item is selected. This is sent on the first click on an item. time is the time that corresponds to where you click/select on the item in the timeline.
   *
   * @param itemId
   * @param e
   * @param time
   */
  onItemSelect?(itemId: Id, e: any, time: number): void;

  /**
   * A function that's called when the user tries to scroll. Call the passed `updateScrollCanvas(start, end)` with the updated visibleTimeStart and visibleTimeEnd (as unix timestamps in milliseconds) to change the scroll behavior, for example to limit scrolling.
   * Here is an example that limits the timeline to only show dates starting 6 months from now and ending in 6 months.
   *
   * ```ts
   * const minTime = moment().add(-6, 'months').valueOf()
   * const maxTime = moment().add(6, 'months').valueOf()
   * function (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) {
   *   if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
   *     updateScrollCanvas(minTime, maxTime)
   *   } else if (visibleTimeStart < minTime) {
   *     updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
   *   } else if (visibleTimeEnd > maxTime) {
   *     updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
   *   } else {
   *     updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
   *   }
   * }
   * ```
   *
   * @param visibleTimeStart
   * @param visibleTimeEnd
   * @param updateScrollCanvas
   */
  onTimeChange?(
    visibleTimeStart: number,
    visibleTimeEnd: number,
    updateScrollCanvas: (start: number, end: number) => void
  ): any;

  onVisibleGroupsChanged?(visibleGroupIds: Id[]): void;

  /**
   * Called when the timeline is zoomed, either via mouse/pinch zoom or clicking header to change timeline units
   * @param timelineContext
   */
  onZoom?(
    timelineContext: Pick<
      TimelineContext,
      "canvasTimeEnd" | "canvasTimeStart" | "timelineWidth" | "visibleTimeEnd" | "visibleTimeStart"
    >
  ): void;
};

type OnItemDragObjectBase = {
  eventType: "move" | "resize";
  itemId: Id;
  time: number;
};

type OnItemDragObjectMove = OnItemDragObjectBase & {
  eventType: "move";
  newGroupOrder: number;
};

type OnItemDragObjectResize = OnItemDragObjectBase & {
  eventType: "resize";
  edge?: TimelineItemEdge;
};
