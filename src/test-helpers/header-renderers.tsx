import { CustomHeader, DateHeader, SidebarHeader, TimelineHeaders } from "../headers";
import { format } from "date-fns";
import { HeadersProviderProps } from "../headers/headers-context";
import { render } from "@testing-library/react";
import { RenderHeadersWrapper } from "./header-renderer";
import { TimelineProviderProps } from "../timeline/timeline-context";
import { TimeUnit } from "../shared-model";

export const renderSidebarHeaderWithCustomValues = ({
  extraProps,
  headersState,
  props,
  timelineState,
  variant,
}: {
  extraProps?: any; // TODO: don't understand the model here...
  headersState?: Partial<HeadersProviderProps>;
  props?: { style: React.CSSProperties };
  timelineState?: Partial<TimelineProviderProps>;
  variant?: "left" | "right";
} = {}) =>
  render(
    <RenderHeadersWrapper timelineState={timelineState} headersState={headersState}>
      <TimelineHeaders>
        <SidebarHeader variant={variant} headerData={extraProps}>
          {({ getRootProps }) => {
            return (
              <div data-testid="sidebarHeader" {...getRootProps(props)}>
                SidebarHeader
                <div>Should Be Rendred</div>
              </div>
            );
          }}
        </SidebarHeader>
        <DateHeader unit="primaryHeader" />
        <DateHeader />
      </TimelineHeaders>
    </RenderHeadersWrapper>
  );

export const renderTwoSidebarHeadersWithCustomValues = ({
  headersState,
  props,
  timelineState,
}: {
  headersState?: Partial<HeadersProviderProps>;
  props?: any; // TODO: don't understand the model here...
  timelineState?: Partial<TimelineProviderProps>;
} = {}) =>
  render(
    <RenderHeadersWrapper timelineState={timelineState} headersState={headersState}>
      <TimelineHeaders>
        <SidebarHeader variant={"left"} headerData={props}>
          {({ getRootProps }) => {
            return (
              <div {...getRootProps(props)}>
                LeftSideBar
                <div>Should Be Rendred</div>
              </div>
            );
          }}
        </SidebarHeader>
        <SidebarHeader variant={"right"} headerData={props}>
          {({ getRootProps, data }) => {
            return <div {...getRootProps(data)}>RightSideBar</div>;
          }}
        </SidebarHeader>
        <DateHeader unit="primaryHeader" />
        <DateHeader />
      </TimelineHeaders>
    </RenderHeadersWrapper>
  );

export const renderTimelineWithLeftAndRightSidebar = ({
  calendarHeaderClassName,
  calendarHeaderStyle,
  className,
  headersState,
  style,
  timelineState,
}: {
  calendarHeaderClassName?: string;
  calendarHeaderStyle?: React.CSSProperties;
  className?: string;
  headersState?: Partial<HeadersProviderProps>;
  style?: React.CSSProperties;
  timelineState?: Partial<TimelineProviderProps>;
} = {}) =>
  render(
    <RenderHeadersWrapper timelineState={timelineState} headersState={headersState}>
      <TimelineHeaders
        calendarHeaderClassName={calendarHeaderClassName}
        calendarHeaderStyle={calendarHeaderStyle}
        className={className}
        style={style}
      >
        <SidebarHeader variant="right">
          {({ getRootProps }) => (
            <div data-testid="right-header" {...getRootProps()}>
              Right
            </div>
          )}
        </SidebarHeader>
        <SidebarHeader variant="left">
          {({ getRootProps }) => (
            <div data-testid="left-header" {...getRootProps()}>
              Left
            </div>
          )}
        </SidebarHeader>
      </TimelineHeaders>
    </RenderHeadersWrapper>
  );

export const renderTimelineWithVariantSidebar = ({
  headersState,
  timelineState,
  variant,
}: {
  headersState?: Partial<HeadersProviderProps>;
  timelineState?: Partial<TimelineProviderProps>;
  variant?: "left" | "right";
} = {}) =>
  render(
    <RenderHeadersWrapper timelineState={timelineState} headersState={headersState}>
      <TimelineHeaders>
        <SidebarHeader variant={variant}>
          {({ getRootProps }) => {
            return (
              <div data-testid="sidebarHeader" {...getRootProps()}>
                Header
              </div>
            );
          }}
        </SidebarHeader>
      </TimelineHeaders>
    </RenderHeadersWrapper>
  );

export const getCustomHeadersInTimeline = ({
  headersState,
  intervalStyle,
  props,
  timelineState,
  unit,
}: {
  headersState?: Partial<HeadersProviderProps>;
  intervalStyle?: React.CSSProperties;
  props?: any; // TODO: don't understand the model here...
  timelineState?: Partial<TimelineProviderProps>;
  unit?: TimeUnit;
} = {}) => (
  <RenderHeadersWrapper timelineState={timelineState} headersState={headersState}>
    <TimelineHeaders>
      <CustomHeader unit={unit} headerData={props}>
        {({
          headerContext: { intervals },
          getRootProps,
          getIntervalProps,
          showPeriod,
          data = { style: { height: 30 } },
        }) => {
          return (
            <div data-testid="customHeader" {...getRootProps(data)}>
              {intervals.map((interval) => {
                return (
                  <div
                    data-testid="customHeaderInterval"
                    onClick={() => {
                      showPeriod(interval.startTime, interval.endTime);
                    }}
                    {...getIntervalProps({
                      interval,
                      style: intervalStyle,
                    })}
                  >
                    <div className="sticky">{format(interval.startTime, "dd/MM/yyyy")}</div>
                  </div>
                );
              })}
            </div>
          );
        }}
      </CustomHeader>
    </TimelineHeaders>
  </RenderHeadersWrapper>
);
