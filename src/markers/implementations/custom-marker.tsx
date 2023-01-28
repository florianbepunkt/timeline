import { createDefaultRenderer, createMarkerStylesWithLeftOffset } from "./shared";
import React from "react";
import type { MarkerRenderer } from "../model";

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
  renderer = createDefaultRenderer("default-customer-marker-id"),
}) => {
  const value = typeof date === "number" ? date : date.valueOf();
  const leftOffset = getLeftOffsetFromDate(value);
  const styles = createMarkerStylesWithLeftOffset(leftOffset);
  return renderer({ styles, date });
};
