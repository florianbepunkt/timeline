import React from "react";
import { Marker } from "./Marker";

const defaultContextState: TimelineMarkersProviderState = {
  markers: [],
  subscribeMarker: () => {
    throw new Error(`Default subscribe marker used`);
  },
  updateMarker: () => {
    throw new Error(`Default update marker used`);
  },
};

const { Consumer, Provider } = React.createContext(defaultContextState);

// REVIEW: is this the best way to manage ids?
let _id = 0;
const createId = () => {
  _id += 1;
  return _id + 1;
};

type TimelineMarkersProviderProps = {
  children: React.ReactElement; // Children is required
};

type TimelineMarkersProviderState = {
  markers: Marker[];
  subscribeMarker: (marker: Marker) => {
    unsubscribe: () => void;
    getMarker: () => Marker;
  };
  updateMarker: (marker: Marker) => void;
};

export class TimelineMarkersProvider extends React.Component<
  TimelineMarkersProviderProps,
  TimelineMarkersProviderState
> {
  constructor(props: TimelineMarkersProviderProps) {
    super(props);
    this.state = {
      markers: [],
      subscribeMarker: this.handleSubscribeToMarker,
      updateMarker: this.handleUpdateMarker,
    };
  }

  handleSubscribeToMarker = (newMarkerWithoutId: Marker) => {
    const newMarker: Marker = {
      ...newMarkerWithoutId,
      // REVIEW: in the event that we accept id to be passed to the Marker components, this line would override those
      id: createId(),
    };

    this.setState((state) => {
      return {
        markers: [...state.markers, newMarker],
      };
    });
    return {
      unsubscribe: () => {
        this.setState((state) => {
          return {
            markers: state.markers.filter((marker) => marker.id !== newMarker.id),
          };
        });
      },
      getMarker: () => {
        return newMarker;
      },
    };
  };

  handleUpdateMarker = (updateMarker: Marker) => {
    const markerIndex = this.state.markers.findIndex((marker) => marker.id === updateMarker.id);
    if (markerIndex < 0) return;
    this.setState((state) => {
      return {
        markers: [
          ...state.markers.slice(0, markerIndex),
          updateMarker,
          ...state.markers.slice(markerIndex + 1),
        ],
      };
    });
  };

  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

export const TimelineMarkersConsumer = Consumer;
