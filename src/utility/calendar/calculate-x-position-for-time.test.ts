import { calculateXPositionForTime } from "./calendar";
import { describe, expect, test } from "vitest";
import { jsDateDriver } from "../js-date-driver";
import { startOfDay } from "date-fns";

describe("calculateXPositionForTime", () => {
  const width = 1000;
  const startTime = 100000;
  const endTime = 200000;

  test("returns time in middle of timeline", () => {
    const time = startTime + (endTime - startTime) * 0.5;
    const result = calculateXPositionForTime(startTime, endTime, width, time);
    expect(result).toBe(500);
  });

  test("returns time in the first quarter of timeline", () => {
    const time = startTime + (endTime - startTime) * 0.25;
    const result = calculateXPositionForTime(startTime, endTime, width, time);
    expect(result).toBe(250);
  });

  test("returns time in the middle of timeline with actual date", () => {
    const today = startOfDay(new Date());
    const startTime = today.valueOf();
    const endTime = jsDateDriver(today).add(1, "day").valueOf();
    const time = startTime + (endTime - startTime) * 0.5;
    const result = calculateXPositionForTime(startTime, endTime, width, time);
    expect(result).toBe(500);
  });
});
