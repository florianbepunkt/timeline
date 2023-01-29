import { MarkersContext } from "../markers-context.js";
import React from "react";
import type { Id } from "../../shared-model.js";
import type { MarkerRenderer } from "../model.js";

export type CursorMarkerProps = {
  children?: MarkerRenderer;

  /**
   * Unique id for this marker
   */
  id: Id;
};

export const CursorMarker: React.FC<CursorMarkerProps> = ({ children, id }) => {
  const { subscribeMarker } = React.useContext(MarkersContext);
  const _unsubscribe = React.useRef<null | (() => void)>(null);

  React.useEffect(() => {
    const { unsubscribe } = subscribeMarker({
      id,
      renderer: children,
      type: "Cursor",
    });

    _unsubscribe.current = unsubscribe;

    return function cleanUp() {
      if (_unsubscribe.current !== null && typeof _unsubscribe.current === "function") {
        _unsubscribe.current();
        _unsubscribe.current = null;
      }
    };
  }, []);

  return null;
};
