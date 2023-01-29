import { MarkerCanvasContext } from "./marker-canvas-context.js";
import { MarkersRenderer } from "./markers-renderer.js";
import { TimelineContext } from "../timeline/index.js";
import React from "react";
import type { SubscriptionCallback } from "./model.js";

export type MarkerCanvasProps = { children: React.ReactNode | React.ReactNode[] };

/**
 * Renders registered markers and exposes a mouse over listener for
 * CursorMarkers to subscribe to
 */
export const MarkerCanvas: React.FC<MarkerCanvasProps> = ({ children }) => {
  const timelineCtx = React.useContext(TimelineContext);
  if (!timelineCtx) throw new Error("MarkerCanvas2 must be used inside a TimelineCotext provider");

  const { getDateFromLeftOffsetPosition } = timelineCtx;
  const _containerEl = React.useRef<HTMLDivElement | null>(null);
  const _subscription = React.useRef<SubscriptionCallback | null>(null);

  // expand to fill entire parent container (ScrollElement)
  const staticStyles: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  const handleMouseMove = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (_subscription.current === null) return;
    const { pageX } = evt;
    if (_containerEl.current === null) return; // This should never happen

    // FIXME: dont use getBoundingClientRect. Use passed in scroll amount
    const { left: containerLeft } = _containerEl.current.getBoundingClientRect();

    // number of pixels from left we are on canvas
    // we do this calculation as pageX is based on x from viewport whereas
    // our canvas can be scrolled left and right and is generally outside
    // of the viewport.  This calculation is to get how many pixels the cursor
    // is from left of this element
    const canvasX = pageX - containerLeft;
    const date = getDateFromLeftOffsetPosition(canvasX);
    _subscription.current({
      leftOffset: canvasX,
      date,
      isCursorOverCanvas: true,
    });
  };

  const handleMouseLeave = () => {
    if (_subscription.current === null) return;
    _subscription.current({ leftOffset: 0, date: 0, isCursorOverCanvas: false });
  };

  const subscribeToMouseOver = (subscription: SubscriptionCallback) => {
    _subscription.current = subscription;
    return () => {
      _subscription.current = null;
    };
  };

  return (
    <MarkerCanvasContext.Provider value={{ subscribeToMouseOver }}>
      <div
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={_containerEl}
        style={staticStyles}
      >
        <MarkersRenderer />
        {children}
      </div>
    </MarkerCanvasContext.Provider>
  );
};
