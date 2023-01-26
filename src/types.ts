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

export type TimelineHeaderProps = {
  style?: React.CSSProperties;
  className?: string;
  calendarHeaderStyle?: React.CSSProperties;
  calendarHeaderClassName?: string;
  headerRef?: React.Ref<any>;
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

export type ItemContext<TGroup extends TimelineGroupBase> = {
  dimensions: {
    collisionLeft: number;
    collisionWidth: number;
    height: number;
    // isDragging: boolean;
    left: number;
    order: {
      group: TGroup;
      index: number;
    };
    // originalLeft: number;
    stack: boolean;
    top: number | null;
    width: number;
    // Free space to the right of the item in pixels, or null if the space is not limited.
    extraSpaceRight: number | null;
    // Free space to the left of the item in pixels, or null if the space is not limited.
    extraSpaceLeft: number | null;
  };
  useResizeHandle: boolean;
  title: string | undefined;
  canMove: boolean;
  canResizeLeft: boolean;
  canResizeRight: boolean;
  selected: boolean;
  dragging: boolean | null;
  dragStart: {
    x: number;
    y: number;
  } | null;
  dragTime: number | null;
  dragGroupDelta: number | null;
  resizing: boolean | null;
  resizeEdge: TimelineItemEdge | undefined;
  resizeStart: number | null;
  resizeTime: number | null;
  width: number;
};

export type TimeFormat = {
  long: string;
  mediumLong: string;
  medium: string;
  short: string;
};

export type LabelFormat = {
  year: TimeFormat;
  month: TimeFormat;
  week: TimeFormat;
  day: TimeFormat;
  hour: TimeFormat;
  minute: TimeFormat;
};

type ItemRendererSideResizeProps = {
  ref: React.Ref<any>;
  className: string;
  style: React.CSSProperties;
};

export type ItemRendererResizeProps = {
  left?: ItemRendererSideResizeProps;
  right?: ItemRendererSideResizeProps;
};

export type ResizeStyles = {
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
  leftClassName?: string;
  rightClassName?: string;
};

export type MoveResizeValidator<TItem extends TimelineItemBase> = (
  action: "move" | "resize",
  itemId: TItem,
  time: number,
  resizeEdge?: TimelineItemEdge // This value is only available for resize
) => number;

export type ReactCalendarItemRendererProps<
  TItem extends TimelineItemBase,
  TGroup extends TimelineGroupBase
> = {
  item: TItem;
  itemContext: ItemContext<TGroup>;
  timelineContext: TimelineContext;

  getItemProps: (props?: Partial<Omit<TimelineItemProps, "key" | "ref">>) => TimelineItemProps;
  getResizeProps: (styles?: ResizeStyles) => ItemRendererResizeProps;
};

export type Interval = {
  startTime: Date | number;
  endTime: Date | number;
  labelWidth: number;
  left: number;
};

export type GetIntervalProps = {
  interval?: Interval;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
};

export type HeaderContext = {
  intervals: Interval[];
  unit: TimeUnit;
};

// Only used internally for the IntervalRenderer but exported by the library
export type IntervalContext = {
  interval: Interval;
  intervalText: string;
};

export type IntervalRenderer<Data> = {
  intervalContext: IntervalContext;
  getIntervalProps: (props?: GetIntervalProps) => GetIntervalProps & { key: string | number };
  data?: Data;
};

// HEADERS
export type CustomHeaderPropsChildrenFnProps<Data> = {
  timelineContext: Pick<
    TimelineContext,
    "canvasTimeEnd" | "canvasTimeStart" | "timelineWidth" | "visibleTimeEnd" | "visibleTimeStart"
  >;
  headerContext: HeaderContext;
  getIntervalProps: (props?: GetIntervalProps) => GetIntervalProps & { key: string | number };
  getRootProps: (propsToOverride?: { style: React.CSSProperties }) => { style: React.CSSProperties };
  showPeriod: (startDate: Date | number, endDate: Date | number) => void;
  data: Data;
};

export type CustomHeaderProps<Data> = {
  unit?: TimeUnit;
  headerData: Data;
  height?: number;
  children: (props: CustomHeaderPropsChildrenFnProps<Data>) => JSX.Element;
};

export type DateHeaderProps<Data> = {
  style?: React.CSSProperties;
  className?: string;
  unit?: TimeUnit | "primaryHeader";
  labelFormat?:
    | string
    | ((
        [startTime, endTime]: [Date | number, Date | number],
        unit: TimeUnit,
        labelWidth: number
      ) => string);
  intervalRenderer?: (props: IntervalRenderer<Data>) => React.ReactNode;
  headerData?: Data;
  height?: number;
  children?: (props: SidebarHeaderChildrenFnProps<Data>) => React.ReactNode; // TODO: is this used anywhere???
};

// SIDEBAR
export type SidebarHeaderChildrenFnProps<Data> = {
  getRootProps: (propsToOverride?: { style: React.CSSProperties }) => { style: React.CSSProperties };
  data?: Data;
};

export type ReactCalendarGroupRendererProps<CustomGroup extends TimelineGroupBase> = {
  group: CustomGroup;
  isRightSidebar?: boolean;
};

export type SidebarHeaderProps<Data> = {
  variant?: "left" | "right";
  headerData?: Data;
  children?: (props: SidebarHeaderChildrenFnProps<Data>) => JSX.Element;
};

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
