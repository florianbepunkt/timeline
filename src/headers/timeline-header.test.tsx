import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { DateHeader } from "./date-header.js";
import {
  RenderHeadersWrapper,
  renderSidebarHeaderWithCustomValues,
  renderTimelineWithLeftAndRightSidebar,
} from "../test-helpers/index.js";
import { SidebarHeader } from "./sidebar-header.js";
import { TimelineHeaders } from "./timeline-headers.js";

describe("<TimelineHeader />", () => {
  afterEach(cleanup);

  test("renders left and right sidebars", () => {
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar();
    expect(getByTestId("left-header")).toBeInTheDocument();
    expect(getByTestId("right-header")).toBeInTheDocument();
  });

  test("calendarHeaderStyle does not overridde default values for 'width' and 'overflow'", () => {
    const calendarHeaderStyle = { overflow: "unset", width: 0 };
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar({ calendarHeaderStyle });
    const headerContainer = getByTestId("headerContainer");
    const { width, overflow } = getComputedStyle(headerContainer);
    expect(overflow).not.toBe("unset");
    expect(width).not.toBe("0px");
  });

  test("renders passed calendarHeaderStyle", () => {
    const calendarHeaderStyle = { color: "white", background: "black" };
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar({ calendarHeaderStyle });
    const headerContainer = getByTestId("headerContainer");
    const { color, background } = getComputedStyle(headerContainer);
    expect(color).toBe("white");
    expect(background).toBe("black");
  });

  test("style does not override default values for 'display' and 'width'", () => {
    const style = { display: "none", width: 0 };
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar({ style });
    const rootDiv = getByTestId("headerRootDiv");
    const { width, display } = getComputedStyle(rootDiv);
    expect(display).not.toBe("none");
    expect(width).not.toBe("0px");
  });

  test("Given TimelineHeader When pass style Then it should it be added to root`s styles", () => {
    const style = { color: "white", background: "black" };
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar({ style });
    const rootDiv = getByTestId("headerRootDiv");
    const { color, background } = getComputedStyle(rootDiv);
    expect(color).toBe("white");
    expect(background).toBe("black");
  });

  test("Given TimelineHeader When pass calendarHeaderClassName Then it should be applied to the date header container", () => {
    const calendarHeaderClassName = "testClassName";
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar({ calendarHeaderClassName });
    expect(getByTestId("headerContainer")).toHaveClass("testClassName");
  });

  test("Given TimelineHeader When no calendarHeaderClassName specified Then undefined should not be applied to the date header container", () => {
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar();
    expect(getByTestId("headerContainer")).not.toHaveClass("undefined");
  });

  test("Given TimelineHeader When pass className Then it should be applied to the root header container", () => {
    const className = "testClassName";
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar({ className });
    expect(getByTestId("headerRootDiv")).toHaveClass("testClassName");
  });

  test("Given TimelineHeader When no className specified Then undefined should not be applied to the root header container", () => {
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar();
    expect(getByTestId("headerRootDiv")).not.toHaveClass("undefined");
  });

  test("Given TimelineHeader When rendered Then it should render the default styles of the date header container", () => {
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar();
    const headerContainer = getByTestId("headerContainer");
    const { overflow } = getComputedStyle(headerContainer);
    expect(overflow).toBe("hidden");
    // The JSDOM will not fire the calc css function
  });

  test("Given TimelineHeader When rendered Then it should render the default styles of the rootStyle", () => {
    const { getByTestId } = renderTimelineWithLeftAndRightSidebar();
    const rootDiv = getByTestId("headerRootDiv");
    const { width, display } = getComputedStyle(rootDiv);
    expect(display).toBe("flex");
    expect(width).toBe("100%");
  });

  test("Given SidebarHeader When passing no variant prop Then it should rendered above the left sidebar", () => {
    const { getByTestId, getAllByTestId } = renderSidebarHeaderWithCustomValues();
    expect(getByTestId("sidebarHeader")).toBeInTheDocument();
    expect(getByTestId("sidebarHeader").nextElementSibling).toHaveAttribute(
      "data-testid",
      "headerContainer"
    );
    expect(getAllByTestId("sidebarHeader")).toHaveLength(1);
  });

  test("Given SidebarHeader When passing variant prop with left value Then it should rendered above the left sidebar", () => {
    const { getByTestId, getAllByTestId } = renderSidebarHeaderWithCustomValues({ variant: "left" });
    expect(getByTestId("sidebarHeader")).toBeInTheDocument();
    expect(getByTestId("sidebarHeader").nextElementSibling).toHaveAttribute(
      "data-testid",
      "headerContainer"
    );
    expect(getAllByTestId("sidebarHeader")).toHaveLength(1);
  });

  test("Given SidebarHeader When passing variant prop with right value Then it should rendered above the right sidebar", () => {
    const { getByTestId, getAllByTestId, debug } = renderSidebarHeaderWithCustomValues({
      variant: "right",
    });
    expect(getAllByTestId("sidebarHeader")[0]).toBeInTheDocument();
    expect(getAllByTestId("sidebarHeader")).toHaveLength(2);
    expect(getAllByTestId("sidebarHeader")[1].previousElementSibling).toHaveAttribute(
      "data-testid",
      "headerContainer"
    );
  });

  test("Given SidebarHeader When passing variant prop with unusual value Then it should rendered above the left sidebar by default", () => {
    const { getByTestId } = renderSidebarHeaderWithCustomValues();
    expect(getByTestId("sidebarHeader")).toBeInTheDocument();
    expect(getByTestId("sidebarHeader").nextElementSibling).toHaveAttribute(
      "data-testid",
      "headerContainer"
    );
  });

  /**
   * Testing The Example Provided In The Docs
   */
  test("Given TimelineHeader When pass a headers as children Then it should render them correctly", () => {
    const { getByText, rerender, queryByText } = render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <SidebarHeader>
            {({ getRootProps }) => {
              return <div {...getRootProps()}>Left</div>;
            }}
          </SidebarHeader>
          <SidebarHeader variant="right">
            {({ getRootProps }) => {
              return (
                <div data-testid="right" {...getRootProps()}>
                  Right
                </div>
              );
            }}
          </SidebarHeader>
          <DateHeader style={{ height: 50 }} />
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );
    expect(getByText("Left")).toBeInTheDocument();
    expect(getByText("Right")).toBeInTheDocument();
    rerender(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <SidebarHeader>
            {({ getRootProps }) => {
              return <div {...getRootProps()}>Left</div>;
            }}
          </SidebarHeader>
          <DateHeader style={{ height: 50 }} />
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );
    expect(queryByText("Right")).toBeNull();
  });
});
