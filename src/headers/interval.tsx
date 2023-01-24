import { composeEvents } from "../utility/events";
import { endOf, startOf } from "../utility/date";
import { getNextUnit } from "../utility/calendar";
import { TimeUnit } from "../types";
import React from "react";
import type { GetIntervalProps, Interval, IntervalRenderer } from "../types";

export type IntervalProps<HeaderData> = {
  getIntervalProps: (props?: GetIntervalProps) => GetIntervalProps & { key: string | number };
  intervalRenderer?: (props: IntervalRenderer<HeaderData>) => React.ReactNode;
  showPeriod: (startDate: Date | number, endDate: Date | number) => void;

  headerData?: HeaderData;
  interval: Interval;
  intervalText: string;
  primaryHeader: boolean;
  unit: TimeUnit;
};

export const IntervalComponent = <Data,>({
  getIntervalProps: _getIntervalProps,
  headerData,
  interval,
  intervalRenderer,
  intervalText,
  primaryHeader,
  showPeriod,
  unit,
}: IntervalProps<Data>): JSX.Element => {
  const onIntervalClick = () => {
    if (primaryHeader) {
      const nextUnit = getNextUnit(unit);
      const newStartTime = startOf(interval.startTime, nextUnit);
      const newEndTime = endOf(interval.startTime, nextUnit);
      showPeriod(newStartTime, newEndTime);
    } else {
      showPeriod(interval.startTime, interval.endTime);
    }
  };

  const getIntervalProps = (props: GetIntervalProps = {}) => {
    return {
      ..._getIntervalProps({ interval, ...props }),
      onClick: composeEvents(onIntervalClick, props.onClick),
    };
  };

  if (intervalRenderer) {
    return (
      <React.Fragment>
        {intervalRenderer({
          data: headerData,
          getIntervalProps,
          intervalContext: { interval, intervalText },
        })}
      </React.Fragment>
    );
  }

  return (
    <div
      data-testid="dateHeaderInterval"
      {...getIntervalProps({})}
      className={`rct-dateHeader ${primaryHeader ? "rct-dateHeader-primary" : ""}`}
    >
      <span>{intervalText}</span>
    </div>
  );
};
