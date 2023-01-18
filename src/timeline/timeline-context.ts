import React from "react";

export type TimelineContext = {
  timelineWidth: number;
  visibleTimeStart: number;
  visibleTimeEnd: number;
  canvasTimeStart: number;
  canvasTimeEnd: number;
};

export const TimelineContext = React.createContext<TimelineContext>({} as any);
