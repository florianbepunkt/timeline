import { MarkersProvider, MarkersRenderer } from "../markers/index.js";
import { TimelineProvider } from "../timeline/timeline-context.js";
import React from "react";
import type { TimelineProviderProps } from "../timeline/timeline-context.js";

const ONE_DAY = 1000 * 60 * 60 * 24;

// eslint-disable-next-line
export const RenderWrapper: React.FC<{
  children: React.ReactNode;
  timelineState?: Omit<TimelineProviderProps, "children">;
}> = ({ children, timelineState }) => {
  const now = Date.now();
  const visibleTimeStart = now - ONE_DAY;
  const visibleTimeEnd = now + ONE_DAY;
  const defaultTimelineState: Omit<TimelineProviderProps, "children"> = {
    canvasTimeEnd: visibleTimeEnd + ONE_DAY,
    canvasTimeStart: visibleTimeStart - ONE_DAY,
    canvasWidth: 3000,
    timelineUnit: "day",
    timelineWidth: 1000,
    visibleTimeEnd,
    visibleTimeStart,
    showPeriod: () => {},
  };

  timelineState = timelineState != null ? timelineState : defaultTimelineState;

  return (
    <div>
      <TimelineProvider {...timelineState}>
        <MarkersProvider>
          <div>
            {children}
            <MarkersRenderer />
          </div>
        </MarkersProvider>
      </TimelineProvider>
    </div>
  );
};
