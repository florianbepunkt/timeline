import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { RenderWrapper } from "../../test-helpers";
import { TodayMarker } from "./TodayMarker";
import React from "react";
import type { TodayMarkerProps } from "../../types";

const makeSut = (props: Partial<TodayMarkerProps> = {}) => {
  return [
    render(
      <RenderWrapper>
        <TodayMarker {...props} />
      </RenderWrapper>
    ),
    {
      ...props,
    },
  ] as const;
};

describe("<TodayMarker />", () => {
  afterEach(cleanup);

  test("is present", () => {
    const [{ getByTestId }] = makeSut();
    expect(getByTestId("default-today-line")).toBeInTheDocument();
  });

  test("is removed after initial render", () => {
    const RemoveTodayMarker: React.FC = () => {
      const [isShowing, setIsShowing] = React.useState(true);
      const toggleTodayMarker = () => setIsShowing(false);
      return (
        <RenderWrapper>
          <button onClick={toggleTodayMarker}>Hide Today</button>
          {isShowing && <TodayMarker date={Date.now()} />}
        </RenderWrapper>
      );
    };

    const { queryByTestId, getByText } = render(<RemoveTodayMarker />);
    expect(queryByTestId("default-today-line")).toBeInTheDocument();
    fireEvent.click(getByText("Hide Today"));
    expect(queryByTestId("default-today-line")).not.toBeInTheDocument();
  });

  test("allows for custom renderer", () => {
    const dataTestId = "custom-today-renderer";
    const [{ getByTestId }] = makeSut({ children: () => <div data-testid={dataTestId} /> });
    expect(getByTestId(dataTestId)).toBeInTheDocument();
  });

  test("custom renderer is passed styles and date", () => {
    const renderMock = vi.fn(() => null);
    makeSut({ children: renderMock });
    expect(renderMock).toHaveBeenCalledWith({
      date: expect.any(Number),
      styles: expect.any(Object),
    });
  });

  // TODO: find good way to test these interval based functionality
  // xit('sets setInterval timeout based on passed in prop')
  // xit('sets setInterval timeout to 10 seconds if no interval prop passed in')
});
