import { calculateTimeForXPosition } from "./calendar";
import { describe, expect, test } from "vitest";
import { parseISO } from "date-fns";
import { jsDateDriver } from "../js-date-driver";

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
    const expected = jsDateDriver(parseISO("2018-01-01")).add(6, "hour").valueOf();
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
    const expected = jsDateDriver(parseISO("2018-01-01")).add(18, "hour").valueOf();
    expect(actual).toBe(expected);
  });
});
