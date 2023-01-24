import { TimelineMarkersConsumer } from "./TimelineMarkersContext";
import { TimelineMarkerType } from "./markerType";
import { TimelineContext } from "../timeline/timeline-context";
import CursorMarker from "./implementations/CursorMarker";
import CustomMarker from "./implementations/CustomMarker";
import React from "react";
import TodayMarker from "./implementations/TodayMarker";

/** Internal component used in timeline to render markers registered */
const TimelineMarkersRenderer = () => {
  const { getLeftOffsetFromDate } = React.useContext(TimelineContext);

  return (
    <TimelineMarkersConsumer>
      {({ markers }) => {
        return markers.map((marker) => {
          switch (marker.type) {
            case TimelineMarkerType.Today:
              return (
                <TodayMarker
                  key={marker.id}
                  getLeftOffsetFromDate={getLeftOffsetFromDate}
                  renderer={marker.renderer}
                  interval={marker.interval}
                />
              );
            case TimelineMarkerType.Custom:
              return (
                <CustomMarker
                  key={marker.id}
                  renderer={marker.renderer}
                  date={marker.date}
                  getLeftOffsetFromDate={getLeftOffsetFromDate}
                />
              );
            case TimelineMarkerType.Cursor:
              return (
                <CursorMarker
                  key={marker.id}
                  renderer={marker.renderer}
                  getLeftOffsetFromDate={getLeftOffsetFromDate}
                />
              );
            default:
              return null;
          }
        });
      }}
    </TimelineMarkersConsumer>
  );
};

export default TimelineMarkersRenderer;
