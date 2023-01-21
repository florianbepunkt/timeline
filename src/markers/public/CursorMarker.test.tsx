import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CursorMarker } from "./CursorMarker";
import { MarkerCanvasProvider } from "../MarkerCanvasContext";
import { RenderWrapper } from "../../test-helpers";
import React from "react";
import userEvent from "@testing-library/user-event";

/**
 * CursorMarker implementation relies on MarkerCanvas to notify it when the user
 * mouses over.  On mouse over, CursorMarker is notified detail on the mouseover
 * such as date and leftOffset which is used to position the line.  These tests
 * kind of stub that behavior out but are kind of dirty...
 */

describe("<CursorMarker />", () => {
  afterEach(cleanup);

  const defaultCursorMarkerTestId = "default-cursor-marker";

  test("renders one", async () => {
    const subscribeToMouseOver = vi.fn();
    const { getByTestId } = render(
      <MarkerCanvasProvider value={{ subscribeToMouseOver }}>
        <RenderWrapper>
          <CursorMarker />
        </RenderWrapper>
      </MarkerCanvasProvider>
    );

    act(() => {
      subscribeToMouseOver.mock.calls[0][0]({ isCursorOverCanvas: true });
    });

    expect(getByTestId(defaultCursorMarkerTestId)).toBeInTheDocument();
  });

  test("renders with custom renderer", async () => {
    const customDataIdSelector = "my-custom-marker-cursor";
    const subscribeToMouseOver = vi.fn();
    const { getByTestId } = render(
      <MarkerCanvasProvider value={{ subscribeToMouseOver }}>
        <RenderWrapper>
          <CursorMarker>{() => <div data-testid={customDataIdSelector} />}</CursorMarker>
        </RenderWrapper>
      </MarkerCanvasProvider>
    );

    act(() => {
      subscribeToMouseOver.mock.calls[0][0]({ isCursorOverCanvas: true });
    });

    expect(getByTestId(customDataIdSelector)).toBeInTheDocument();
  });

  test("styles.left based on callback leftOffset", async () => {
    const subscribeToMouseOverMock = vi.fn();
    const { getByTestId } = render(
      <MarkerCanvasProvider value={{ subscribeToMouseOver: subscribeToMouseOverMock }}>
        <RenderWrapper>
          <CursorMarker />
        </RenderWrapper>
      </MarkerCanvasProvider>
    );

    const leftOffset = 1000;

    act(() => {
      subscribeToMouseOverMock.mock.calls[0][0]({
        isCursorOverCanvas: true,
        leftOffset,
      });
    });

    const el = getByTestId(defaultCursorMarkerTestId);
    expect(el).toHaveStyle({ left: `${leftOffset}px` });
  });

  test("child function is passed in date from callback", async () => {
    const subscribeToMouseOverMock = vi.fn();
    const rendererMock = vi.fn(() => null);
    render(
      <MarkerCanvasProvider value={{ subscribeToMouseOver: subscribeToMouseOverMock }}>
        <RenderWrapper>
          <CursorMarker>{rendererMock}</CursorMarker>
        </RenderWrapper>
      </MarkerCanvasProvider>
    );

    const now = Date.now();

    act(() => {
      subscribeToMouseOverMock.mock.calls[0][0]({
        isCursorOverCanvas: true,
        date: now,
      });
    });

    expect(rendererMock).toHaveBeenCalledWith({
      styles: expect.any(Object),
      date: now,
    });
  });

  test("is removed after unmount", async () => {
    const user = userEvent.setup();
    const subscribeToMouseOver = vi.fn();
    const RemoveCursorMarker: React.FC = () => {
      const [isShowing, setIsShowing] = React.useState(true);
      const toggleCustomMarker = () => setIsShowing(false);
      return (
        <MarkerCanvasProvider value={{ subscribeToMouseOver }}>
          <RenderWrapper>
            <button onClick={toggleCustomMarker}>Hide Custom Marker</button>
            {isShowing && <CursorMarker />}
          </RenderWrapper>
        </MarkerCanvasProvider>
      );
    };

    const { getByRole, getByTestId, queryByTestId } = render(<RemoveCursorMarker />);
    act(() => {
      subscribeToMouseOver.mock.calls[0][0]({
        isCursorOverCanvas: true,
      });
    });
    expect(getByTestId(defaultCursorMarkerTestId)).toBeInTheDocument();
    await user.click(getByRole("button"));
    expect(queryByTestId(defaultCursorMarkerTestId)).not.toBeInTheDocument();
  });
});
