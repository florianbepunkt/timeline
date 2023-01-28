import { MarkersContext } from "../markers-context";
import React from "react";
import type { Id } from "../../shared-model";
import type { Marker, MarkerRenderer } from "../model";

export type NowMarkerProps = {
  children?: MarkerRenderer;
  date?: Date | number;

  /**
   * Unique id for this marker
   */
  id: Id;

  interval?: number;
};

export const NowMarker: React.FC<NowMarkerProps> = ({ children, date, id, interval }) => {
  const DEFAULT_INTERVAL = 1000 * 10;
  const { subscribeMarker, updateMarker } = React.useContext(MarkersContext);
  const _unsubscribe = React.useRef<null | (() => void)>(null);
  const _getMarker = React.useRef<null | (() => Marker)>(null);

  React.useEffect(() => {
    const { unsubscribe, getMarker } = subscribeMarker({
      id,
      interval: interval ?? DEFAULT_INTERVAL,
      renderer: children,
      type: "Now",
    });

    _unsubscribe.current = unsubscribe;
    _getMarker.current = getMarker;

    return function cleanUp() {
      if (_unsubscribe.current === null) return;
      _unsubscribe.current();
      _unsubscribe.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!_getMarker.current) return;
    const marker = _getMarker.current();
    if (marker.type !== "Now") return; // We can only update interval for today marker

    updateMarker({
      ...marker,
      interval: interval ?? DEFAULT_INTERVAL,
    });
  }, [interval]);

  return null;
};
