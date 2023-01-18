import { DateDriver, dateDriver } from "../date-driver";
import type {
  CompleteTimeSteps,
  Id,
  ITimeSteps,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemEdge,
  TimeUnit,
} from "../../types";

export type GroupOrder<TGroup extends TimelineGroupBase> = { index: number; group: TGroup };

export type GroupOrders<TGroup extends TimelineGroupBase> = Record<string | number, GroupOrder<TGroup>>;

export type VerticalDimensions = {
  collisionLeft: number;
  collisionWidth: number;
  left: number;
  width: number;
};

export type Dimensions<TGroup extends TimelineGroupBase> = VerticalDimensions & {
  extraSpaceLeft: number | null;
  extraSpaceRight: number | null;
  height: number;
  order: GroupOrder<TGroup>;
  stack: boolean;
  top: number | null;
};

export type ItemDimensions<TGroup extends TimelineGroupBase> = {
  dimensions: Dimensions<TGroup>;
  id: Id;
};

// the smallest cell we want to render is 17px
// this can be manipulated to make the breakpoints change more/less
// i.e. on zoom how often do we switch to the next unit of time
// i think this is the distance between cell lines
export const minCellWidth = 17;

/**
 * Calculate the ms / pixel ratio of the timeline.
 *
 * @param canvasTimeStart The millisecond value at the left edge of the canvas.
 * @param canvasTimeEnd The millisecond value at the right edge of the canvas.
 * @param canvasWidth The width of the canvas in pixels.
 *
 * @returns The time represented by a single pixel on the canvas in milliseconds.
 */
export function millisecondsInPixel(
  canvasTimeStart: number,
  canvasTimeEnd: number,
  canvasWidth: number
): number {
  return (canvasTimeEnd - canvasTimeStart) / canvasWidth;
}

/**
 * Calculate the X position on the canvas for a given time.
 *
 * @param canvasTimeStart The millisecond value at the left edge of the canvas.
 * @param canvasTimeEnd The millisecond value at the right edge of the canvas.
 * @param canvasWidth The width of the canvas in pixels.
 * @param time The time to get the X position for.
 *
 * @returns The X position on the canvas representing the given time in pixels.
 */
export function calculateXPositionForTime(
  canvasTimeStart: number,
  canvasTimeEnd: number,
  canvasWidth: number,
  time: number
): number {
  const widthToZoomRatio = canvasWidth / (canvasTimeEnd - canvasTimeStart);
  const timeOffset = time - canvasTimeStart;

  return timeOffset * widthToZoomRatio;
}

/**
 * For a given x position (leftOffset) in pixels, calculate time based on
 * timeline state (timeline width in px, canvas time range).
 *
 * @param canvasTimeStart The millisecond value at the left edge of the canvas.
 * @param canvasTimeEnd The millisecond value at the right edge of the canvas.
 * @param canvasWidth The width of the canvas in pixels.
 * @param leftOffset The X position in pixels to calculate the time for.
 *
 * @returns The time represented by the given X position (leftOffset).
 */
export function calculateTimeForXPosition(
  canvasTimeStart: number,
  canvasTimeEnd: number,
  canvasWidth: number,
  leftOffset: number
): number {
  const timeToPxRatio = millisecondsInPixel(canvasTimeStart, canvasTimeEnd, canvasWidth);
  const timeFromCanvasTimeStart = timeToPxRatio * leftOffset;

  return timeFromCanvasTimeStart + canvasTimeStart;
}

/**
 * Iterates over time units in a time window and yields the start and end of the time unit
 * at each step.
 *
 * For example it yield every time instant that represents the beginning of a day between
 * two dates. The first yield will include the start time, so it could easily represent an
 * interval that actually starts before the start time. The last yielded interval will
 * similarly include the end time.
 *
 * @param start Where the iteration starts in milliseconds.
 * @param end Where the iteration ends in milliseconds.
 * @param unit The unit of the iteration (for example days).
 * @param timeSteps An object describing how many steps to go in each iteration depending on the unit.
 */
