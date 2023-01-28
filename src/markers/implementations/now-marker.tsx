import { createDefaultRenderer, createMarkerStylesWithLeftOffset } from "./shared";
import React from "react";
import type { MarkerRenderer } from "../model";

type NowMarkerProps = {
  getLeftOffsetFromDate: (date: number) => number;
  interval: number;
  renderer?: MarkerRenderer;
};

/** Marker that is placed based on current date.  This component updates itself on
 * a set interval, dictated by the 'interval' prop.
 */
export const NowMarker: React.FC<NowMarkerProps> = ({
  getLeftOffsetFromDate,
  interval,
  renderer = createDefaultRenderer("default-today-line"),
}) => {
  const _intervalToken = React.useRef<NodeJS.Timer | undefined>();
  const [date, setDate] = React.useState(Date.now());

  React.useEffect(() => {
    if (_intervalToken.current) clearInterval(_intervalToken.current);
    _intervalToken.current = createIntervalUpdater(interval);
    return function cleanUp() {
      clearInterval(_intervalToken.current);
    };
  }, [interval]);

  const createIntervalUpdater = (interval: number) =>
    setInterval(() => {
      setDate(Date.now());
    }, interval);

  const leftOffset = getLeftOffsetFromDate(date);
  const styles = createMarkerStylesWithLeftOffset(leftOffset);

  return renderer({ date, styles });
};
