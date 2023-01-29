import React from "react";
import type { SubscriptionCallback } from "./model.js";

export type MarkerCanvasContext = {
  subscribeToMouseOver: (callback: SubscriptionCallback) => () => void;
};

export const MarkerCanvasContext = React.createContext<MarkerCanvasContext>({
  subscribeToMouseOver: (_) => {
    throw new Error(`"subscribeToMouseOver" default func is being used`);
  },
});
