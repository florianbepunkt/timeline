import { Marker } from "../Marker";
import { TimelineMarkersConsumer } from "../TimelineMarkersContext";
import { TimelineMarkerType } from "../markerType";
import { TodayMarkerProps } from "../../types";
import React from "react";

export type WrappedTodayMarkerProps = TodayMarkerProps & {
  subscribeMarker: (marker: Marker) => {
    unsubscribe: () => void;
    getMarker: () => Marker;
  };
  updateMarker: (marker: Marker) => unknown;
};

const defaultInterval = 1000 * 10;

class _TodayMarker extends React.Component<WrappedTodayMarkerProps> {
  private _unsubscribe: null | (() => void) = null;
  private _getMarker: null | (() => Marker) = null;

  componentDidMount() {
    const { unsubscribe, getMarker } = this.props.subscribeMarker({
      type: TimelineMarkerType.Today,
      renderer: this.props.children,
      interval: this.props.interval ?? defaultInterval,
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

  componentDidUpdate(prevProps: Readonly<WrappedTodayMarkerProps>) {
    if (prevProps.interval !== this.props.interval && this._getMarker) {
      const marker = this._getMarker();
      if (marker.type === TimelineMarkerType.Today) {
        // We can only update interval for today marker
        this.props.updateMarker({
          ...marker,
          interval: this.props.interval ?? defaultInterval,
        });
      }
    }
  }

  render() {
    return null;
  }
}

// TODO: turn into HOC?
export const TodayMarker = (props: TodayMarkerProps = { date: Date.now() }) => {
  return (
    <TimelineMarkersConsumer>
      {({ subscribeMarker, updateMarker }) => (
        <_TodayMarker subscribeMarker={subscribeMarker} updateMarker={updateMarker} {...props} />
      )}
    </TimelineMarkersConsumer>
  );
};

TodayMarker.displayName = "TodayMarker";
