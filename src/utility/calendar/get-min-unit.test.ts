import { defaultTimeSteps } from "../../default-config.js";
import { describe, expect, test } from "vitest";
import { getMinUnit } from "./calendar.js";

describe("getMinUnit", () => {
  // this is the happy path and used as safety net if we make any refactorings
  // to this function.  There seem to be a ton of edge cases here...
  describe("standard width of 1200", () => {
    const standardWidth = 1200;

    test("should be second for one minute duration", () => {
      const oneMinute = 1 * 60 * 1000;
      const result = getMinUnit(oneMinute, standardWidth, defaultTimeSteps);
      expect(result).toBe("second");
    });

    test("should be minute for one hour duration", () => {
      const oneHour = 60 * 60 * 1000;
      const result = getMinUnit(oneHour, standardWidth, defaultTimeSteps);
      expect(result).toBe("minute");
    });

    test("should be hour for one day duration", () => {
      const oneDay = 24 * 60 * 60 * 1000;
      const result = getMinUnit(oneDay, standardWidth, defaultTimeSteps);
      expect(result).toBe("hour");
    });

    test("should be day for one week duration", () => {
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const result = getMinUnit(oneWeek, standardWidth, defaultTimeSteps);
      expect(result).toBe("day");
    });

    test("should be day for one month duration", () => {
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      const result = getMinUnit(oneMonth, standardWidth, defaultTimeSteps);
      expect(result).toBe("day");
    });

    test("should be month for one year duration", () => {
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      const result = getMinUnit(oneYear, standardWidth, defaultTimeSteps);
      expect(result).toBe("week");
    });
  });
});
