import { generateTimes, map } from "../utility";
import { TimelineStateContext } from "../timeline";
import React from "react";
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

/**
 * TODO: Could be optimized with React.memo
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
  const { getLeftOffsetFromDate } = React.useContext(TimelineStateContext);

  const lines: React.ReactNode[] = Array.from(
    map(generateTimes(canvasTimeStart, canvasTimeEnd, minUnit, timeSteps), ([time, nextTime]) => {
      const minUnitValue = time.get(minUnit === "day" ? "date" : minUnit);
      const firstOfType = minUnitValue === (minUnit === "day" ? 1 : 0);
      const classNames: string[] = [
        "rct-vl",
        firstOfType ? " rct-vl-first" : "",
        minUnit === "day" || minUnit === "hour" || minUnit === "minute" ? ` rct-day-${time.day()} ` : "",
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
