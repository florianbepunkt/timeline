import { describe, expect, test } from "vitest";
import { getGroupOrders, getVisibleItems } from "./calendar";
import { jsDateDriver } from "../js-date-driver";

const itemTimeEndKey = "endTime" as const;
const itemTimeStartKey = "startTime" as const;
const keys = { itemTimeStartKey, itemTimeEndKey };

describe("getVisibleItems", () => {
  test("returns items within date range - both dates", () => {
    const startRange = jsDateDriver().add(-1, "day").valueOf();
    const endRange = jsDateDriver(startRange).add(1, "day").valueOf();
    const items = [
      {
        [itemTimeStartKey]: jsDateDriver(startRange).add(10, "minute").valueOf(),
        [itemTimeEndKey]: jsDateDriver(startRange).add(20, "minute").valueOf(),
        id: 1,
        group: "1",
      },
    ];

    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject(items);
  });

  test("returns items within date range - start date", () => {
    const startRange = jsDateDriver().add(-1, "day").valueOf();
    const endRange = jsDateDriver(startRange).add(1, "day").valueOf();
    const items = [
      {
        [itemTimeStartKey]: jsDateDriver(endRange).add(-10, "minute").valueOf(),
        [itemTimeEndKey]: jsDateDriver(endRange).add(20, "minute").valueOf(),
        id: 1,
        group: "1",
      },
    ];
    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject(items);
  });

  test("returns items within date range - end date", () => {
    const startRange = jsDateDriver().add(-1, "day").valueOf();
    const endRange = jsDateDriver(startRange).add(1, "day").valueOf();
    const items = [
      {
        [itemTimeStartKey]: jsDateDriver(startRange).add(-10, "minute").valueOf(),
        [itemTimeEndKey]: jsDateDriver(startRange).add(10, "minute").valueOf(),
        id: 1,
        group: "1",
      },
    ];
    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject(items);
  });

  test("does not return items outside of date range - before start date", () => {
    const startRange = jsDateDriver().add(-1, "day").valueOf();
    const endRange = jsDateDriver(startRange).add(1, "day").valueOf();
    const items = [
      {
        [itemTimeStartKey]: jsDateDriver(startRange).add(-2, "day").valueOf(),
        [itemTimeEndKey]: jsDateDriver(startRange).add(-1, "day").valueOf(),
        id: 1,
        group: "1",
      },
    ];

    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject([]);
  });

  test("does not return items outside of date range - after end date", () => {
    const startRange = jsDateDriver().add(-1, "day").valueOf();
    const endRange = jsDateDriver(startRange).add(1, "day").valueOf();
    const items = [
      {
        [itemTimeStartKey]: jsDateDriver(endRange).add(1, "day").valueOf(),
        [itemTimeEndKey]: jsDateDriver(endRange).add(2, "day").valueOf(),
        id: 1,
        group: "1",
      },
    ];
    const groupOrders = getGroupOrders([{ id: "1", title: "1" }]);
    const result = getVisibleItems(items, startRange, endRange, groupOrders);
    expect(result).toMatchObject([]);
  });
});
