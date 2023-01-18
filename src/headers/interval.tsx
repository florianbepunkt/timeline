import { composeEvents } from "../utility/events";
import { getNextUnit } from "../utility/calendar";
import { TimeUnit } from "../types";
import React from "react";
import type { DateDriver } from "../utility";
import type { GetIntervalProps, Interval, IntervalRenderer } from "../types";

type IntervalProps<Data> = {
  getIntervalProps: (props?: GetIntervalProps) => GetIntervalProps & { key: string | number };
  intervalRenderer?: (props: IntervalRenderer<Data>) => React.ReactNode;
  showPeriod: (startDate: DateDriver, endDate: DateDriver) => void;

  headerData?: Data;
  interval: Interval;
  intervalText: string;
  primaryHeader: boolean;
  unit: TimeUnit;
};

class IntervalComponent<Data> extends React.PureComponent<IntervalProps<Data>> {
  onIntervalClick = () => {
    const { primaryHeader, interval, unit, showPeriod } = this.props;
    if (primaryHeader) {
      const nextUnit = getNextUnit(unit);
      const newStartTime = interval.startTime.clone().startOf(nextUnit);
      const newEndTime = interval.startTime.clone().endOf(nextUnit);
      showPeriod(newStartTime, newEndTime);
    } else {
      showPeriod(interval.startTime, interval.endTime);
    }
  };

  getIntervalProps = (props: GetIntervalProps = {}) => {
    return {
      ...this.props.getIntervalProps({
        interval: this.props.interval,
        ...props,
      }),
      onClick: composeEvents(this.onIntervalClick, props.onClick),
    };
  };

  render() {
    const { intervalText, interval, intervalRenderer, headerData } = this.props;
    if (intervalRenderer) {
      return intervalRenderer({
        getIntervalProps: this.getIntervalProps,
        intervalContext: {
          interval,
          intervalText,
        },
        data: headerData,
      });
    }

    return (
      <div
        data-testid="dateHeaderInterval"
        {...this.getIntervalProps({})}
        className={`rct-dateHeader ${this.props.primaryHeader ? "rct-dateHeader-primary" : ""}`}
      >
        <span>{intervalText}</span>
      </div>
    );
  }
}

export default IntervalComponent;
