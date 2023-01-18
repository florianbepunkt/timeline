import { DateDriver } from "../utility";
import { iterateTimes } from "../utility/calendar";
import { TimelineHeadersConsumer } from "./headers-context";
import { TimelineStateConsumer } from "../timeline/timeline-state-context";
import memoize from "memoize-one";
import React from "react";
import type {
  CustomHeaderProps,
  CustomHeaderPropsChildrenFnProps,
  GetIntervalProps,
  Interval,
  TimeUnit,
} from "../types";

type WrappedCustomHeaderProps<Data> = {
  //component props
  children: (props: CustomHeaderPropsChildrenFnProps<Data>) => JSX.Element;
  unit: TimeUnit;

  //Timeline context
  getLeftOffsetFromDate: (date: number) => number;
  showPeriod: (startDate: DateDriver, endDate: DateDriver) => void;

  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasWidth: number;
  headerData: Data;
  height: number;
  timelineUnit: TimeUnit;
  timelineWidth: number;
  timeSteps: object;
  visibleTimeEnd: number;
  visibleTimeStart: number;
};

type WrappedCustomHeaderState = {
  intervals: Interval[];
};

export class _CustomHeader<Data> extends React.Component<
  WrappedCustomHeaderProps<Data>,
  WrappedCustomHeaderState
> {
  intervals = memoize(
    (
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      unit,
      timeSteps,
      showPeriod,
      getLeftOffsetFromDate
    ) => {
      const intervals: Interval[] = [];

      iterateTimes(canvasTimeStart, canvasTimeEnd, unit, timeSteps, (startTime, endTime) => {
        const left = getLeftOffsetFromDate(startTime.valueOf());
        const right = getLeftOffsetFromDate(endTime.valueOf());
        const width = right - left;
        intervals.push({
          startTime,
          endTime,
          labelWidth: width,
          left,
        });
      });

      return intervals;
    }
  );

  shouldComponentUpdate(nextProps: Readonly<WrappedCustomHeaderProps<Data>>) {
    return (
      nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
      nextProps.canvasTimeEnd !== this.props.canvasTimeEnd ||
      nextProps.canvasWidth !== this.props.canvasWidth ||
      nextProps.unit !== this.props.unit ||
      nextProps.timeSteps !== this.props.timeSteps ||
      nextProps.showPeriod !== this.props.showPeriod ||
      nextProps.children !== this.props.children ||
      nextProps.headerData !== this.props.headerData
    );
  }

  getRootProps = (props: { style?: React.CSSProperties } = {}) => {
    const { style } = props;
    return {
      style: Object.assign({}, style ? style : {}, {
        position: "relative",
        width: this.props.canvasWidth,
        height: this.props.height,
      }),
    };
  };

  getIntervalProps = (props: GetIntervalProps = {}): GetIntervalProps & { key: string | number } => {
    const { interval, style } = props;
    if (!interval) throw new Error("you should provide interval to the prop getter");
    const { startTime, labelWidth, left } = interval;
    return {
      style: this.getIntervalStyle({
        style,
        labelWidth,
        left,
      }),
      key: `label-${startTime.valueOf()}`,
    };
  };

  getIntervalStyle = ({
    left,
    labelWidth,
    style,
  }: {
    left: number;
    labelWidth: number;
    style?: React.CSSProperties;
  }): React.CSSProperties => {
    return {
      ...style,
      left,
      width: labelWidth,
      position: "absolute",
    };
  };

  getStateAndHelpers = (): CustomHeaderPropsChildrenFnProps<Data> => {
    const {
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      unit,
      timeSteps,
      showPeriod,
      timelineWidth,
      visibleTimeStart,
      visibleTimeEnd,
      headerData,
      getLeftOffsetFromDate,
    } = this.props;
    //TODO: only evaluate on changing params
    return {
      timelineContext: {
        timelineWidth,
        visibleTimeStart,
        visibleTimeEnd,
        canvasTimeStart,
        canvasTimeEnd,
      },
      headerContext: {
        unit,
        intervals: this.intervals(
          canvasTimeStart,
          canvasTimeEnd,
          canvasWidth,
          unit,
          timeSteps,
          showPeriod,
          getLeftOffsetFromDate
        ),
      },
      getRootProps: this.getRootProps,
      getIntervalProps: this.getIntervalProps,
      showPeriod,
      data: headerData,
    };
  };

  render() {
    const props = this.getStateAndHelpers();
    const Renderer = this.props.children;
    return <Renderer {...props} />;
  }
}

export const CustomHeader = <Data,>({
  children,
  unit,
  headerData,
  height = 30,
}: CustomHeaderProps<Data>) => (
  <TimelineStateConsumer>
    {({ getTimelineState, showPeriod, getLeftOffsetFromDate }) => {
      const timelineState = getTimelineState();
      return (
        <TimelineHeadersConsumer>
          {({ timeSteps }) => (
            <_CustomHeader
              timeSteps={timeSteps}
              showPeriod={showPeriod}
              unit={unit ? unit : timelineState.timelineUnit}
              {...timelineState}
              headerData={headerData}
              getLeftOffsetFromDate={getLeftOffsetFromDate}
              height={height}
            >
              {children}
            </_CustomHeader>
          )}
        </TimelineHeadersConsumer>
      );
    }}
  </TimelineStateConsumer>
);
