import { MarkersProvider, MarkersRenderer } from "../markers";
import { TimelineProvider } from "../timeline/timeline-context";
import React from "react";
import type { TimelineProviderProps } from "../timeline/timeline-context";

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
    visibleTimeStart,
    visibleTimeEnd,
    canvasTimeStart: visibleTimeStart - ONE_DAY,
    canvasTimeEnd: visibleTimeEnd + ONE_DAY,
    canvasWidth: 3000,
    // visibleWidth: 1000, // TODO: delete
    showPeriod: () => {},
    timelineWidth: 1000,
    timelineUnit: "day",
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
