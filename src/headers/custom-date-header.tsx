import IntervalComponent from "./interval";
import React from "react";
import type { DateDriver } from "../utility";
import type { TimeUnit, GetIntervalProps, HeaderContext, IntervalRenderer } from "../types";

type HeaderData<Data> = {
  getLabelFormat: (interval: [DateDriver, DateDriver], unit: TimeUnit, labelWidth: number) => string;
  intervalRenderer?: (props: IntervalRenderer<Data>) => React.ReactNode;

  className?: string | undefined;
  headerData?: Data;
  style: React.CSSProperties;
  unitProp?: TimeUnit | "primaryHeader";
};

type CustomDateHeaderProps<Data> = {
  getRootProps: (propsToOverride?: { style: React.CSSProperties }) => { style: React.CSSProperties };
  getIntervalProps: (props?: GetIntervalProps) => GetIntervalProps & { key: string | number };
  showPeriod: (startDate: DateDriver, endDate: DateDriver) => void;

  data: HeaderData<Data>;
  headerContext: HeaderContext;
};

export function CustomDateHeader<Data>({
  data: { style, intervalRenderer, className, getLabelFormat, unitProp, headerData },
  getIntervalProps,
  getRootProps,
  headerContext: { intervals, unit },
  showPeriod,
}: CustomDateHeaderProps<Data>) {
  return (
    <div data-testid={`dateHeader`} className={className} {...getRootProps({ style })}>
      {intervals.map((interval) => {
        const intervalText = getLabelFormat(
          [interval.startTime, interval.endTime],
          unit,
          interval.labelWidth
        );
        return (
          <IntervalComponent
            getIntervalProps={getIntervalProps}
            headerData={headerData}
            interval={interval}
            intervalRenderer={intervalRenderer}
            intervalText={intervalText}
            key={`label-${interval.startTime.valueOf()}`}
            primaryHeader={unitProp === "primaryHeader"}
            showPeriod={showPeriod}
            unit={unit}
          />
        );
      })}
    </div>
  );
}
