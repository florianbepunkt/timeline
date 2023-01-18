import React from "react";
import { createMarkerStylesWithLeftOffset, createDefaultRenderer } from "./shared";

type CustomMarkerChildrenProps = {
  styles: React.CSSProperties;
  date: number;
};

type CustomMarkerProps = {
  getLeftOffsetFromDate: (date: number) => number;
  renderer?: (props: CustomMarkerChildrenProps) => React.ReactNode;
  date: number;
};

const defaultCustomMarkerRenderer = createDefaultRenderer("default-customer-marker-id");

/**
 * CustomMarker that is placed based on passed in date prop
 */
class CustomMarker extends React.Component<CustomMarkerProps> {
  render() {
    const { date } = this.props;
    const leftOffset = this.props.getLeftOffsetFromDate(date);

    const styles = createMarkerStylesWithLeftOffset(leftOffset);
    const renderer = this.props.renderer ?? defaultCustomMarkerRenderer;
    return renderer({ styles, date });
  }
}

export default CustomMarker;