export function* generateTimes(
  start: number,
  end: number,
  unit: TimeUnit,
  timeSteps: ITimeSteps
): Generator<[DateDriver, DateDriver], void, void> {
  let time = dateDriver(start).startOf(unit);
  const steps = timeSteps[unit] ?? 1;

  // If we need to go more steps in an iteration (like iterate every 30 minutes), we need to find the
  // last "whole" time before the start. So if start is at 2022.05.05.10:34, we will iterate like
  // 2022.05.05.10:30, 2022.05.05.11:00 and so on (and not 2022.05.05.10:34, 2022.05.05.11:04, ...).
  if (steps > 1) {
    const value = time.get(unit);
    time.set(unit, value - (value % steps));
  }

  // The actual iteration
  while (time.valueOf() < end) {
    const nextTime = dateDriver(time.valueOf()).add(steps, unit);
    yield [time, nextTime];
    time = nextTime;
  }
}

/**
 * Iterates over time units in a time window and calls a callback at each step. For example it
 * calls the callback with every time instant that represents the beginning of a day between
 * two dates. The first call of the callback function will include the start time, so it could
 * easily represent an interval that actually starts before the start time. The last interval
 * to call the callback function will similarly include the end time.
 *
 * @param start Where the iteration starts in milliseconds.
 * @param end Where the iteration ends in milliseconds.
 * @param unit The unit of the iteration (for example days).
 * @param timeSteps An object describing how many steps to go in each iteration depending on the unit.
 * @param callback The callback that will be called in each iteration.
 */
export function iterateTimes(
  start: number,
  end: number,
  unit: TimeUnit,
  timeSteps: ITimeSteps,
  callback: (time: DateDriver, nextTime: DateDriver) => void
): void {
  for (const [time, nextTime] of generateTimes(start, end, unit, timeSteps)) {
    callback(time, nextTime);
  }
}

const millisecondsIn: CompleteTimeSteps = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

/**
 * Determine the current rendered time unit based on timeline time span.
 *
 * This function is VERY HOT as its used in Timeline.js render function.
 *
 * @param zoom Difference between time start and time end of timeline canvas (in milliseconds).
 * @param width Width of timeline canvas (in pixels).
 * @param timeSteps Map of time units with number to indicate step of each unit.
 */
export function getMinUnit(zoom: number, width: number, timeSteps: ITimeSteps) {
  let currentUnit: TimeUnit = "second";

  do {
    const stepForCurrentUnit = timeSteps[currentUnit] ?? 1;
    const millisecondsInCurrentUnit = millisecondsIn[currentUnit] * stepForCurrentUnit;
    const numberOfCurrentUnitInDuration = zoom / millisecondsInCurrentUnit;
    const cellWidthForCurrentUnit = width / numberOfCurrentUnitInDuration;

    if (cellWidthForCurrentUnit > minCellWidth) {
      break;
    }
    currentUnit = getNextUnit(currentUnit);
  } while (currentUnit !== "year");

  return currentUnit;
}

const nextTimeUnitMap: Record<TimeUnit, TimeUnit> = {
  second: "minute",
  minute: "hour",
  hour: "day",
  day: "week",
  week: "month",
  month: "year",
  year: "year",
};

/**
 * Returns the next, one step longer time unit.
 *
 * @param unit The time unit to get the next unit for.
 * @returns The time unit that is one step longer or the longest time unit.
 */
export function getNextUnit(unit: TimeUnit): TimeUnit {
  const v = nextTimeUnitMap[unit];
  if (!v) throw new Error(`Failed to get next unit for ${unit}`);
  return nextTimeUnitMap[unit];
}

/**
 * Get the new start and new end time of item that is being
 * dragged or resized.
 *
 * @param itemTimeStart original item time in milliseconds
 * @param itemTimeEnd original item time in milliseconds
 * @param dragTime new start time if item is dragged in milliseconds
 * @param isDragging is item being dragged
 * @param isResizing is item being resized
 * @param resizingEdge resize edge
 * @param resizeTime new resize time in milliseconds
 */
