import { generateTimes, map } from "../utility";
import { getByUnit } from "../utility/date";
import { TimelineContext } from "../timeline";
import React from "react";
import type { CompleteTimeSteps, TimeUnit } from "../shared-model";

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

/**
 * TODO: Could be optimized with React.memo, but premature at the moment
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
 * @returns 
 */

export const Columns: React.FC<ColumnsProps> = ({
  canvasTimeEnd,
  canvasTimeStart,
  height,
  minUnit,
  timeSteps,
  verticalLineClassNamesForTime,
}) => {
  const { getLeftOffsetFromDate } = React.useContext(TimelineContext);

  const lines: React.ReactNode[] = Array.from(
    map(generateTimes(canvasTimeStart, canvasTimeEnd, minUnit, timeSteps), ([time, nextTime]) => {
      const minUnitValue = getByUnit(time, minUnit);
      const firstOfType = minUnitValue === (minUnit === "day" ? 1 : 0);
      const classNames: string[] = [
        "rct-vl",
        firstOfType ? " rct-vl-first" : "",
        minUnit === "day" || minUnit === "hour" || minUnit === "minute"
          ? ` rct-day-${getByUnit(time, "day")} `
          : "",
        ...(verticalLineClassNamesForTime
          ? verticalLineClassNamesForTime(
              time.valueOf(), // verticalLineClassNamesForTime expects time in ms
              nextTime.valueOf() - 1
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
            height: `${height}px`,
            left: `${left}px`,
            pointerEvents: "none",
            top: "0px",
            width: `${right - left}px`,
          }}
        />
      );
    })
  );

  return <div className="rct-vertical-lines">{lines}</div>;
};
