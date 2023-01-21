import { TimelineMarkerType } from "./markerType";

// TODO: we should have better types based on usage in the `TimelineMarkersRenderer.tsx`

type CustomMarkerChildrenProps = {
  styles: React.CSSProperties;
  date: Date | number;
};

type TodayMarker = {
  id?: number;
  type: TimelineMarkerType.Today;
  renderer?: (props: CustomMarkerChildrenProps) => React.ReactNode;
  interval: number;
};

type CursorMarker = {
  id?: number;
  type: TimelineMarkerType.Cursor;
  renderer?: (props: CustomMarkerChildrenProps) => React.ReactNode;
};

type CustomMarker = {
  id?: number;
  type: TimelineMarkerType.Custom;
  renderer?: (props: CustomMarkerChildrenProps) => React.ReactNode;
  date: Date | number;
};

export type Marker = TodayMarker | CursorMarker | CustomMarker;
