import { calculateScrollCanvas } from "./calendar.js";
import { describe, expect, test } from "vitest";
import { items, groups } from "../../__fixtures__/itemsAndGroups.js";
import { props, state, visibleTimeStart, visibleTimeEnd } from "../../__fixtures__/stateAndProps.js";

describe("calculateScrollCanvas", () => {
  test("should calculate new scroll state", () => {
    const newStartTime = visibleTimeStart + 13 * 60 * 60 * 1000;
    const newEndTime = visibleTimeEnd + visibleTimeStart + 13 * 60 * 60 * 1000;
    const result = calculateScrollCanvas(newStartTime, newEndTime, false, items, groups, props, state);
    expect(result).toHaveProperty("visibleTimeStart");
    expect(result).toHaveProperty("visibleTimeEnd");
    expect(result).toHaveProperty("dimensionItems");
  });

  test("should calculate new scroll state correctly", () => {
    const newStartTime = visibleTimeStart + 13 * 60 * 60 * 1000;
    const newEndTime = visibleTimeEnd + 13 * 60 * 60 * 1000;
    const result = calculateScrollCanvas(newStartTime, newEndTime, false, items, groups, props, state);
    expect(result).toMatchSnapshot();
  });

  test("should skip new calculation if new visible start and visible end in canvas", () => {
    const newStartTime = visibleTimeStart + 1 * 60 * 60 * 1000;
    const newEndTime = visibleTimeEnd + 1 * 60 * 60 * 1000;
    const result = calculateScrollCanvas(newStartTime, newEndTime, false, items, groups, props, state);
    expect(result).toHaveProperty("visibleTimeStart");
    expect(result).toHaveProperty("visibleTimeEnd");
    expect(result).not.toHaveProperty("dimensionItems");
  });

  test("should force new calculation", () => {
    const newStartTime = visibleTimeStart + 1 * 60 * 60 * 1000;
    const newEndTime = visibleTimeEnd + 1 * 60 * 60 * 1000;
    const result = calculateScrollCanvas(
      newStartTime.valueOf(),
      newEndTime.valueOf(),
      true,
      items,
      groups,
      props,
      state
    );
    expect(result).toHaveProperty("visibleTimeStart");
    expect(result).toHaveProperty("visibleTimeEnd");
    expect(result).toHaveProperty("dimensionItems");
  });

  test("should calculate new state if zoom changed ", () => {
    const newStartTime = visibleTimeStart;
    const newEndTime = visibleTimeEnd + 1 * 60 * 60 * 1000;
    const result = calculateScrollCanvas(newStartTime, newEndTime, false, items, groups, props, state);
    expect(result).toHaveProperty("visibleTimeStart");
    expect(result).toHaveProperty("visibleTimeEnd");
    expect(result).toHaveProperty("dimensionItems");
  });

  test("should calculate new state if zoom changed correctly", () => {
    const newStartTime = visibleTimeStart;
    const newEndTime = visibleTimeEnd + 1 * 60 * 60 * 1000;
    const result = calculateScrollCanvas(newStartTime, newEndTime, false, items, groups, props, state);
    expect(result).toMatchSnapshot();
  });
});
