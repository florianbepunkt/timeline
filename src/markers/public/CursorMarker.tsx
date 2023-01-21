import { Marker } from "../Marker";
import { TimelineMarkersConsumer } from "../TimelineMarkersContext";
import { TimelineMarkerType } from "../markerType";
import React from "react";
import type { CursorMarkerProps } from "../../types";

type WrappedCursorMarkerProps = CursorMarkerProps & {
  subscribeMarker: (marker: Marker) => {
    unsubscribe: () => void;
    getMarker: () => Marker;
  };
};

class _CursorMarker extends React.Component<WrappedCursorMarkerProps> {
  private _unsubscribe: null | (() => void) = null;

  componentDidMount() {
    const { unsubscribe } = this.props.subscribeMarker({
      type: TimelineMarkerType.Cursor,
      renderer: this.props.children,
    });

    this._unsubscribe = unsubscribe;
  }

  componentWillUnmount() {
    if (this._unsubscribe !== null && typeof this._unsubscribe === "function") {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }
  render() {
    return null;
  }
}

export const CursorMarker = (props: CursorMarkerProps) => (
  <TimelineMarkersConsumer>
    {({ subscribeMarker }) => <_CursorMarker subscribeMarker={subscribeMarker} {...props} />}
  </TimelineMarkersConsumer>
);

CursorMarker.displayName = "CursorMarkerWrapper";
