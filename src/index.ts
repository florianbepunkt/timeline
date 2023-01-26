export { CursorMarker } from "./markers/public/CursorMarker";
export { CustomHeader, DateHeader, SidebarHeader, TimelineHeaders } from "./headers";
export { CustomMarker } from "./markers/public/CustomMarker";
export { defaultTimeSteps, defaultHeaderFormats } from "./default-config";
export { Timeline, TimelineContext } from "./timeline";
export { TodayMarker } from "./markers/public/TodayMarker";
export type { TimelineProps } from "./timeline";

// TODO: remove these completely
export type {
  CompleteTimeSteps,
  CursorMarkerProps,
  CustomMarkerChildrenProps,
  Id,
  MarkerProps,
  ResizeOptions,
  TimelineGroupBase,
  TimelineItemBase,
  TimeUnit,
  TodayMarkerProps,
} from "./types";
