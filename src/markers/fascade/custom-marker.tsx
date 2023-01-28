import { Marker } from "../model";
import { MarkersContext } from "../markers-context";
import React from "react";
import type { Id } from "../../shared-model";
import type { MarkerRenderer } from "../model";

export type CustomMarkerProps = {
  children?: MarkerRenderer;

  date: Date | number;

  /**
   * Unique id for this marker
   */
  id: Id;
};

export const CustomMarker: React.FC<CustomMarkerProps> = ({ date, children, id }) => {
  const { subscribeMarker, updateMarker } = React.useContext(MarkersContext);
  const _unsubscribe = React.useRef<null | (() => void)>(null);
  const _getMarker = React.useRef<null | (() => Marker)>(null);

  React.useEffect(() => {
    const { unsubscribe, getMarker } = subscribeMarker({
      date,
      id,
      renderer: children,
      type: "Custom",
    });

    _unsubscribe.current = unsubscribe;
    _getMarker.current = getMarker;

    return function cleanUp() {
      if (_unsubscribe.current === null) return;
      _unsubscribe.current();
      _unsubscribe.current = null;
    };
  }, [children, date, id, subscribeMarker]);

  React.useEffect(() => {
    if (!_getMarker.current) return;
    const marker = _getMarker.current();
    if (marker.type !== "Custom") return;
    updateMarker({ ...marker, date });
  }, [date, updateMarker]);

  return null;
};
