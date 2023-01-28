import { calculateXPositionForTime, calculateTimeForXPosition } from "../utility";
import React from "react";
import type { TimeUnit } from "../shared-model";

/* this context will hold all information regarding timeline state:
  1. timeline width
  2. visible time start and end
  3. canvas time start and end
  4. helpers for calculating left offset of items (and really...anything)

  TODO: this context and the timeline context should be merged
  TODO: a useTimeline hook should be created that ensures it is called inside a provider
*/
export type TimelineContext = {
  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasWidth: number;
  timelineUnit: TimeUnit;
  timelineWidth: number;
  visibleTimeEnd: number;
  visibleTimeStart: number;

  getLeftOffsetFromDate: (date: number) => number;
  getDateFromLeftOffsetPosition: (leftOffset: number) => number;
  showPeriod: (startDate: Date | number, endDate: Date | number) => void;
};

export const TimelineContext = React.createContext<TimelineContext>({} as any);

export type TimelineProviderProps = {
  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasWidth: number;
  children: React.ReactElement;
  timelineUnit: TimeUnit;
  timelineWidth: number;
  visibleTimeEnd: number;
  visibleTimeStart: number;

  showPeriod: (startDate: Date | number, endDate: Date | number) => void;
};

export const TimelineProvider: React.FC<TimelineProviderProps> = ({
  canvasTimeEnd,
  canvasTimeStart,
  canvasWidth,
  children,
  showPeriod,
  timelineUnit,
  timelineWidth,
  visibleTimeEnd,
  visibleTimeStart,
}) => {
  const getLeftOffsetFromDate = (date: number) =>
    calculateXPositionForTime(canvasTimeStart, canvasTimeEnd, canvasWidth, date);

  const getDateFromLeftOffsetPosition = (leftOffset: number) =>
    calculateTimeForXPosition(canvasTimeStart, canvasTimeEnd, canvasWidth, leftOffset);

  return (
    <TimelineContext.Provider
      value={{
        canvasTimeEnd,
        canvasTimeStart,
        canvasWidth,
        timelineUnit,
        timelineWidth,
        visibleTimeEnd,
        visibleTimeStart,

        getLeftOffsetFromDate,
        getDateFromLeftOffsetPosition,
        showPeriod,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};
