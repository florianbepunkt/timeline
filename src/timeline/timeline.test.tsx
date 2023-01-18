import { beforeAll, describe, expect, test, vi } from "vitest";
import { noop } from "../test-helpers";
import { render } from "@testing-library/react";
import { Timeline } from "./timeline";
import { visibleTimeStart, visibleTimeEnd } from "../../__fixtures__/stateAndProps";

describe("<Timeline />", () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {
        // do nothing
      }
      unobserve() {
        // do nothing
      }
      disconnect() {
        // do nothing
      }
    };
  });

  describe("initialiation", () => {
    test("sets the visibleTime properties to defaultTime props", () => {
      const props = {
        items: [],
        groups: [],
        defaultTimeStart: visibleTimeStart,
        defaultTimeEnd: visibleTimeEnd,
      };

      expect(() => render(<Timeline {...props} />)).not.toThrowError();
    });

    test("sets the visibleTime properties to visibleTime props", () => {
      const props = {
        items: [],
        groups: [],
        visibleTimeStart,
        visibleTimeEnd,
      };

      expect(() => render(<Timeline {...props} />)).not.toThrowError();
    });

    test("throws error if neither visibleTime or defaultTime props are passed", () => {
      const props = {
        items: [],
        groups: [],
        visibleTimeStart: undefined,
        visibleTimeEnd: undefined,
        defaultTimeStart: undefined,
        defaultTimeEnd: undefined,
      };
      vi.spyOn(global.console, "error").mockImplementation(noop);
      expect(() => render(<Timeline {...props} />)).toThrow(
        'You must provide either "defaultTimeStart" and "defaultTimeEnd" or "visibleTimeStart" and "visibleTimeEnd" to initialize the Timeline'
      );
      vi.restoreAllMocks();
    });
  });
});