function calculateInteractionNewTimes({
  itemTimeStart,
  itemTimeEnd,
  dragTime,
  isDragging,
  isResizing,
  resizingEdge,
  resizeTime,
}: {
  itemTimeStart: number;
  itemTimeEnd: number;
  dragTime: number | null;
  isDragging: boolean;
  isResizing: boolean;
  resizingEdge: TimelineItemEdge | null;
  resizeTime: number | null;
}) {
  const originalItemRange = itemTimeEnd - itemTimeStart;
  const itemStart = isResizing && resizingEdge === "left" ? resizeTime : itemTimeStart;
  const itemEnd = isResizing && resizingEdge === "right" ? resizeTime : itemTimeEnd;
  return [
    isDragging && dragTime !== null ? dragTime : itemStart,
    isDragging && dragTime !== null ? dragTime + originalItemRange : itemEnd,
  ];
}

/**
 * Calculates the vertical dimension of an item on the chart.
 *
 * @param itemTimeStart The start time of the item in milliseconds.
 * @param itemTimeEnd The end time of the item in milliseconds.
 * @param canvasTimeStart The start time of the canvas in milliseconds.
 * @param canvasTimeEnd The end time of the canvas in milliseconds.
 * @param canvasWidth The width of the canvas in pixels.
 *
 * @returns The dimensions of the item where left is the start position on the canvas in pixels, width is also measured in pixels,
 *          collisionLeft is the start time in milliseconds, collisionWidth is the duration in milliseconds.
 */
function calculateDimensions({
  itemTimeStart,
  itemTimeEnd,
  canvasTimeStart,
  canvasTimeEnd,
  canvasWidth,
}: {
  itemTimeStart: number;
  itemTimeEnd: number;
  canvasTimeStart: number;
  canvasTimeEnd: number;
  canvasWidth: number;
}): VerticalDimensions {
  const itemTimeRange = itemTimeEnd - itemTimeStart;

  // restrict startTime and endTime to be bounded by canvasTimeStart and canvasTimeEnd
  const effectiveStartTime = Math.max(itemTimeStart, canvasTimeStart);
  const effectiveEndTime = Math.min(itemTimeEnd, canvasTimeEnd);

  const left = calculateXPositionForTime(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    effectiveStartTime
  );
  const right = calculateXPositionForTime(canvasTimeStart, canvasTimeEnd, canvasWidth, effectiveEndTime);
  const itemWidth = right - left;

  const dimensions = {
    left: left,
    width: Math.max(itemWidth, 3),
    collisionLeft: itemTimeStart,
    collisionWidth: itemTimeRange,
  };

  return dimensions;
}

/**
 * Get the order of groups based on their keys.
 *
 * @param groups Array of groups.
 *
 * @returns Ordered hash from group ids to the group index in the array and the group itself.
 */
export function getGroupOrders<TGroup extends TimelineGroupBase>(groups: TGroup[]): GroupOrders<TGroup> {
  const groupOrders: GroupOrders<TGroup> = {};

  for (let i = 0; i < groups.length; i++) {
    groupOrders[groups[i].id] = { index: i, group: groups[i] };
  }

  return groupOrders;
}

/**
 * Adds items relevant to each group to the result of getGroupOrders
 *
 * @param items List of all items.
 * @param groupOrders The result of `getGroupOrders`.
 */
function getGroupedItems<TGroup extends TimelineGroupBase>(
  items: ItemDimensions<TGroup>[],
  groupOrders: GroupOrders<TGroup>
) {
  const groupedItems: { index: number; group: TGroup; items: ItemDimensions<TGroup>[] }[] = [];
  const keys = Object.keys(groupOrders);
  // Initialize with result object for each group
  for (let i = 0; i < keys.length; i++) {
    const groupOrder = groupOrders[keys[i]];
    groupedItems.push({
      index: groupOrder.index,
      group: groupOrder.group,
      items: [],
    });
  }

  // Populate groups
  for (let i = 0; i < items.length; i++) {
    if (items[i].dimensions.order !== undefined) {
      const groupItem = groupedItems[items[i].dimensions.order.index];
      if (groupItem) {
        groupItem.items.push(items[i]);
      }
    }
  }

  return groupedItems;
}

