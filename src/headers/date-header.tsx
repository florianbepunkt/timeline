import { CustomDateHeader } from "./custom-date-header";
import { CustomHeader } from "./custom-header";
import { defaultHeaderFormats } from "../default-config";
import { format } from "date-fns";
import { getNextUnit } from "../utility/calendar";
import { LocalizationContext, TimelineContext } from "../timeline";
import memoize from "memoize-one";
import React from "react";
import type { DateHeaderProps, IntervalRenderer, TimeUnit } from "../types";

export const DateHeader = <Data,>({
  className,
  headerData,
  height,
  intervalRenderer,
  labelFormat,
  style,
  unit,
}: DateHeaderProps<Data>) => {
  const { locale } = React.useContext(LocalizationContext);
  const { timelineUnit } = React.useContext(TimelineContext);
  const defaultFormatter = React.useCallback(
    (
      [timeStart, _timeEnd]: [Date | number, Date | number],
      unit: TimeUnit,
      labelWidth: number,
      formatOptions = defaultHeaderFormats
    ) => {
      let dateFnsFormat;
      if (unit === "second")
        throw new Error(`The "second" unit is not available in the default header formats`);

      if (labelWidth >= 150) {
        dateFnsFormat = formatOptions[unit]["long"];
      } else if (labelWidth >= 100) {
        dateFnsFormat = formatOptions[unit]["mediumLong"];
      } else if (labelWidth >= 50) {
        dateFnsFormat = formatOptions[unit]["medium"];
      } else {
        dateFnsFormat = formatOptions[unit]["short"];
      }

      return format(timeStart, dateFnsFormat, { locale });
    },
    [locale]
  );

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
    const formatter = labelFormat ?? defaultFormatter;

    if (typeof formatter === "string") {
      const startTime = interval[0];
      return format(startTime, formatter, { locale });
    } else if (typeof formatter === "function") {
      return formatter(interval, unit, labelWidth);
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
