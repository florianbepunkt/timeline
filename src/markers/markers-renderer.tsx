import { CursorMarker } from "./implementations/cursor-marker.js";
import { CustomMarker } from "./implementations/custom-marker.js";
import { MarkersContext } from "./markers-context.js";
import { match } from "ts-pattern";
import { TimelineContext } from "../timeline/timeline-context.js";
import { NowMarker } from "./implementations/now-marker.js";
import React from "react";

/**
 * Internal component used in timeline to render markers registered
 */
export const MarkersRenderer: React.FC = () => {
  const { getLeftOffsetFromDate } = React.useContext(TimelineContext);
  const { markers } = React.useContext(MarkersContext);
  return (
    <React.Fragment>
      {markers.map((marker) =>
        match(marker)
          .with({ type: "Now" }, ({ id, interval, renderer }) => (
            <NowMarker
              getLeftOffsetFromDate={getLeftOffsetFromDate}
              interval={interval}
              key={id}
              renderer={renderer}
            />
          ))
          .with({ type: "Custom" }, ({ date, id, renderer }) => (
            <CustomMarker
              date={date}
              getLeftOffsetFromDate={getLeftOffsetFromDate}
              key={id}
              renderer={renderer}
            />
          ))
          .with({ type: "Cursor" }, ({ id, renderer }) => <CursorMarker key={id} renderer={renderer} />)
          .exhaustive()
      )}
    </React.Fragment>
  );
};
