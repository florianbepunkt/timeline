import { CustomDateHeader } from "./custom-date-header";
import { CustomHeader } from "./custom-header";
import { defaultHeaderFormats } from "../default-config";
import { format } from "date-fns";
import { getNextUnit } from "../utility/calendar";
import { TimelineContext } from "../timeline";
import memoize from "memoize-one";
import React from "react";
import type { DateHeaderProps, IntervalRenderer, TimeUnit } from "../types";

export const DateHeader = <Data,>({
  className,
  headerData,
  height,
  intervalRenderer,
  labelFormat = formatLabel,
  style,
  unit,
}: DateHeaderProps<Data>) => {
  const { timelineUnit } = React.useContext(TimelineContext);
  const getHeaderUnit = (): TimeUnit => {
    if (unit === "primaryHeader") {
      return getNextUnit(timelineUnit);
    } else if (unit) {
      return unit;
    } else {
      return timelineUnit;
    }
  };

  const getRootStyle = memoize(
    (style?: React.CSSProperties): React.CSSProperties => ({ height: 30, ...style })
  );

  const getLabelFormat = (
    interval: [Date | number, Date | number],
    unit: TimeUnit,
    labelWidth: number
  ): string => {
    if (typeof labelFormat === "string") {
      const startTime = interval[0];
      return format(startTime, labelFormat);
    } else if (typeof labelFormat === "function") {
      return labelFormat(interval, unit, labelWidth);
    } else {
      throw new Error("labelFormat should be function or string");
    }
  };

  const getHeaderData = memoize(
    (
      intervalRenderer: ((props: IntervalRenderer<Data>) => React.ReactNode) | undefined,
      style: React.CSSProperties,
      className: string | undefined,
      getLabelFormat: (
        interval: [Date | number, Date | number],
        unit: TimeUnit,
        labelWidth: number
      ) => string,
      unitProp: TimeUnit | "primaryHeader" | undefined,
      headerData: Data | undefined
    ) => ({
      intervalRenderer,
      style,
      className,
      getLabelFormat,
      unitProp,
      headerData,
    })
  );

  return (
    <CustomHeader
      unit={getHeaderUnit()}
      height={height}
      headerData={getHeaderData(
        intervalRenderer,
        getRootStyle(style),
        className,
        getLabelFormat,
        unit,
        headerData
      )}
    >
      {CustomDateHeader}
    </CustomHeader>
  );
};

const formatLabel = (
  [timeStart, _timeEnd]: [Date | number, Date | number],
  unit: TimeUnit,
  labelWidth: number,
  formatOptions = defaultHeaderFormats
) => {
  // TODO: we could swap this out for date-fns rather easily

  let dateFnsFormat;
  if (unit === "second") {
    // TODO: Please check this and the default values!
    throw new Error(`The "second" unit is not available in the default header formats`);
  }

  if (labelWidth >= 150) {
    dateFnsFormat = formatOptions[unit]["long"];
  } else if (labelWidth >= 100) {
    dateFnsFormat = formatOptions[unit]["mediumLong"];
  } else if (labelWidth >= 50) {
    dateFnsFormat = formatOptions[unit]["medium"];
  } else {
    dateFnsFormat = formatOptions[unit]["short"];
  }

  return format(timeStart, dateFnsFormat);
};
