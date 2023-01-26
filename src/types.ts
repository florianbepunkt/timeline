import type { TimelineContext } from "./timeline";
import type React from "react";

// TODO: this is a big ball of mud... this should be split up and colocated to where it is used

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Id = number | string;

export type ClickType = "touch" | "click";

export type TimelineItemEdge = "left" | "right";

export type ResizeOptions = boolean | TimelineItemEdge | "both";

export type CompleteTimeSteps = {
  second: number;
  minute: number;
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
};

export type TimeSteps = Partial<CompleteTimeSteps>;

export type TimeUnit = keyof CompleteTimeSteps;

export type TimelineGroupBase = {
  id: Id;
  title: React.ReactNode;
  rightTitle?: React.ReactNode;
  height?: number;
  stackItems?: boolean;
  calculateExtraSpace?: boolean;
};

export type TimelineItemBase = {
  id: Id;
  group: Id;
  title?: string;
  startTime: number;
  endTime: number;
  canMove?: boolean;
  canResize?: ResizeOptions;
  canChangeGroup?: boolean;
  canSelect?: boolean;
  className?: string;
  style?: React.CSSProperties;
  itemProps?: React.HTMLAttributes<HTMLDivElement>;
};

export type TimelineItemProps = {
  key: Id;
  ref: React.Ref<any>;
  className: string;
  onMouseDown: React.MouseEventHandler;
  onMouseUp: React.MouseEventHandler;
  onTouchStart: React.TouchEventHandler;
  onTouchEnd: React.TouchEventHandler;
  onDoubleClick: React.MouseEventHandler;
  onContextMenu: React.ReactEventHandler;
  style: React.CSSProperties;
};

export type MoveResizeValidator<TItem extends TimelineItemBase> = (
  action: "move" | "resize",
  itemId: TItem,
  time: number,
  resizeEdge?: TimelineItemEdge // This value is only available for resize
) => number;

// MARKERS
export type CustomMarkerChildrenProps = {
  styles: React.CSSProperties;
  date: Date | number;
};

export type MarkerProps = {
  date: Date | number;
  children?: (props: CustomMarkerChildrenProps) => React.ReactNode;
};

export type TodayMarkerProps = Optional<MarkerProps, "date"> & {
  interval?: number;
};

export type CursorMarkerProps = Omit<MarkerProps, "date">;
