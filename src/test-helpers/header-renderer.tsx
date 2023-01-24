import { DateDriver } from "../utility";
import { defaultTimeSteps } from "../default-config";
import { HeadersProviderProps, HeadersProvider } from "../headers/headers-context";
import { state } from "../__fixtures__/stateAndProps";
import { TimelineProvider, TimelineProviderProps } from "../timeline/timeline-context";
import React from "react";

// eslint-disable-next-line
export const RenderHeadersWrapper: React.FC<{
  children: React.ReactNode;
  headersState?: Partial<HeadersProviderProps>;
  registerScroll?: React.RefCallback<HTMLElement>;
  showPeriod?: (startDate: DateDriver, endDate: DateDriver) => void;
  timelineState?: Partial<TimelineProviderProps>;
}> = ({
  children,
  timelineState = {},
  headersState = {},
  showPeriod = () => {},
  registerScroll = () => {},
}) => {
  const defaultTimelineState = {
    canvasTimeEnd: state.canvasTimeEnd,
    canvasTimeStart: state.canvasTimeStart,
    canvasWidth: 2000,
    showPeriod: showPeriod,
    timelineUnit: "day" as const,
    timelineWidth: 1000,
    visibleTimeEnd: state.visibleTimeEnd,
    visibleTimeStart: state.visibleTimeStart,
  };

  const timelineStateProps = {
    ...defaultTimelineState,
    ...timelineState,
  };

  const headersStateProps = {
    registerScroll: registerScroll,
    timeSteps: defaultTimeSteps,
    leftSidebarWidth: 150,
    rightSidebarWidth: 0,
    ...headersState,
  };

  return (
    <div>
      <TimelineProvider {...timelineStateProps}>
        <div>
          <HeadersProvider {...headersStateProps}>{children}</HeadersProvider>
        </div>
      </TimelineProvider>
    </div>
  );
};
