import React from "react";

/* eslint-disable no-console */
const defaultContextState = {
  subscribeToMouseOver: (
    _: (value: { leftOffset: number; date: number; isCursorOverCanvas: boolean }) => void
  ): (() => void) => {
    throw new Error(`"subscribeToMouseOver" default func is being used`);
  },
};
/* eslint-enable */

const { Consumer, Provider } = React.createContext(defaultContextState);

export const MarkerCanvasProvider = Provider;
export const MarkerCanvasConsumer = Consumer;
