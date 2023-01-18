import React from "react";
import { MarkerCanvasProvider } from "./MarkerCanvasContext";
import TimelineMarkersRenderer from "./TimelineMarkersRenderer";
import { TimelineStateConsumer } from "../timeline/timeline-state-context";

// expand to fill entire parent container (ScrollElement)
const staticStyles: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

type MarkerCanvasProps = {
  getDateFromLeftOffsetPosition: (leftOffset: number) => number;
};

type MarkerCanvasState = {
  subscribeToMouseOver: (
    callback: (value: { leftOffset: number; date: number; isCursorOverCanvas: boolean }) => void
  ) => () => void;
};

/**
 * Renders registered markers and exposes a mouse over listener for
 * CursorMarkers to subscribe to
 */
class MarkerCanvas extends React.Component<
  React.PropsWithChildren<MarkerCanvasProps>,
  MarkerCanvasState
> {
  private _containerEl: HTMLDivElement | null = null;
  private _subscription:
    | ((value: { leftOffset: number; date: number; isCursorOverCanvas: boolean }) => void)
    | null = null;

  constructor(props: React.PropsWithChildren<MarkerCanvasProps>) {
    super(props);
    this.state = {
      subscribeToMouseOver: this.handleMouseMoveSubscribe,
    };
  }

  handleMouseMove = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (this._subscription !== null) {
      const { pageX } = evt;

      if (this._containerEl === null) {
        // This should never happen
        return;
      }

      // FIXME: dont use getBoundingClientRect. Use passed in scroll amount
      const { left: containerLeft } = this._containerEl.getBoundingClientRect();

      // number of pixels from left we are on canvas
      // we do this calculation as pageX is based on x from viewport whereas
      // our canvas can be scrolled left and right and is generally outside
      // of the viewport.  This calculation is to get how many pixels the cursor
      // is from left of this element
      const canvasX = pageX - containerLeft;
      const date = this.props.getDateFromLeftOffsetPosition(canvasX);
      this._subscription({
        leftOffset: canvasX,
        date,
        isCursorOverCanvas: true,
      });
    }
  };

  handleMouseLeave = () => {
    if (this._subscription !== null) {
      // tell subscriber that we're not on canvas
      this._subscription({ leftOffset: 0, date: 0, isCursorOverCanvas: false });
    }
  };

  handleMouseMoveSubscribe = (
    sub: (value: { leftOffset: number; date: number; isCursorOverCanvas: boolean }) => void
  ) => {
    this._subscription = sub;
    return () => {
      this._subscription = null;
    };
  };

  render() {
    return (
      <MarkerCanvasProvider value={this.state}>
        <div
          style={staticStyles}
          onMouseMove={this.handleMouseMove}
          onMouseLeave={this.handleMouseLeave}
          ref={(el) => (this._containerEl = el)}
        >
          <TimelineMarkersRenderer />
          {this.props.children}
        </div>
      </MarkerCanvasProvider>
    );
  }
}

const MarkerCanvasWrapper = (
  props: React.PropsWithChildren<{
    /* empty */
  }>
) => (
  <TimelineStateConsumer>
    {({ getDateFromLeftOffsetPosition }) => (
      <MarkerCanvas getDateFromLeftOffsetPosition={getDateFromLeftOffsetPosition} {...props} />
    )}
  </TimelineStateConsumer>
);

export default MarkerCanvasWrapper;