/**
 * Filters timeline items to those that should be visible on the horizontal canvas. Items that are completely
 * outside of it will be dropped, as well as items that are not belonging to a defined group.
 *
 * @param items The timeline items to filter.
 * @param canvasTimeStart The start time of the canvas in milliseconds.
 * @param canvasTimeEnd The end time of the canvas in milliseconds.
 * @param groupOrders The result of `getGroupOrders`.
 *
 * @returns The filtered list of timeline items.
 */
export function getVisibleItems<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>(
  items: TItem[],
  canvasTimeStart: number,
  canvasTimeEnd: number,
  groupOrders: GroupOrders<TGroup>
) {
  return items.filter((item) => {
    return (
      groupOrders[item.group] !== undefined &&
      item.startTime <= canvasTimeEnd &&
      item.endTime >= canvasTimeStart
    );
  });
}

const EPSILON = 0.001;

/**
 * Calculates whether two items are colliding on the chart.
 * @param a  The dimensions of the first item. Its 'top' should not be null when this function is called.
 * @param b  The dimensions of the second item. Its 'top' should not be null when this function is called.
 * @param collisionPadding  A small collision padding, so touching items don't collide due to a rounding error.
 *
 * @returns  True if the two items overlap.
 */
function collision<TGroup extends TimelineGroupBase>(
  a: Dimensions<TGroup>,
  b: Dimensions<TGroup>,
  collisionPadding = EPSILON
): boolean {
  if (a.top === null || b.top === null) {
    // This function should not be called before the item top is set for both items.
    return false;
  }
  // 2d collisions detection - https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  const verticalMargin = 0;

  return (
    a.collisionLeft + collisionPadding < b.collisionLeft + b.collisionWidth &&
    a.collisionLeft + a.collisionWidth - collisionPadding > b.collisionLeft &&
    a.top - verticalMargin + collisionPadding < b.top + b.height &&
    a.top + a.height + verticalMargin - collisionPadding > b.top
  );
}

/**
 * Calculate the position of a given item for a group that is being stacked.
 *
 * @param lineHeight  The height of a line in pixels.
 * @param item  The item to calculate the position for.
 * @param group  All the items in the same group as 'item'.
 * @param groupHeight  The current group height in pixels (calculated by previously stacked items).
 * @param groupTop  The top position of the group in pixels.
 * @param itemIndex  The index of the 'item' within 'group'.
 *
 * @returns  A potentially increased group height.
 */
function groupStack<TGroup extends TimelineGroupBase>(
  lineHeight: number,
  item: ItemDimensions<TGroup>,
  group: ItemDimensions<TGroup>[],
  groupHeight: number,
  groupTop: number,
  itemIndex: number
): number {
  // calculate non-overlapping positions
  let curHeight = groupHeight;
  const verticalMargin = (lineHeight - item.dimensions.height) * 0.5;
  if (item.dimensions.stack && item.dimensions.top === null) {
    item.dimensions.top = groupTop + verticalMargin;
    curHeight = Math.max(curHeight, lineHeight);
    let collidingItem: ItemDimensions<TGroup> | null;
    do {
      collidingItem = null;
      //Items are placed from i=0 onwards, only check items with index < i
      for (let j = itemIndex - 1; j >= 0; j--) {
        const other = group[j];
        if (
          other.dimensions.top !== null &&
          other.dimensions.stack &&
          collision(item.dimensions, other.dimensions)
        ) {
          collidingItem = other;
          break;
        } else {
          // console.log('dont test', other.top !== null, other !== item, other.stack);
        }
      }

      if (collidingItem !== null) {
        // There is a collision. Reposition the items above the colliding element
        // collidingItem.dimensions.top is never null here - added the check to make typescript happy
        item.dimensions.top = (collidingItem.dimensions.top ?? 0) + lineHeight;
        curHeight = Math.max(
          curHeight,
          item.dimensions.top + item.dimensions.height + verticalMargin - groupTop
        );
      }
    } while (collidingItem);
  }
  return curHeight;
}

/**
 * Calculate the position of an item for a group that is not being stacked.
 *
 * @param lineHeight  The height of a line in pixels.
 * @param item  The item to calculate the position for.
 * @param groupHeight  The current group height in pixels (calculated by previously stacked items).
 * @param groupTop  The top position of the group in pixels.
 *
 * @returns  A potentially increased group height.
 */
