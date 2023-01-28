import React from "react";
import type { Marker } from "./model";

export type MarkersContext = {
  markers: Marker[];
  subscribeMarker: (marker: Marker) => {
    unsubscribe: () => void;
    getMarker: () => Marker;
  };
  updateMarker: (marker: Marker) => void;
};

export const MarkersContext = React.createContext<MarkersContext>({
  markers: [],
  subscribeMarker: () => {
    throw new Error(`Default subscribe marker used`);
  },
  updateMarker: () => {
    throw new Error(`Default update marker used`);
  },
});

export type MarkersProviderProps = {
  children: React.ReactNode | React.ReactNode[];
};

/**
 * Acts as a marker registry, providing method to register and update markers
 */
export const MarkersProvider: React.FC<MarkersProviderProps> = ({ children }) => {
  const [markers, setMarkers] = React.useState<Marker[]>([]);

  const subscribeMarker = (marker: Marker) => {
    setMarkers((curr) => [...curr, marker]);

    return {
      unsubscribe: () => {
        setMarkers((curr) => curr.filter(({ id }) => id !== marker.id));
      },
      getMarker: () => marker,
    };
  };

  const updateMarker = (marker: Marker) => {
    const ix = markers.findIndex(({ id }) => marker.id === id);
    if (ix < 0) return;
    setMarkers((curr) => [...curr.slice(0, ix), marker, ...curr.slice(ix + 1)]);
  };

  return (
    <MarkersContext.Provider
      value={{
        markers,
        subscribeMarker,
        updateMarker,
      }}
    >
      {children}
    </MarkersContext.Provider>
  );
};
