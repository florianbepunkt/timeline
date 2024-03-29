import type { CSSProperties } from "react";

export const overridableStyles: CSSProperties = {
  fontSize: 12,
  color: "white",
  cursor: "pointer",
  background: "#2196f3",
  borderColor: "#1a6fb3",
  borderStyle: "solid",
  borderTopWidth: "1px",
  borderBottomWidth: "1px",
  borderLeftWidth: "1px",
  borderRightWidth: "1px",
  zIndex: 80,
};

export const selectedStyle: CSSProperties = {
   background: "#ffc107",
   borderColor: "#ff9800",
  zIndex: 82,
};

export const selectedAndCanMove: CSSProperties = {
  cursor: "move",
};

export const selectedAndCanResizeLeft: CSSProperties = {
  borderLeftWidth: 3,
};

export const selectedAndCanResizeLeftAndDragLeft: CSSProperties = {
  cursor: "w-resize",
};

export const selectedAndCanResizeRight: CSSProperties = {
  borderRightWidth: 3,
};

export const selectedAndCanResizeRightAndDragRight: CSSProperties = {
  cursor: "e-resize",
};

export const leftResizeStyle: CSSProperties = {
  position: "absolute",
  width: 24,
  maxWidth: "20%",
  minWidth: 2,
  height: "100%",
  top: 0,
  left: 0,
  cursor: "pointer",
  zIndex: 88,
};

export const rightResizeStyle: CSSProperties = {
  position: "absolute",
  width: 24,
  maxWidth: "20%",
  minWidth: 2,
  height: "100%",
  top: 0,
  right: 0,
  cursor: "pointer",
  zIndex: 88,
};
