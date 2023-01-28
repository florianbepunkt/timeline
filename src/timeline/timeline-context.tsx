import { calculateXPositionForTime, calculateTimeForXPosition } from "../utility";
import React from "react";
import type { TimeUnit } from "../shared-model";

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
