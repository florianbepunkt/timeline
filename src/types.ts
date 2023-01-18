import type { DateDriver } from "./utility";
import type { TimelineContext } from "./timeline";
import type React from "react";

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

export type ITimeSteps = Partial<CompleteTimeSteps>;

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
  resizeEdge: TimelineItemEdge | null;
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
  getItemProps: (props?: Partial<Omit<TimelineItemProps, "key" | "ref">>) => TimelineItemProps;
  getResizeProps: (styles?: ResizeStyles) => ItemRendererResizeProps;
  timelineContext: TimelineContext;
};

export type Interval = {
  startTime: DateDriver;
  endTime: DateDriver;
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

export type CustomHeaderPropsChildrenFnProps<Data> = {
  timelineContext: TimelineContext;
  headerContext: HeaderContext;
  getIntervalProps: (props?: GetIntervalProps) => GetIntervalProps & { key: string | number };
  getRootProps: (propsToOverride?: { style: React.CSSProperties }) => { style: React.CSSProperties };
  showPeriod: (startDate: DateDriver, endDate: DateDriver) => void;
  data: Data;
};

export type SidebarHeaderChildrenFnProps<Data> = {
  getRootProps: (propsToOverride?: { style: React.CSSProperties }) => { style: React.CSSProperties };
  data?: Data;
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
    | (([startTime, endTime]: [DateDriver, DateDriver], unit: TimeUnit, labelWidth: number) => string);
  intervalRenderer?: (props: IntervalRenderer<Data>) => React.ReactNode;
  headerData?: Data;
  height?: number;
  children?: (props: SidebarHeaderChildrenFnProps<Data>) => React.ReactNode; // TODO: is this used anywhere???
};

export type CustomMarkerChildrenProps = {
  styles: React.CSSProperties;
  date: number;
};

export type MarkerProps = {
  date: number; // Originally this was `number | Date` but we can not use `Date` for markers
  children?: (props: CustomMarkerChildrenProps) => React.ReactNode;
};

// TODO: make date optional here, as we default to today....
export type TodayMarkerProps = Optional<MarkerProps, "date"> & {
  interval?: number;
};

export type CursorMarkerProps = Omit<MarkerProps, "date">;

export type ReactCalendarGroupRendererProps<CustomGroup extends TimelineGroupBase> = {
  group: CustomGroup;
  isRightSidebar?: boolean;
};

export type OnItemDragObjectBase = {
  eventType: "move" | "resize";
  itemId: Id;
  time: number;
};

export type OnItemDragObjectMove = OnItemDragObjectBase & {
  eventType: "move";
  newGroupOrder: number;
};

export type OnItemDragObjectResize = OnItemDragObjectBase & {
  eventType: "resize";
  edge?: TimelineItemEdge;
};

export type ReactCalendarTimelineProps<
  CustomItem extends TimelineItemBase = TimelineItemBase,
  CustomGroup extends TimelineGroupBase = TimelineGroupBase
> = {
  groups: CustomGroup[];
  items: CustomItem[];
  children?: React.ReactElement | React.ReactElement[];

  // Whether to calculate extra space to the right and left of an item. The calculated value is
  // returned as part of the item context.
  calculateExtraSpace?: boolean;
  className?: string;
  defaultTimeStart?: Date | number;
  defaultTimeEnd?: Date | number;
  visibleTimeStart?: number;
  visibleTimeEnd?: number;
  selected?: number[];
  sidebarWidth?: number;
  sidebarContent?: React.ReactNode;
  rightSidebarWidth?: number;
  rightSidebarContent?: React.ReactNode;
  dragSnap?: number;
  minResizeWidth?: number;
  lineHeight?: number;
  itemHeight?: number;
  minZoom?: number;
  maxZoom?: number;
  clickTolerance?: number;
  canMove?: boolean;
  canChangeGroup?: boolean;
  canResize?: ResizeOptions;
  useResizeHandle?: boolean;
  stackItems?: boolean;
  itemTouchSendsClick?: boolean;
  timeSteps?: ITimeSteps;
  scrollRef?: React.RefCallback<HTMLElement>;
  zoomSpeed?: { alt: number; ctrl: number; meta: number };
  onItemDrag?(itemDragObject: OnItemDragObjectMove | OnItemDragObjectResize): void;
  onItemMove?(itemId: Id, dragTime: number, newGroupOrder: number): void;
  onItemResize?(itemId: Id, endTimeOrStartTime: number, edge: TimelineItemEdge): void;
  onItemSelect?(itemId: Id, e: any, time: number): void;
  onItemDeselect?(e: React.SyntheticEvent): void;
  onItemClick?(itemId: Id, e: React.SyntheticEvent, time: number): void;
  onItemDoubleClick?(itemId: Id, e: React.SyntheticEvent, time: number): void;
  onItemContextMenu?(itemId: Id, e: React.SyntheticEvent, time: number): void;
  onCanvasClick?(groupId: Id, time: number, e: React.SyntheticEvent): void;
  onCanvasContextMenu?(groupId: Id, time: number, e: React.SyntheticEvent): void;
  onCanvasDoubleClick?(groupId: Id, time: number, e: React.SyntheticEvent): void;
  onCanvasDrop?(groupId: Id, time: number, e: React.DragEvent): void;
  onZoom?(timelineContext: TimelineContext): void;
  moveResizeValidator?: MoveResizeValidator<CustomItem>;
  onTimeChange?(
    visibleTimeStart: number,
    visibleTimeEnd: number,
    updateScrollCanvas: (start: number, end: number) => void
  ): any;
  onBoundsChange?(canvasTimeStart: number, canvasTimeEnd: number): any;
  onVisibleGroupsChanged?(visibleGroupIds: Id[]): void;
  itemRenderer?: (props: ReactCalendarItemRendererProps<CustomItem, CustomGroup>) => React.ReactNode;
  groupRenderer?: (props: ReactCalendarGroupRendererProps<CustomGroup>) => React.ReactNode;
  verticalLineClassNamesForTime?: ((start: number, end: number) => string[]) | undefined;
  horizontalLineClassNamesForGroup?: (group: CustomGroup) => string[];

  // Fields that are in propTypes but not documented
  headerRef?: React.RefCallback<HTMLElement>;

  canSelect?: boolean; // This was missing from the original type
  style?: React.CSSProperties; // This was missing from the original type
};

export type SidebarHeaderProps<Data> = {
  variant?: "left" | "right";
  headerData?: Data;
  children?: (props: SidebarHeaderChildrenFnProps<Data>) => JSX.Element;
};
