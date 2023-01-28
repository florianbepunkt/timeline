import { createDefaultRenderer, createMarkerStylesWithLeftOffset } from "./shared";
import { MarkerCanvasContext } from "../marker-canvas-context";
import React from "react";
import type { MarkerRenderer } from "../model";

export type CursorMarkerProps = { renderer?: MarkerRenderer };

/**
 * CursorMarker implementation subscribes to 'subscribeToCanvasMouseOver' on mount.
 * This subscription is passed in via MarkerCanvasConsumer, which is wired up to
 * MarkerCanvasProvider in the MarkerCanvas component. When the user mouses over MarkerCanvas,
 * the callback registered in CursorMarker (this component) is passed:
 *  leftOffset - pixels from left edge of canvas, used to position this element
 *  date - the date the cursor pertains to
 *  isCursorOverCanvas - whether the user cursor is over the canvas. This is set to 'false'
 *  when the user mouseleaves the element
 */
export const CursorMarker: React.FC<CursorMarkerProps> = ({
  renderer = createDefaultRenderer("default-cursor-marker"),
}) => {
  const { subscribeToMouseOver } = React.useContext(MarkerCanvasContext);
  const _unsubscribe = React.useRef<null | (() => void)>(null);
  const [leftOffset, setLeftOffset] = React.useState(0);
  const [date, setDate] = React.useState(0);
  const [isShowingCursor, setIsShowingCursor] = React.useState(false);

  const handleCanvasMouseOver = ({
    date,
    isCursorOverCanvas,
    leftOffset,
  }: {
    date: number;
    isCursorOverCanvas: boolean;
    leftOffset: number;
  }) => {
    setDate(date);
    setIsShowingCursor(isCursorOverCanvas);
    setLeftOffset(leftOffset);
  };

  React.useEffect(() => {
    _unsubscribe.current = subscribeToMouseOver(handleCanvasMouseOver);
    return function cleanUp() {
      if (_unsubscribe.current !== null && typeof _unsubscribe.current === "function") {
        _unsubscribe.current();
        _unsubscribe.current = null;
      }
    };
  }, []);

  if (!isShowingCursor) return null;
  const styles = createMarkerStylesWithLeftOffset(leftOffset);
  return renderer({ styles, date });
};
