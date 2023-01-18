import { noop } from "../utility/generic";
import React from "react";
import type { ITimeSteps } from "../types";

export interface IHeaderContext {
  timeSteps: ITimeSteps;
  rightSidebarWidth: number;
  leftSidebarWidth: number;
  registerScroll: React.RefCallback<HTMLElement>;
}

export interface ITimelineHeadersProviderProps extends IHeaderContext {
  children: React.ReactNode;
}

const defaultContextState: IHeaderContext = {
  registerScroll: () => {
    // eslint-disable-next-line
    console.warn("default registerScroll header used");
    return noop;
  },
  rightSidebarWidth: 0,
  leftSidebarWidth: 150,
  timeSteps: {},
};

const { Consumer, Provider } = React.createContext(defaultContextState);

export class TimelineHeadersProvider extends React.Component<ITimelineHeadersProviderProps> {
  render(): React.ReactNode {
    const contextValue = {
      rightSidebarWidth: this.props.rightSidebarWidth,
      leftSidebarWidth: this.props.leftSidebarWidth,
      timeSteps: this.props.timeSteps,
      registerScroll: this.props.registerScroll,
    };
    return <Provider value={contextValue}>{this.props.children}</Provider>;
  }
}

export const TimelineHeadersConsumer = Consumer;
