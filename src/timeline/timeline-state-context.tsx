import { calculateXPositionForTime, calculateTimeForXPosition } from "../utility";
import React from "react";
import type { DateDriver } from "../utility";
import type { TimeUnit } from "../types";

/* this context will hold all information regarding timeline state:
  1. timeline width
  2. visible time start and end
  3. canvas time start and end
  4. helpers for calculating left offset of items (and really...anything)


  TODO: this context and the timeline context should be merged
  TODO: a useTimeline hook should be created that ensures it is called inside a provider
*/
export type ProvidedTimelineContext = {
  getTimelineState: () => {
    canvasTimeEnd: number;
    canvasTimeStart: number;
    canvasWidth: number;
    timelineUnit: TimeUnit;
    timelineWidth: number;
    visibleTimeEnd: number;
    visibleTimeStart: number;
  };
  getLeftOffsetFromDate: (date: number) => number;
  getDateFromLeftOffsetPosition: (leftOffset: number) => number;
  showPeriod: (startDate: DateDriver, endDate: DateDriver) => void;
};

export const TimelineStateContext = React.createContext<ProvidedTimelineContext>({} as any);
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
