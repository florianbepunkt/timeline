import { generateTimes } from "../utility/calendar";
import { map } from "../utility/generators";
import { TimelineStateConsumer } from "../timeline/TimelineStateContext";
import React, { Component } from "react";
import type { CompleteTimeSteps, TimeUnit } from "../types";

export type ColumnsProps = {
  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasWidth: number;
  height: number;
  lineCount: number;
  minUnit: TimeUnit;
  timeSteps: CompleteTimeSteps;
  verticalLineClassNamesForTime: ((start: number, end: number) => string[]) | undefined;
};

type Props = ColumnsProps & {
  getLeftOffsetFromDate: (time: number) => number;
};

class _Columns extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return !(
      nextProps.canvasTimeEnd === this.props.canvasTimeEnd &&
      nextProps.canvasTimeStart === this.props.canvasTimeStart &&
      nextProps.canvasWidth === this.props.canvasWidth &&
      nextProps.height === this.props.height &&
      nextProps.lineCount === this.props.lineCount &&
      nextProps.minUnit === this.props.minUnit &&
      nextProps.timeSteps === this.props.timeSteps &&
      nextProps.verticalLineClassNamesForTime === this.props.verticalLineClassNamesForTime
    );
  }

  render() {
    const {
      canvasTimeEnd,
      canvasTimeStart,
      getLeftOffsetFromDate,
      height,
      minUnit,
      timeSteps,
      verticalLineClassNamesForTime,
    } = this.props;
    const lines: React.ReactNode[] = Array.from(
      map(generateTimes(canvasTimeStart, canvasTimeEnd, minUnit, timeSteps), ([time, nextTime]) => {
        const minUnitValue = time.get(minUnit === "day" ? "date" : minUnit);
        const firstOfType = minUnitValue === (minUnit === "day" ? 1 : 0);
        const classNames: string[] = [
          "rct-vl",
          firstOfType ? " rct-vl-first" : "",
          minUnit === "day" || minUnit === "hour" || minUnit === "minute"
            ? ` rct-day-${time.day()} `
            : "",
          ...(verticalLineClassNamesForTime
            ? verticalLineClassNamesForTime(
                time.unix() * 1000, // turn into ms, which is what verticalLineClassNamesForTime expects
                nextTime.unix() * 1000 - 1
              ) ?? []
            : []),
        ];

        const left = getLeftOffsetFromDate(time.valueOf());
        const right = getLeftOffsetFromDate(nextTime.valueOf());
        return (
          <div
            key={`line-${time.valueOf()}`}
            className={classNames.join(" ")}
            style={{
              pointerEvents: "none",
              top: "0px",
              left: `${left}px`,
              width: `${right - left}px`,
              height: `${height}px`,
            }}
          />
        );
      })
    );

    return <div className="rct-vertical-lines">{lines}</div>;
  }
}

export const Columns = (props: ColumnsProps) => (
  <TimelineStateConsumer>
    {({ getLeftOffsetFromDate }) => (
      <_Columns getLeftOffsetFromDate={getLeftOffsetFromDate} {...props} />
    )}
  </TimelineStateConsumer>
);
