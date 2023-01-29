import { describe, expect, test } from "vitest";
import { getNextUnit } from "./calendar.js";

//what value do these tests have? :)
describe("getNextUnit", () => {
  test("second to minute", () => {
    const result = getNextUnit("second");
    expect(result).toBe("minute");
  });

  test("minute to hour", () => {
    const result = getNextUnit("minute");
    expect(result).toBe("hour");
  });

  test("hour to day", () => {
    const result = getNextUnit("hour");
    expect(result).toBe("day");
  });

  test("day to week", () => {
    const result = getNextUnit("day");
    expect(result).toBe("week");
  });

  test("week to month", () => {
    const result = getNextUnit("week");
    expect(result).toBe("month");
  });

  test("month to year", () => {
    const result = getNextUnit("month");
    expect(result).toBe("year");
  });

  test("year to year", () => {
    const result = getNextUnit("year");
    expect(result).toBe("year");
  });

  test("unknown value to throw error", () => {
    expect(() => getNextUnit("foo" as any)).toThrow();
  });
});