function groupNoStack<TGroup extends TimelineGroupBase>(
  lineHeight: number,
  item: ItemDimensions<TGroup>,
  groupHeight: number,
  groupTop: number
): number {
  const verticalMargin = (lineHeight - item.dimensions.height) * 0.5;
  if (item.dimensions.top === null) {
    item.dimensions.top = groupTop + verticalMargin;
    groupHeight = Math.max(groupHeight, lineHeight);
  }
  return groupHeight;
}

/**
 * Stack all groups.
 *
 * @param itemsDimensions  The dimensions of items to be stacked.
 * @param groupOrders  The groupOrders object.
 * @param lineHeight  The height of a single line in pixels.
 * @param stackItems  Whether items should be stacked by default.
 *
 * @returns  The height of the whole chart, the height of each group, and the top position of each group.
 */
function stackAll<TGroup extends TimelineGroupBase>(
  itemsDimensions: ItemDimensions<TGroup>[],
  groupOrders: GroupOrders<TGroup>,
  lineHeight: number,
  stackItems: boolean
) {
  const groupHeights: number[] = [];
  const groupTops: number[] = [];
  let currentHeight = 0;

  const groupedItems = getGroupedItems(itemsDimensions, groupOrders);

  for (const index in groupedItems) {
    const groupItems = groupedItems[index];
    const { items: itemsDimensions, group } = groupItems;
    const groupTop = currentHeight;

    // Is group being stacked?
    const isGroupStacked = group.stackItems ?? stackItems;
    const groupHeight = stackGroup(itemsDimensions, isGroupStacked, lineHeight, groupTop);

    groupTops.push(groupTop);
    // If group height is overridden, push new height
    // Do this late as item position still needs to be calculated
    let effectiveGroupHeight: number;
    if (group.height) {
      effectiveGroupHeight = group.height;
    } else {
      effectiveGroupHeight = Math.max(groupHeight, lineHeight);
    }
    currentHeight += effectiveGroupHeight;
    groupHeights.push(effectiveGroupHeight);
  }

  return {
    height: currentHeight,
    groupHeights,
    groupTops,
  };
}

/**
 * Calculates the position of each item in a group.
 *
 * @param itemsDimensions  The dimensions of each item in the group.
 * @param isGroupStacked  Whether items in the group should stack.
 * @param lineHeight  The line height in pixels.
 * @param groupTop  The top position of the group.
 *
 * @returns  The calculated height of the group.
 */
function stackGroup<TGroup extends TimelineGroupBase>(
  itemsDimensions: ItemDimensions<TGroup>[],
  isGroupStacked: boolean,
  lineHeight: number,
  groupTop: number
): number {
  let groupHeight = 0;
  // Find positions for each item in group
  for (let itemIndex = 0; itemIndex < itemsDimensions.length; itemIndex++) {
    if (isGroupStacked) {
      groupHeight = groupStack(
        lineHeight,
        itemsDimensions[itemIndex],
        itemsDimensions,
        groupHeight,
        groupTop,
        itemIndex
      );
    } else {
      groupHeight = groupNoStack(lineHeight, itemsDimensions[itemIndex], groupHeight, groupTop);
    }
  }
  return groupHeight;
}

/**
 * Calculates the extra space to the left and to the right of an item. The extra space is the space to
 * the next item in the same row and is measured in pixels. The calculated value will be set on the
 * itemDimensions directly. If an item does not have a next (or previous) item in the row, the corresponding
 * extra space will be set to null.
 *
 * @param itemsDimensions  The item dimensions (after the position of all items are calculated).
 * @param shouldCalculateByDefault  Whether to calculate the space if the item's group doesn't specify.
 */
