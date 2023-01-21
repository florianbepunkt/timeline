import React from "react";
import { createMarkerStylesWithLeftOffset, createDefaultRenderer } from "./shared";

type CustomMarkerChildrenProps = {
  styles: React.CSSProperties;
  date: Date | number;
};

type CustomMarkerProps = {
  getLeftOffsetFromDate: (date: number) => number;
  renderer?: (props: CustomMarkerChildrenProps) => React.ReactNode;
  date: Date | number;
};

const defaultCustomMarkerRenderer = createDefaultRenderer("default-customer-marker-id");

/**
 * CustomMarker that is placed based on passed in date prop
 */
class CustomMarker extends React.Component<CustomMarkerProps> {
  render() {
    const { date } = this.props;
    const value = new Date(date).valueOf();
    const leftOffset = this.props.getLeftOffsetFromDate(value);

    const styles = createMarkerStylesWithLeftOffset(leftOffset);
    const renderer = this.props.renderer ?? defaultCustomMarkerRenderer;
    return renderer({ styles, date });
  }
}

export default CustomMarker;
