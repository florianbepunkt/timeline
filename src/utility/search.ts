type BinarySearchMode = "leftmost" | "any" | "rightmost";

/**
 * Binary search algorithm.
 *
 * @param items Sorted items.
 * @param compare Compare function that returns 0 if the item matches the search criteria,
 *                a negative number if the item is towards the left of the searched item,
 *                and a positive number if the item is towards the right of the searched item.
 * @param mode The desired behaviour when there are possibly multiple matches. One of
 *             "leftmost" (find the index of the leftmost matching element),
 *             "any" (find the index of one of the matching elements), and
 *             "rightmost" (find the index of the the rightmost matching element).
 *             Default value is "any".
 *
 * @returns The index of the searched item or -1 if there's no match.
 */
export function binarySearch<TItem>(
  items: TItem[],
  compare: (item: TItem, index: number) => number,
  mode: BinarySearchMode = "any"
): number {
  let start = 0;
  let end = items.length - 1;
  let match = -1;
  let mid: number;
  let cmp: number;

  while (start <= end) {
    mid = Math.floor((start + end) * 0.5);
    cmp = compare(items[mid], mid);
    if (cmp === 0) {
      match = mid;
      if (mode === "any") {
        // The result will do, stop.
        break;
      } else if (mode === "leftmost") {
        // Keep searching in the left partition.
        end = mid - 1;
      } else {
        // Keep searching in the right partition.
        start = mid + 1;
      }
    } else if (cmp < 0) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return match;
}

/**
 * Creates a slice of the given sorted array using binary search.
 *
 * @param items Sorted items.
 * @param startCompare Compare function for the start of the slice, that returns 0 if the item matches the
 *                     search criteria, a negative number if the item is towards the left of the searched
 *                     item, and a positive number if the item is towards the right of the searched item.
 * @param endCompare Compare function for the end (up to, but not including) of the slice, that returns
 *                   0 if the item matches the search criteria, a negative number if the item is towards
 *                   the left of the searched item, and a positive number if the item is towards the right
 *                   of the searched item.
 * @param startRequired Whether a starting match is required. Default is `false`, meaning that in absence
 *                      of a match, the start of the slice will be the first item of the array.
 * @param endRequired Whether an ending match is required. Default is `false`, meaning that in absence
 *                    of a match, the end of the slice will be the last item of the array.
 *
 * @returns The slice that starts with the leftmost `startCompare` match and ends with the rightmost
 *          `endCompare` match, if such a slice exists, considering all the other arguments. Otherwise
 *          `undefined` will be returned.
 */
export function binarySlice<TItem>(
  items: TItem[],
  startCompare: (item: TItem) => number,
  endCompare: (item: TItem) => number,
  startRequired = false,
  endRequired = false
): TItem[] | undefined {
  let startIndex = binarySearch(items, startCompare, "leftmost");
  if (startIndex === -1) {
    if (startRequired) return undefined;
    startIndex = 0;
  }

  let endIndex: number | undefined = binarySearch(items, endCompare, "rightmost");
  if (endIndex === -1) {
    if (endRequired) return undefined;
    endIndex = undefined;
  } else if (endIndex < startIndex) {
    return undefined;
  }
  return items.slice(startIndex, endIndex);
}
