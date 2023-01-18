import { Marker } from "../Marker";
import { MarkerProps } from "../../types";
import { TimelineMarkersConsumer } from "../TimelineMarkersContext";
import { TimelineMarkerType } from "../markerType";
import React from "react";

type WrappedTodayMarkerProps = MarkerProps & {
  subscribeMarker: (marker: Marker) => {
    unsubscribe: () => void;
    getMarker: () => Marker;
  };
  updateMarker: (marker: Marker) => unknown;
};

class _CustomMarker extends React.Component<WrappedTodayMarkerProps> {
  private _unsubscribe: null | (() => void) = null;
  private _getMarker: null | (() => Marker) = null;

  componentDidUpdate(prevProps: Readonly<WrappedTodayMarkerProps>) {
    if (prevProps.date !== this.props.date && this._getMarker) {
      const marker = this._getMarker();
      if (marker.type === TimelineMarkerType.Custom) {
        // We can only update date for custom marker
        this.props.updateMarker({ ...marker, date: this.props.date });
      }
    }
  }

  componentDidMount() {
    const { unsubscribe, getMarker } = this.props.subscribeMarker({
      type: TimelineMarkerType.Custom,
      renderer: this.props.children,
      date: this.props.date,
    });
    this._unsubscribe = unsubscribe;
    this._getMarker = getMarker;
  }

  componentWillUnmount() {
    if (this._unsubscribe !== null) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  render() {
    return null;
  }
}

export type CustomMarkerProps = MarkerProps;
export const CustomMarker = (props: CustomMarkerProps) => (
  <TimelineMarkersConsumer>
    {({ subscribeMarker, updateMarker }) => (
      <_CustomMarker subscribeMarker={subscribeMarker} updateMarker={updateMarker} {...props} />
    )}
  </TimelineMarkersConsumer>
);

CustomMarker.displayName = "CustomMarker";
