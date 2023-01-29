import { addDays, addMinutes } from "date-fns";
import { describe, expect, test } from "vitest";
import { getGroupOrders, getVisibleItems } from "./calendar.js";

const itemTimeEndKey = "endTime" as const;
const itemTimeStartKey = "startTime" as const;
const keys = { itemTimeStartKey, itemTimeEndKey };

describe("getVisibleItems", () => {
  test("returns items within date range - both dates", () => {
    const startRange = addDays(new Date(), -1).valueOf();
    const endRange = addDays(startRange, 1).valueOf();
    const items = [
      {
        [itemTimeStartKey]: addMinutes(startRange, 10).valueOf(),
        [itemTimeEndKey]: addMinutes(startRange, 20).valueOf(),
        id: 1,
        group: "1",
      },
    ];

    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject(items);
  });

  test("returns items within date range - start date", () => {
    const startRange = addDays(new Date(), -1).valueOf();
    const endRange = addDays(startRange, 1).valueOf();
    const items = [
      {
        [itemTimeStartKey]: addMinutes(endRange, -10).valueOf(),
        [itemTimeEndKey]: addMinutes(endRange, 20).valueOf(),
        id: 1,
        group: "1",
      },
    ];
    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject(items);
  });

  test("returns items within date range - end date", () => {
    const startRange = addDays(new Date(), -1).valueOf();
    const endRange = addDays(startRange, 1).valueOf();
    const items = [
      {
        [itemTimeStartKey]: addMinutes(endRange, -10).valueOf(),
        [itemTimeEndKey]: addMinutes(endRange, 20).valueOf(),
        id: 1,
        group: "1",
      },
    ];
    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject(items);
  });

  test("does not return items outside of date range - before start date", () => {
    const startRange = addDays(new Date(), -1).valueOf();
    const endRange = addDays(startRange, 1).valueOf();
    const items = [
      {
        [itemTimeStartKey]: addDays(startRange, -2).valueOf(),
        [itemTimeEndKey]: addDays(startRange, -1).valueOf(),
        id: 1,
        group: "1",
      },
    ];

    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject([]);
  });

  test("does not return items outside of date range - after end date", () => {
    const startRange = addDays(new Date(), -1).valueOf();
    const endRange = addDays(startRange, 1).valueOf();
    const items = [
      {
        [itemTimeStartKey]: addDays(endRange, 1).valueOf(),
        [itemTimeEndKey]: addDays(endRange, 2).valueOf(),
        id: 1,
        group: "1",
      },
    ];
    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject([]);
  });
});
