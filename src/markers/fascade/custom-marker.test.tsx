import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { CustomMarker } from "./custom-marker";
import { RenderWrapper } from "../../test-helpers";
import React from "react";

describe("<CustomMarker />", () => {
  afterEach(cleanup);

  test("renders one", () => {
    const { getByTestId } = render(
      <RenderWrapper>
        <CustomMarker id="test" date={1000} />
      </RenderWrapper>
    );
    expect(getByTestId("default-customer-marker-id")).toBeInTheDocument();
  });

  test("render multiple", () => {
    const { queryAllByTestId } = render(
      <RenderWrapper>
        <CustomMarker id="test1" date={1000} />
        <CustomMarker id="test2" date={1010} />
        <CustomMarker id="test3" date={1020} />
      </RenderWrapper>
    );

    expect(queryAllByTestId("default-customer-marker-id").length).toBe(3);
  });

  test("renders with custom renderer", () => {
    const customDataIdSelector = "my-custom-marker";
    const { getByTestId } = render(
      <RenderWrapper>
        <CustomMarker id="test" date={1000}>
          {() => <div data-testid={customDataIdSelector} />}
        </CustomMarker>
      </RenderWrapper>
    );
    expect(getByTestId(customDataIdSelector)).toBeInTheDocument();
  });

  test("is passed styles with left corresponding to passed in date", () => {
    const oneDay = 1000 * 60 * 60 * 24;
    const canvasWidth = 3000;
    const now = Date.now();
    const visibleTimeStart = now;
    const visibleTimeEnd = now + oneDay;
    const timelineState = {
      canvasTimeEnd: visibleTimeEnd + oneDay,
      canvasTimeStart: visibleTimeStart - oneDay,
      canvasWidth,
      showPeriod: () => {},
      timelineUnit: "day" as const,
      timelineWidth: 1000,
      visibleTimeEnd,
      visibleTimeStart,
    };

    const markerDate = now + oneDay / 2;
    const { getByTestId } = render(
      <RenderWrapper timelineState={timelineState}>
        <CustomMarker id="test" date={markerDate} />
      </RenderWrapper>
    );

    const el = getByTestId("default-customer-marker-id");
    expect(el).toHaveStyle(`left: ${3000 / 2}px`);
  });

  test("is removed after unmount", () => {
    const RemoveCustomMarker: React.FC = () => {
      const [isShowing, setIsShowing] = React.useState(true);
      const toggleCustomMarker = () => setIsShowing(false);
      return (
        <RenderWrapper>
          <button onClick={toggleCustomMarker}>Hide Custom Marker</button>
          {isShowing && <CustomMarker id="test" date={1000} />}
        </RenderWrapper>
      );
    };

    const { queryByTestId, getByText } = render(<RemoveCustomMarker />);
    expect(queryByTestId("default-customer-marker-id")).toBeInTheDocument();
    fireEvent.click(getByText("Hide Custom Marker"));
    expect(queryByTestId("default-customer-marker-id")).not.toBeInTheDocument();
  });

  test("updates marker location after passing new date", () => {
    const { getByTestId, rerender } = render(
      <RenderWrapper>
        <CustomMarker id="test" date={1000} />
      </RenderWrapper>
    );

    const positionLeftBeforeChange = getByTestId("default-customer-marker-id").style.left;

    rerender(
      <RenderWrapper>
        <CustomMarker id="test" date={2000} />
      </RenderWrapper>
    );

    const positionLeftAfterChange = getByTestId("default-customer-marker-id").style.left;
    expect(positionLeftBeforeChange).not.toEqual(positionLeftAfterChange);
  });
});
