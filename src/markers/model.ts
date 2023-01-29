import { Id } from "../shared-model.js";

export type Marker = NowMarker | CursorMarker | CustomMarker;

export type MarkerKind = "Cursor" | "Custom" | "Now";

export type SubscriptionCallback = (value: {
  date: number;
  isCursorOverCanvas: boolean;
  leftOffset: number;
}) => void;

export type MarkerRenderer = ({
  date,
  styles,
}: {
  date: Date | number;
  styles: React.CSSProperties;
}) => React.ReactElement;

type NowMarker = {
  id: Id;
  interval: number;
  renderer?: MarkerRenderer;
  type: "Now";
};

type CursorMarker = {
  id: Id;
  renderer?: MarkerRenderer;
  type: "Cursor";
};

type CustomMarker = {
  date: Date | number;
  id: Id;
  renderer?: MarkerRenderer;
  type: "Custom";
};
