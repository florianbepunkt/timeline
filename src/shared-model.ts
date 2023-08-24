import type { Dimensions } from "./utility/calendar/index.js";
import type React from "react";

export type Id = number | string;

export type ClickType = "touch" | "click";

export type TimelineItemEdge = "left" | "right";

export type ResizeOptions = TimelineItemEdge | "both";

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
  /**
   * Can item be moved between groups?
   */
  canChangeGroup?: boolean;

  /**
   * Can item be dragged around?
   */
  canMove?: boolean;

  /**
   * Can items be resized?
   */
  canResize?: ResizeOptions;

  /**
   * Can item be selected?
   */
  canSelect?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * End time as timestamp
   */
  endTime: number;

  /**
   * Group this item belongs to
   */
  group: Id;

  /**
   * Unique item id
   */
  id: Id;

  /**
   * These optional attributes are passed to the root <div /> of each item as <div {...itemProps} />
   */
  itemProps?: React.HTMLAttributes<HTMLDivElement>;

  /**
   * Start time as timestamp
   */
  startTime: number;

  /**
   * Additionals styles
   */
  style?: React.CSSProperties;

  /**
   * Title
   */
  title?: string;
};

export type MoveResizeValidator<TItem extends TimelineItemBase = TimelineItemBase> = (
  action: "move" | "resize",
  itemId: TItem,
  time: number,
  resizeEdge?: TimelineItemEdge // This value is only available for resize
) => number;

export type TimelineState<CustomGroup extends TimelineGroupBase = TimelineGroupBase> = {
  canvasBottom: number;
  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasTop: number;
  dragGroupTitle: React.ReactNode | null;
  dragTime: number | null;
  resizeTime: number | null;
  resizingEdge: TimelineItemEdge | null;
  resizingItem: Id | null;
  selectedItem: null | Id;
  visibleTimeEnd: number;
  visibleTimeStart: number;
  width: number;

  // Hidden props without initial values (at least in the original implementation)
  dimensionItems: {
    id: Id;
    dimensions: Dimensions<CustomGroup>;
  }[];
  height: number;
  groupHeights: number[];
  groupTops: number[];
  newGroupOrder: number | null;
  draggingItem: Id | null;
};
