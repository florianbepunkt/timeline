import { calculateXPositionForTime, calculateTimeForXPosition } from "../utility/calendar";
import React from "react";
import type { DateDriver } from "../utility";
import type { TimeUnit } from "../types";

export type ProvidedTimelineContext = {
  getTimelineState: () => {
    visibleTimeStart: number;
    visibleTimeEnd: number;
    canvasTimeStart: number;
    canvasTimeEnd: number;
    canvasWidth: number;
    timelineUnit: TimeUnit;
    timelineWidth: number;
  };
  getLeftOffsetFromDate: (date: number) => number;
  getDateFromLeftOffsetPosition: (leftOffset: number) => number;
  showPeriod: (startDate: DateDriver, endDate: DateDriver) => void;
};

/* this context will hold all information regarding timeline state:
  1. timeline width
  2. visible time start and end
  3. canvas time start and end
  4. helpers for calculating left offset of items (and really...anything)
*/

/* eslint-disable no-console */
const defaultContextState: ProvidedTimelineContext = {
  getTimelineState: () => {
    console.warn('"getTimelineState" default func is being used');
    throw new Error(`Timeline context is not initialized: getTimelineState is not available`);
  },
  getLeftOffsetFromDate: (_time: number) => {
    console.warn('"getLeftOffsetFromDate" default func is being used');
    throw new Error(`Timeline context is not initialized: getLeftOffsetFromDate is not available`);
  },
  getDateFromLeftOffsetPosition: () => {
    console.warn('"getDateFromLeftOffsetPosition" default func is being used');
    throw new Error(
      `Timeline context is not initialized: getDateFromLeftOffsetPosition is not available`
    );
  },
  showPeriod: () => {
    console.warn('"showPeriod" default func is being used');
    throw new Error(`Timeline context is not initialized: showPeriod is not available`);
  },
};
/* eslint-enable */

const TimelineStateContext = React.createContext<ProvidedTimelineContext>(defaultContextState);
const { Consumer, Provider } = TimelineStateContext;

export type TimelineStateProviderProps = {
  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasWidth: number;
  children: React.ReactElement;
  showPeriod: (startDate: DateDriver, endDate: DateDriver) => void;
  timelineUnit: TimeUnit;
  timelineWidth: number;
  visibleTimeEnd: number;
  visibleTimeStart: number;
};

type TimelineStateProviderState = {
  timelineContext: ProvidedTimelineContext;
};

export class TimelineStateProvider extends React.Component<
  TimelineStateProviderProps,
  TimelineStateProviderState
> {
  constructor(props: TimelineStateProviderProps) {
    super(props);

    this.state = {
      timelineContext: {
        getTimelineState: this.getTimelineState,
        getLeftOffsetFromDate: this.getLeftOffsetFromDate,
        getDateFromLeftOffsetPosition: this.getDateFromLeftOffsetPosition,
        showPeriod: this.props.showPeriod,
      },
    };
  }

  getTimelineState = () => {
    const {
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      timelineUnit,
      timelineWidth,
    } = this.props;

    return {
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      timelineUnit,
      timelineWidth,
    }; // REVIEW,
  };

  getLeftOffsetFromDate = (date: number) => {
    const { canvasTimeStart, canvasTimeEnd, canvasWidth } = this.props;
    return calculateXPositionForTime(canvasTimeStart, canvasTimeEnd, canvasWidth, date);
  };

  getDateFromLeftOffsetPosition = (leftOffset: number) => {
    const { canvasTimeStart, canvasTimeEnd, canvasWidth } = this.props;
    return calculateTimeForXPosition(canvasTimeStart, canvasTimeEnd, canvasWidth, leftOffset);
  };

  render() {
    return <Provider value={this.state.timelineContext}>{this.props.children}</Provider>;
  }
}

export const TimelineStateConsumer = Consumer;
