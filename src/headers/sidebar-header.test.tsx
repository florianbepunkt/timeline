import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { DateHeader } from "./date-header";
import { RenderHeadersWrapper, renderSidebarHeaderWithCustomValues } from "../test-helpers";
import { SidebarHeader } from "./sidebar-header";
import { TimelineHeaders } from "./timeline-headers";

describe("<SidebarHeader />", () => {
  afterEach(cleanup);

  test("style does not overridde default values for 'width'", () => {
    const props = { style: { width: 250 } };
    const { getByTestId } = renderSidebarHeaderWithCustomValues({ props });
    const { width } = getComputedStyle(getByTestId("sidebarHeader"));
    expect(width).not.toBe("250px");
  });

  test("renders style", () => {
    const props = { style: { color: "white" } };
    const { getByTestId } = renderSidebarHeaderWithCustomValues({ props });
    const { color } = getComputedStyle(getByTestId("sidebarHeader"));
    expect(color).toBe("white");
  });

  test("renders using render function", () => {
    const renderer = vi.fn().mockImplementation(({ getRootProps }) => (
      <div data-testid="leftSidebarHeader" {...getRootProps()}>
        Left
      </div>
    ));

    const { getByTestId } = render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <SidebarHeader>{renderer}</SidebarHeader>
          <DateHeader />
          <DateHeader />
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    expect(renderer).toHaveBeenCalled();
    expect(getByTestId("leftSidebarHeader")).toBeInTheDocument();
  });

  test("props passed to SidebarHeader are passed to the render function", () => {
    const extraProps = { someData: "data" };
    const renderer = vi.fn().mockImplementation(({ getRootProps }) => (
      <div data-testid="leftSidebarHeader" {...getRootProps()}>
        Left
      </div>
    ));

    render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <SidebarHeader headerData={extraProps}>{renderer}</SidebarHeader>
          <DateHeader />
          <DateHeader />
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    expect(renderer).toHaveBeenCalled();
    expect(renderer.mock.calls[0][0].data).toBe(extraProps);
  });

  //  Testing The Example In The Docs
  test("renders SidebarHeader correctly in the timeline", () => {
    const { getByTestId } = render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <SidebarHeader>
            {({ getRootProps }) => {
              return (
                <div data-testid="leftSidebarHeader" {...getRootProps()}>
                  Left
                </div>
              );
            }}
          </SidebarHeader>
          <SidebarHeader variant="right">
            {({ getRootProps }) => {
              return (
                <div data-testid="rightSidebarHeader" {...getRootProps()}>
                  Right
                </div>
              );
            }}
          </SidebarHeader>
          <DateHeader />
          <DateHeader />
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    expect(getByTestId("leftSidebarHeader")).toBeInTheDocument();
    expect(getByTestId("rightSidebarHeader")).toBeInTheDocument();
    expect(getByTestId("leftSidebarHeader").nextElementSibling).toHaveAttribute(
      "data-testid",
      "headerContainer"
    );
    expect(getByTestId("rightSidebarHeader").previousElementSibling).toHaveAttribute(
      "data-testid",
      "headerContainer"
    );
  });
});
