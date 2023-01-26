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
  /**
   * Whether to calculate extra space to the right and left of an item. The calculated value is returned as part of the item context.
   */
  calculateExtraSpace?: boolean;

  /**
   * Height of one line in the calendar in pixels. Default 30
   */
  height?: number;

  /**
   * Unique id for group
   */
  id: Id;

  /**
   * Title in the right sidebar
   */
  rightTitle?: React.ReactNode;

  /**
   * Stack items under each other, so there is no visual overlap when times collide. Can be overridden in the groups array. Defaults to false. Requires millisecond or Moment timestamps, not native JavaScript Date objects.
   */
  stackItems?: boolean;

  /**
   * Title in the sidebar
   */
  title: React.ReactNode;
};

export type TimelineItemBase = {
  canChangeGroup?: boolean;
  canMove?: boolean;
  canResize?: ResizeOptions;
  canSelect?: boolean;
  className?: string;
  endTime: number;
  group: Id;
  id: Id;
  itemProps?: React.HTMLAttributes<HTMLDivElement>;
  startTime: number;
  style?: React.CSSProperties;
  title?: string;
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
