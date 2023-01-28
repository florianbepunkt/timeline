import React from "react";
import type { SubscriptionCallback } from "./model";

export type MarkerCanvasContext = {
  subscribeToMouseOver: (callback: SubscriptionCallback) => () => void;
};

export const MarkerCanvasContext = React.createContext<MarkerCanvasContext>({
  subscribeToMouseOver: () => {
    throw new Error(`"subscribeToMouseOver" default func is being used`);
  },
});
