import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { items, groups } from "../__fixtures__/itemsAndGroups";
import { props as defaultProps } from "../__fixtures__/stateAndProps";
import { Timeline } from "../timeline";
import type { ReactCalendarTimelineProps } from "../types";

const makeSut = (props: Partial<ReactCalendarTimelineProps> = {}) => {
  return [render(<Timeline {...defaultProps} items={items} groups={groups} {...props} />)] as const;
};

describe("Renders default headers correctly", () => {
  afterEach(cleanup);

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

  test("Given Timeline When not using TimelineHeaders then it should render 2 DateHeaders and a left sidebar header by default ", () => {
    const [{ getAllByTestId, getByTestId }] = makeSut();
    expect(getAllByTestId("dateHeader")).toHaveLength(2);
    expect(getByTestId("headerContainer").children).toHaveLength(2);
    expect(getByTestId("sidebarHeader")).toBeInTheDocument();
  });

  test("Given TimelineHeader When pass a rightSidebarWidthWidth Then it should render two sidebar headers", () => {
    const [{ getAllByTestId }] = makeSut({ rightSidebarWidth: 150 });
    const sidebarHeaders = getAllByTestId("sidebarHeader");
    expect(sidebarHeaders).toHaveLength(2);
    expect(sidebarHeaders[0]).toBeInTheDocument();
    expect(sidebarHeaders[1]).toBeInTheDocument();
    const { width } = getComputedStyle(sidebarHeaders[1]);
    expect(width).toBe("150px");
  });
});
