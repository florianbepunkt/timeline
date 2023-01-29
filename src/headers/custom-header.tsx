import { HeadersContext } from "./headers-context.js";
import { iterateTimes } from "../utility/index.js";
import { TimelineContext } from "../timeline/index.js";
import memoize from "memoize-one";
import React from "react";
import type { CompleteTimeSteps, TimeUnit } from "../shared-model.js";
import type { GetIntervalProps, Interval } from "./interval.js";

export type CustomHeaderProps<Data> = {
  /**
   * Function as a child component to render the header
   */
  children: (props: CustomHeaderPropsChildrenFnProps<Data>) => JSX.Element;

  /**
   * Contextual data to be passed to the item renderer as a data prop
   */
  headerData: Data;

  /**
   * Height of the header in pixels
   */
  height?: number;

  /**
   * Intervals
   */
  unit?: TimeUnit;
};

export type HeaderContext = {
  intervals: Interval[];
  unit: TimeUnit;
};

export type CustomHeaderPropsChildrenFnProps<Data> = {
  data: Data;
  getIntervalProps: (props?: GetIntervalProps) => GetIntervalProps & { key: string | number };
  getRootProps: (
    propsToOverride?: Partial<
      React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
    >
  ) => { style: React.CSSProperties };
  headerContext: HeaderContext;
  showPeriod: (startDate: Date | number, endDate: Date | number) => void;
  timelineContext: Pick<
    TimelineContext,
    "canvasTimeEnd" | "canvasTimeStart" | "timelineWidth" | "visibleTimeEnd" | "visibleTimeStart"
  >;
};

/**
 * We could improve performance with React.memo, but seems premature at the moment
 *   shouldComponentUpdate(nextProps: Readonly<WrappedCustomHeaderProps<Data>>) {
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
 */

/**
 * Responsible for rendering the headers above calendar part of the timeline. This is the base component for DateHeader and offers more control with less features.
 */
export const CustomHeader = <Data,>({
  children,
  unit,
  headerData,
  height = 30,
}: CustomHeaderProps<Data>): JSX.Element => {
  const {
    canvasTimeEnd,
    canvasTimeStart,
    canvasWidth,
    timelineUnit,
    timelineWidth,
    visibleTimeEnd,
    visibleTimeStart,
    getLeftOffsetFromDate,
    showPeriod,
  } = React.useContext(TimelineContext);
  const { timeSteps } = React.useContext(HeadersContext);
  const intervals = memoize(
    (
      canvasTimeStart: number,
      canvasTimeEnd: number,
      unit: TimeUnit,
      timeSteps: Partial<CompleteTimeSteps>,
      getLeftOffsetFromDate: (date: number) => number
    ) => {
      const intervals: Interval[] = [];

      iterateTimes(canvasTimeStart, canvasTimeEnd, unit, timeSteps, (startTime, endTime) => {
        const left = getLeftOffsetFromDate(startTime.valueOf());
        const right = getLeftOffsetFromDate(endTime.valueOf());
        const labelWidth = right - left;
        intervals.push({ endTime, labelWidth, left, startTime });
      });

      return intervals;
    }
  );

  const getRootProps = (props: { style?: React.CSSProperties } = {}) => {
    const { style } = props;
    return {
      style: Object.assign({}, style ? style : {}, {
        height,
        position: "relative",
        width: canvasWidth,
      }),
    };
  };

  const getIntervalProps = (
    props: GetIntervalProps = {}
  ): GetIntervalProps & { key: string | number } => {
    const { interval, style } = props;
    if (!interval) throw new Error("you should provide interval to the prop getter");
    const { startTime, labelWidth, left } = interval;

    return {
      key: `label-${startTime.valueOf()}`,
      style: getIntervalStyle({
        labelWidth,
        left,
        style,
      }),
    };
  };

  const getIntervalStyle = ({
    labelWidth,
    left,
    style,
  }: {
    labelWidth: number;
    left: number;
    style?: React.CSSProperties;
  }): React.CSSProperties => ({
    ...style,
    left,
    position: "absolute",
    width: labelWidth,
  });

  return children({
    timelineContext: {
      canvasTimeEnd,
      canvasTimeStart,
      timelineWidth,
      visibleTimeEnd,
      visibleTimeStart,
    },
    headerContext: {
      unit: unit ?? timelineUnit,
      intervals: intervals(
        canvasTimeStart,
        canvasTimeEnd,
        unit ?? timelineUnit,
        timeSteps,
        getLeftOffsetFromDate
      ),
    },
    getRootProps,
    getIntervalProps,
    showPeriod,
    data: headerData,
  });
};
