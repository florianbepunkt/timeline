export const arraysEqual = (array1: unknown[], array2: unknown[]) =>
  array1.length === array2.length && array1.every((element, index) => element === array2[index]);

/**
 * Collects the given list of items into a record by their keys.
 *
 * Note: item keys must be unique.
 *
 * @param items The items to collect into the record.
 * @param getKey Function that returns the key of an item.
 *
 * @returns The create key -> item record.
 */
export const keyBy = <TItem>(items: TItem[], getKey: (item: TItem) => string | number) => {
  const result: Record<string | number, TItem> = {};
  items.forEach((item) => {
    result[getKey(item)] = item;
  });
  return result;
};

export const noop = () => {};