function calculateSpaceBetweenItems<TGroup extends TimelineGroupBase>(
  itemsDimensions: ItemDimensions<TGroup>[],
  shouldCalculateByDefault: boolean
) {
  for (let itemIndex = 0; itemIndex < itemsDimensions.length; itemIndex++) {
    const itemDimension = itemsDimensions[itemIndex].dimensions;
    const shouldCalculateExtraSpaceForItem =
      itemDimension.order.group.calculateExtraSpace ?? shouldCalculateByDefault;
    if (!shouldCalculateExtraSpaceForItem) {
      // Here we rely on the fact that the default behaviour can only be changed for a whole group,
      // and not individual items. Only because of this assumption is it safe to skip the whole loop
      // here.
      // For better understanding, consider a case when one item in a group doesn't need the calculation,
      // but the other does. Since here we set the extraSpaceLeft on the other item in this loop as well,
      // skipping this based on only one item would be a problem.
      // If later we want to allow different settings in the same group, we should update the logic here.
      continue;
    }
    for (let otherIndex = 0; otherIndex < itemsDimensions.length; otherIndex++) {
      if (itemIndex === otherIndex) {
        continue;
      }
      const otherDimension = itemsDimensions[otherIndex].dimensions;

      if (otherDimension.left + otherDimension.width < itemDimension.left + itemDimension.width) {
        // The other item is to the left of this item
        continue;
      }

      if ((otherDimension.top ?? 0) + otherDimension.height < (itemDimension.top ?? 0)) {
        // The other item is above this item
        continue;
      }

      if ((otherDimension.top ?? 0) > (itemDimension.top ?? 0) + itemDimension.height) {
        // The other item is below this item
        continue;
      }

      // Calculate the extra space we have until we reach this item
      const extraSpaceRightToOther = Math.max(
        0,
        otherDimension.left - (itemDimension.left + itemDimension.width)
      );

      // Update extraSpaceRight on this item
      if (itemDimension.extraSpaceRight === null) {
        itemDimension.extraSpaceRight = extraSpaceRightToOther;
      } else {
        itemDimension.extraSpaceRight = Math.min(itemDimension.extraSpaceRight, extraSpaceRightToOther);
      }

      // Update extraSpaceLeft on the other item
      if (otherDimension.extraSpaceLeft === null) {
        otherDimension.extraSpaceLeft = extraSpaceRightToOther;
      } else {
        otherDimension.extraSpaceLeft = Math.min(otherDimension.extraSpaceLeft, extraSpaceRightToOther);
      }
    }
  }
}

/**
 * Stack the items that will be visible within the canvas area.
 */
export function stackTimelineItems<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>({
  calculateExtraSpace,
  canvasTimeEnd,
  canvasTimeStart,
  canvasWidth,
  draggingItem,
  dragTime,
  groups,
  itemHeight,
  items,
  lineHeight,
  newGroupOrder,
  resizeTime,
  resizingEdge,
  resizingItem,
  stackItems,
}: {
  calculateExtraSpace: boolean;

  /**
   * The end time of the canvas in milliseconds.
   */
  canvasTimeEnd: number;

  /**
   * The start time of the canvas in milliseconds.
   */
  canvasTimeStart: number;

  /**
   * The width of the canvas in pixels.
   */
  canvasWidth: number;

  /**
   * The id of the item being dragged.
   */
  draggingItem: Id | null;

  /**
   * The current drag position in milliseconds.
   */
  dragTime: number | null;

  /**
   * All the groups on the chart.
   */
  groups: TGroup[];

  /**
   * The of a single item in pixels.
   */
  itemHeight: number;

  /**
   * All the items on the chart.
   */
  items: TItem[];

  /**
   * The height of a single line in pixels.
   */
  lineHeight: number;

  /**
   * The index of the group the dragged item is being dragged to.
   */
  newGroupOrder: number | null;

  /**
   * The current resize position in milliseconds.
   */
  resizeTime: number | null;

  /**
   * Whether the resized item is resized on the left or the right edge.
   */
  resizingEdge: TimelineItemEdge | null;

  /**
   * The id of the item being resized.
   */
  resizingItem: Id | null;

  /**
   * Whether items should be stacked by default.
   */
  stackItems: boolean;
}) {
  // Get the order of groups based on their id key
  const groupOrders = getGroupOrders(groups);
  const visibleItems = getVisibleItems(items, canvasTimeStart, canvasTimeEnd, groupOrders);
  const visibleItemsWithInteraction = visibleItems.map((item) =>
    getItemWithInteractions({
      item,
      draggingItem,
      resizingItem,
      dragTime,
      resizingEdge,
      resizeTime,
      groups,
      newGroupOrder,
    })
  );

  // if there are no groups return an empty array of dimensions
  if (groups.length === 0) {
    return {
      dimensionItems: [],
      height: 0,
      groupHeights: [],
      groupTops: [],
    };
  }

  const dimensionItems = visibleItemsWithInteraction.map((item) =>
    getItemDimensions({
      item,
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      groupOrders,
      itemHeight,
    })
  );

  // Get a new array of groupOrders holding the stacked items
  const { height, groupHeights, groupTops } = stackAll(
    dimensionItems,
    groupOrders,
    lineHeight,
    stackItems
  );

  calculateSpaceBetweenItems(dimensionItems, calculateExtraSpace);
  return { dimensionItems, height, groupHeights, groupTops };
}

