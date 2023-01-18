import { CustomDateHeader } from "./custom-date-header";
import { CustomHeader } from "./custom-header";
import { DateDriver } from "../utility";
import { defaultHeaderFormats } from "../default-config";
import { getNextUnit } from "../utility/calendar";
import { TimelineStateConsumer } from "../timeline/TimelineStateContext";
import memoize from "memoize-one";
import React from "react";
import type { TimeUnit, IntervalRenderer, DateHeaderProps } from "../types";

type WrappedDateHeaderProps<Data> = DateHeaderProps<Data> & {
  timelineUnit: TimeUnit;
};

class _DateHeader<Data> extends React.Component<WrappedDateHeaderProps<Data>> {
  getHeaderUnit = () => {
    if (this.props.unit === "primaryHeader") {
      return getNextUnit(this.props.timelineUnit);
    } else if (this.props.unit) {
      return this.props.unit;
    }
    return this.props.timelineUnit;
  };

  getRootStyle = memoize((style?: React.CSSProperties): React.CSSProperties => {
    return {
      height: 30,
      ...style,
    };
  });

  getLabelFormat = (interval: [DateDriver, DateDriver], unit: TimeUnit, labelWidth: number): string => {
    const { labelFormat } = this.props;

    if (typeof labelFormat === "string") {
      const startTime = interval[0];
      return startTime.format(labelFormat);
    } else if (typeof labelFormat === "function") {
      return labelFormat(interval, unit, labelWidth);
    } else {
      throw new Error("labelFormat should be function or string");
    }
  };

  getHeaderData = memoize(
    (
      intervalRenderer: ((props: IntervalRenderer<Data>) => React.ReactNode) | undefined,
      style: React.CSSProperties,
      className: string | undefined,
      getLabelFormat: (interval: [DateDriver, DateDriver], unit: TimeUnit, labelWidth: number) => string,
      unitProp: TimeUnit | "primaryHeader" | undefined,
      headerData: Data | undefined
    ) => {
      return {
        intervalRenderer,
        style,
        className,
        getLabelFormat,
        unitProp,
        headerData,
      };
    }
  );

  render() {
    const unit = this.getHeaderUnit();
    const { height } = this.props;
    return (
      <CustomHeader
        unit={unit}
        height={height}
        headerData={this.getHeaderData(
          this.props.intervalRenderer,
          this.getRootStyle(this.props.style),
          this.props.className,
          this.getLabelFormat,
          this.props.unit,
          this.props.headerData
        )}
      >
        {CustomDateHeader}
      </CustomHeader>
    );
  }
}

export const DateHeader = <Data,>({
  className,
  headerData,
  height,
  intervalRenderer,
  labelFormat = formatLabel,
  style,
  unit,
}: DateHeaderProps<Data>) => {
  return (
    <TimelineStateConsumer>
      {({ getTimelineState }) => {
        const timelineState = getTimelineState();
        return (
          <_DateHeader
            className={className}
            headerData={headerData}
            height={height}
            intervalRenderer={intervalRenderer}
            labelFormat={labelFormat}
            style={style}
            timelineUnit={timelineState.timelineUnit}
            unit={unit}
          />
        );
      }}
    </TimelineStateConsumer>
  );
};

const formatLabel = (
  [timeStart, _timeEnd]: [DateDriver, DateDriver],
  unit: TimeUnit,
  labelWidth: number,
  formatOptions = defaultHeaderFormats
) => {
  let format;
  if (unit === "second") {
    // TODO: Please check this and the default values!
    throw new Error(`The "second" unit is not available in the default header formats`);
  }

  if (labelWidth >= 150) {
    format = formatOptions[unit]["long"];
  } else if (labelWidth >= 100) {
    format = formatOptions[unit]["mediumLong"];
  } else if (labelWidth >= 50) {
    format = formatOptions[unit]["medium"];
  } else {
    format = formatOptions[unit]["short"];
  }

  return timeStart.format(format);
};
