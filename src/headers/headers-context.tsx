import { noop } from "../utility/generic.js";
import React from "react";
import type { TimeSteps } from "../shared-model.js";

export type HeadersContext = {
  leftSidebarWidth: number;
  registerScroll: React.RefCallback<HTMLElement>;
  rightSidebarWidth: number;
  timeSteps: TimeSteps;
};

const defaultContextState: HeadersContext = {
  registerScroll: () => {
    // eslint-disable-next-line
    console.warn("default registerScroll header used");
    return noop;
  },
  rightSidebarWidth: 0,
  leftSidebarWidth: 150,
  timeSteps: {},
};

export const HeadersContext = React.createContext(defaultContextState);

export type HeadersProviderProps = HeadersContext & { children: React.ReactNode };

export const HeadersProvider: React.FC<HeadersProviderProps> = ({
  children,
  leftSidebarWidth,
  registerScroll,
  rightSidebarWidth,
  timeSteps,
}) => {
  const value = {
    rightSidebarWidth,
    leftSidebarWidth,
    timeSteps,
    registerScroll,
  };

  return <HeadersContext.Provider value={value}>{children}</HeadersContext.Provider>;
};
