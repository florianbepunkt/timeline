import React from "react";
import memoize from "memoize-one";

/**
 * Baseline styles to get the marker to render correctly
 */
const criticalStyles: React.CSSProperties = {
  backgroundColor: "black",
  bottom: 0,
  position: "absolute",
  top: 0,
  width: "2px",

  // by default, pointer events (specifically click) will
  // "pass through".  This is added so that CursorMarker
  // will not get in the way of canvas click
  pointerEvents: "none",
};

export const createMarkerStylesWithLeftOffset = memoize(
  (leftOffset: number): React.CSSProperties => ({
    ...criticalStyles,
    left: leftOffset,
  })
);

export const createDefaultRenderer = (dataTestidValue: string) =>
  function DefaultMarkerRenderer({ styles }: { styles: React.CSSProperties }) {
    return <div style={styles} data-testid={dataTestidValue} />;
  };