/**
 * Get canvas width from visible width.
 *
 * @param width  The visible width in pixels.
 * @param buffer  The buffer ratio - 3 by default, so the actual canvas will be 3 times as wide.
 */
export function getCanvasWidth(width: number, buffer = 3) {
  return width * buffer;
}

/**
 * Get item's position, dimensions and collisions.
 *
 * @param item  The item to get the dimensions for.
 * @param canvasTimeStart  The time at the left edge of the canvas in milliseconds.
 * @param canvasTimeEnd  The time at the right edge of the canvas in milliseconds.
 * @param canvasWidth  The width of the canvas in pixels.
 * @param groupOrders  The group orders.
 * @param lineHeight  The height of a row in pixels.
 * @param itemHeight  The height of a single item in pixels.
 *
 * @returns  The calculated dimensions the item.
 */
function getItemDimensions<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>({
  item,
  canvasTimeStart,
  canvasTimeEnd,
  canvasWidth,
  groupOrders,
  itemHeight,
}: {
  item: TItem;
  canvasTimeStart: number;
  canvasTimeEnd: number;
  canvasWidth: number;
  groupOrders: GroupOrders<TGroup>;
  itemHeight: number;
}): { id: Id; dimensions: Dimensions<TGroup> } {
  const itemId = item.id;
  const verticalDimensions: VerticalDimensions = calculateDimensions({
    itemTimeStart: item.startTime,
    itemTimeEnd: item.endTime,
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
  });

  const dimensions = {
    ...verticalDimensions,
    top: null,
    order: groupOrders[item.group],
    // Disabled the undocumented magic that if an item has an isOverlay=true property we won't stack it.
    // stack: !item.isOverlay;
    stack: true,
    height: itemHeight,
    extraSpaceRight: null,
    extraSpaceLeft: null,
  };
  return {
    id: itemId,
    dimensions,
  };
}

/**
 * Get new item with changed  `itemTimeStart` , `itemTimeEnd` and `itemGroupKey` according
 * to user interaction (dragging an item or resizing left or right).
 *
 * @param item  The item to check.
 * @param draggingItem  The id of the item being dragged.
 * @param resizingItem  The id of the item being resized.
 * @param dragTime  The current drag position in milliseconds.
 * @param resizingEdge  Whether the resized item is resized on the left or the right edge.
 * @param resizeTime  The current resize position in milliseconds.
 * @param groups  The groups of the chart.
 * @param newGroupOrder  The index of the group the dragged item is being dragged into.
 *
 * @returns  A new item object with updated properties.
 */
function getItemWithInteractions<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>({
  item,
  draggingItem,
  resizingItem,
  dragTime,
  resizingEdge,
  resizeTime,
  groups,
  newGroupOrder,
}: {
  item: TItem;
  draggingItem: Id | null;
  resizingItem: Id | null;
  dragTime: number | null;
  resizingEdge: TimelineItemEdge | null;
  resizeTime: number | null;
  groups: TGroup[];
  newGroupOrder: number | null;
}) {
  if (!resizingItem && !draggingItem) return item;
  const itemId = item.id;
  const isDragging = itemId === draggingItem;
  const isResizing = itemId === resizingItem;
  const [itemTimeStart, itemTimeEnd] = calculateInteractionNewTimes({
    itemTimeStart: item.startTime,
    itemTimeEnd: item.endTime,
    isDragging,
    isResizing,
    dragTime,
    resizingEdge,
    resizeTime,
  });
  const newItem = {
    ...item,
    startTime: itemTimeStart,
    endTime: itemTimeEnd,
    // The `newGroupOrder` will be never `null` when the `isDragging` is true
    group: isDragging && newGroupOrder !== null ? groups[newGroupOrder].id : item.group,
  };
  return newItem;
}

