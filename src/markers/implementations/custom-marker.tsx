import { createDefaultRenderer, createMarkerStylesWithLeftOffset } from "./shared.js";
import React from "react";
import type { MarkerRenderer } from "../model.js";

type CustomMarkerProps = {
  date: Date | number;
  getLeftOffsetFromDate: (date: number) => number;
  renderer?: MarkerRenderer;
};

/**
 * CustomMarker that is placed based on passed in date prop
 */
export const CustomMarker: React.FC<CustomMarkerProps> = ({
  date,
  getLeftOffsetFromDate,
  renderer = createDefaultRenderer("default-customer-marker-id", "rct-custom-marker"),
}) => {
  const value = typeof date === "number" ? date : date.valueOf();
  const leftOffset = getLeftOffsetFromDate(value);
  const styles = createMarkerStylesWithLeftOffset(leftOffset);
  return renderer({ styles, date });
};
