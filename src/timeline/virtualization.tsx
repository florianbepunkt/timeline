import { binarySearch } from "../utility/search";
import { mapRange } from "../utility/generators";
import type { TimelineGroupBase } from "../types";

/**
 * Finds the index of the first fully visible group.
 *
 * @param {number[]} groupTops  The top coordinates of the groups in order.
 * @param {number} visibleTop  The topmost coordinate that is visible.
 *
 * @returns  The index of the first fully visible group.
 */
export const findFirstFullyVisibleGroupIndex = (groupTops: number[], visibleTop: number) =>
  binarySearch(groupTops, (groupTop) => (groupTop >= visibleTop ? 0 : -1), "leftmost");

/**
 * Calculates new vertical canvas dimensions to comfortably cover the visible area.
 *
 * @param visibleTop  The Y coordinate at the top of the visible part in pixels.
 * @param visibleHeight  The Y coordinate at the bottom of the visible part in pixels.
 *
 * @returns  The top and the bottom of the new canvas in pixels.
 */
export const getNewVerticalCanvasDimensions = (visibleTop: number, visibleHeight: number) => {
  const visibleBottom = visibleTop + visibleHeight;
  const top = visibleTop - visibleHeight;
  const bottom = visibleBottom + visibleHeight;
  return { top, bottom };
};

/**
 * Checks whether a new vertical canvas should be drawn.
 *
 * @param visibleTop  The Y coordinate at the top of the visible part in pixels.
 * @param visibleHeight  The Y coordinate at the bottom of the visible part in pixels.
 * @param canvasTop  The Y coordinate at the top of the current canvas.
 * @param canvasBottom  The Y coordinate at the bottom of the current canvas.
 *
 * @returns  True if the visible part of the chart is too close to the edge of the canvas.
 */
export const needNewVerticalCanvas = (
  visibleTop: number,
  visibleHeight: number,
  canvasTop: number,
  canvasBottom: number
) => {
  const treshold = visibleHeight * 0.5;
  const visibleBottom = visibleTop + visibleHeight;
  return visibleTop - canvasTop < treshold || canvasBottom - visibleBottom < treshold;
};

/**
 * Calculates the possibly visible groups. It will overshoot the actual number of visible
 * groups if some groups have a line height that is more than a normal line height, but
 * it guarantees that there won't be a group visible on the vertical canvas that is not
 * returned here.
 *
 * A significant assumption is that no group is smaller than a single line height.
 *
 * It should be sufficent for the user of the Timeline to only load item data for the groups
 * returned here. It would be possible (even easier) to return only the groups that are actually
 * on the canvas. However that would change more often as loading a new set of items (or even
 * just interacting with one) make some groups larger or smaller when they stack.
 *
 * @param groups  All of the groups of the Timeline.
 * @param groupTops  The calculated top position for each group in pixels.
 * @param lineHeight  The height of a single line in pixels.
 * @param canvasTop  The top position of the current vertical canvas in pixels.
 * @param canvasBottom  The bottom position of the current vertical canvas in pixels.
 */
export const calculateVisibleGroups = <CustomGroup extends TimelineGroupBase>(
  groups: CustomGroup[],
  groupTops: number[],
  lineHeight: number,
  canvasTop: number,
  canvasBottom: number
) => {
  // The previous group may also be partially visible, unless there is no
  // previous group.
  const firstGroupIndex = Math.max(0, findFirstFullyVisibleGroupIndex(groupTops, canvasTop));

  if (firstGroupIndex < 0) {
    // No visible groups at all
    return [];
  }

  const canvasHeight = canvasBottom - canvasTop;
  // Use ceil because a partially visible group is still visible and add 1 because there
  // may be a partial line on both ends.
  const lineCount = Math.ceil(canvasHeight / lineHeight) + 1;
  const lastGroupIndex = Math.min(groups.length - 1, firstGroupIndex + lineCount);

  const visibleGroupIds = Array.from(
    mapRange(firstGroupIndex, lastGroupIndex + 1, (index) => groups[index].id)
  );

  return visibleGroupIds;
};
