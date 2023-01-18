import { TimelineMarkersProvider } from "../markers/TimelineMarkersContext";
import { TimelineStateProvider } from "../timeline/TimelineStateContext";
import React from "react";
import TimelineMarkersRenderer from "../markers/TimelineMarkersRenderer";
import type { TimelineStateProviderProps } from "../timeline/TimelineStateContext";

const ONE_DAY = 1000 * 60 * 60 * 24;

// eslint-disable-next-line
export const RenderWrapper: React.FC<{
  children: React.ReactNode;
  timelineState?: Omit<TimelineStateProviderProps, "children">;
}> = ({ children, timelineState }) => {
  const now = Date.now();
  const visibleTimeStart = now - ONE_DAY;
  const visibleTimeEnd = now + ONE_DAY;
  const defaultTimelineState: Omit<TimelineStateProviderProps, "children"> = {
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
      <TimelineStateProvider {...timelineState}>
        <TimelineMarkersProvider>
          <div>
            {children}
            <TimelineMarkersRenderer />
          </div>
        </TimelineMarkersProvider>
      </TimelineStateProvider>
    </div>
  );
};
