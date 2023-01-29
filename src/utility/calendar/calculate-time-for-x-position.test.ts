import { addHours } from "date-fns";
import { calculateTimeForXPosition } from "./calendar.js";
import { describe, expect, test } from "vitest";
import { parseISO } from "date-fns";

describe("calculate time for x position", () => {
  test("calculates point in middle of timeline", () => {
    const canvasStart = parseISO("2018-01-01").valueOf();
    const canvasEnd = parseISO("2018-01-03").valueOf();
    const canvasWidthInPixels = 3000;
    const currentXPositionInPixels = canvasWidthInPixels / 2;
    const actual = calculateTimeForXPosition(
      canvasStart,
      canvasEnd,
      canvasWidthInPixels,
      currentXPositionInPixels
    );

    const expected = parseISO("2018-01-02").valueOf();
    expect(actual).toBe(expected);
  });

  test("calculates point in first quarter of timeline", () => {
    const canvasStart = parseISO("2018-01-01").valueOf();
    const canvasEnd = parseISO("2018-01-02").valueOf();
    const canvasWidthInPixels = 3000;
    const currentXPositionInPixels = canvasWidthInPixels / 4;
    const actual = calculateTimeForXPosition(
      canvasStart,
      canvasEnd,
      canvasWidthInPixels,
      currentXPositionInPixels
    );
    const expected = addHours(parseISO("2018-01-01"), 6).valueOf();
    expect(actual).toBe(expected);
  });

  test("calculates point in latter quarter of timeline", () => {
    const canvasStart = parseISO("2018-01-01").valueOf();
    const canvasEnd = parseISO("2018-01-02").valueOf();
    const canvasWidthInPixels = 3000;
    const currentXPositionInPixels = canvasWidthInPixels * 0.75;
    const actual = calculateTimeForXPosition(
      canvasStart,
      canvasEnd,
      canvasWidthInPixels,
      currentXPositionInPixels
    );
    const expected = addHours(parseISO("2018-01-01"), 18).valueOf();
    expect(actual).toBe(expected);
  });
});