/**
 * Get canvas start and end time from visible start and end time.
 *
 * @param visibleTimeStart  The visible start time in milliseconds.
 * @param visibleTimeEnd  The visible end time in milliseconds.
 */
export function getCanvasBoundariesFromVisibleTime(visibleTimeStart: number, visibleTimeEnd: number) {
  const zoom = visibleTimeEnd - visibleTimeStart;
  const canvasTimeStart = visibleTimeStart - zoom;
  const canvasTimeEnd = visibleTimeEnd + zoom;
  return [canvasTimeStart, canvasTimeEnd];
}

/**
 * Get the canvas area for a given visible time. Will shift the start/end of
 * the canvas if the visible time does not fit within the existing canvas.
 *
 * @param visibleTimeStart  The visible start time in milliseconds.
 * @param visibleTimeEnd  The visible end time in milliseconds.
 * @param forceUpdateDimensions  Whether to force a new canvas even if the visible
 *                               time window would fit into the existing one.
 * @param items  All the items of the timeline.
 * @param groups  All the groups of the timeline.
 * @param props  The props of the Timeline.
 * @param state  The state of the Timeline.
 *
 * @returns  An object containing some updates to the state of the Timeline.
 */
export function calculateScrollCanvas<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>(
  visibleTimeStart: number,
  visibleTimeEnd: number,
  forceUpdateDimensions: boolean,
  items: TItem[],
  groups: TGroup[],
  props: any,
  state: any
) {
  const oldCanvasTimeStart = state.canvasTimeStart;
  const oldZoom = state.visibleTimeEnd - state.visibleTimeStart;
  const newZoom = visibleTimeEnd - visibleTimeStart;
  const newState: {
    visibleTimeStart: number;
    visibleTimeEnd: number;
    canvasTimeStart?: number;
    canvasTimeEnd?: number;
  } = { visibleTimeStart, visibleTimeEnd };

  // Check if the current canvas covers the new times
  const canKeepCanvas =
    newZoom === oldZoom &&
    visibleTimeStart >= oldCanvasTimeStart + oldZoom * 0.5 &&
    visibleTimeStart <= oldCanvasTimeStart + oldZoom * 1.5 &&
    visibleTimeEnd >= oldCanvasTimeStart + oldZoom * 1.5 &&
    visibleTimeEnd <= oldCanvasTimeStart + oldZoom * 2.5;

  if (!canKeepCanvas || forceUpdateDimensions) {
    const [canvasTimeStart, canvasTimeEnd] = getCanvasBoundariesFromVisibleTime(
      visibleTimeStart,
      visibleTimeEnd
    );
    newState.canvasTimeStart = canvasTimeStart;
    newState.canvasTimeEnd = canvasTimeEnd;
    const mergedState = {
      ...state,
      ...newState,
    };

    const canvasWidth = getCanvasWidth(mergedState.width);

    // The canvas cannot be kept, so calculate the new items position
    Object.assign(
      newState,
      stackTimelineItems({
        calculateExtraSpace: props.calculateExtraSpace,
        canvasTimeEnd: mergedState.canvasTimeEnd,
        canvasTimeStart: mergedState.canvasTimeStart,
        canvasWidth,
        draggingItem: mergedState.draggingItem,
        dragTime: mergedState.dragTime,
        groups,
        itemHeight: props.itemHeight,
        items,
        lineHeight: props.lineHeight,
        newGroupOrder: mergedState.newGroupOrder,
        resizeTime: mergedState.resizeTime,
        resizingEdge: mergedState.resizingEdge,
        resizingItem: mergedState.resizingItem,
        stackItems: props.stackItems,
      })
    );
  }
  return newState;
}
