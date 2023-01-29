import { getGroupOrders, getVisibleItems } from "../utility/calendar/index.js";
import { Item, ItemRendererProps } from "./item.js";
import { keyBy } from "../utility/generic.js";
import React from "react";
import type {
  ClickType,
  Id,
  MoveResizeValidator,
  ResizeOptions,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemEdge,
} from "../shared-model.js";
import type { ItemDimensions } from "../utility/calendar/index.js";

type ItemsProps<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase> = {
  canChangeGroup: boolean;
  canMove: boolean;
  canResize: ResizeOptions;
  canSelect: boolean;
  canvasBottom: number;
  canvasTimeEnd: number;
  canvasTimeStart: number;
  canvasTop: number;
  canvasWidth: number;
  dimensionItems: ItemDimensions<TGroup>[];
  dragSnap: number;
  groups: TGroup[];
  groupTops?: number[]; // Maybe this can be undefined...
  items: TItem[];
  minResizeWidth: number;
  moveResizeValidator?: MoveResizeValidator<TItem>;
  scrollRef: HTMLDivElement | null;
  selected?: Id[] | null;
  selectedItem?: Id | null;
  useResizeHandle: boolean;

  itemDrag: (item: Id, dragTime: number, newGroupIndex: number) => void;
  itemDrop: (item: Id, dragTime: number, newGroupIndex: number) => void;
  itemRenderer?: (props: ItemRendererProps<TItem, TGroup>) => React.ReactElement;
  itemResized: (item: Id, resizeTime: number, edge: TimelineItemEdge, timeDelta: number) => void;
  itemResizing: (item: Id, resizeTime: number, edge: TimelineItemEdge) => void;
  itemSelect: (item: Id, clickType: ClickType, event: React.MouseEvent | React.TouchEvent) => void;
  onItemContextMenu: (item: Id, event: React.MouseEvent) => void;
  onItemDoubleClick: (item: Id, event: React.MouseEvent) => void;
};

// Could be wrapped with React.memo for performance optimization
// const shouldComponentUpdate = (nextProps: ItemsProps<TGroup, TItem>) =>
//   !(
//     arraysEqual(nextProps.groups, props.groups) &&
//     arraysEqual(nextProps.items, props.items) &&
//     arraysEqual(nextProps.dimensionItems, props.dimensionItems) &&
//     nextProps.canvasTimeStart === props.canvasTimeStart &&
//     nextProps.canvasTimeEnd === props.canvasTimeEnd &&
//     nextProps.canvasWidth === props.canvasWidth &&
//     nextProps.canvasTop === props.canvasTop &&
//     nextProps.canvasBottom === props.canvasBottom &&
//     nextProps.selectedItem === props.selectedItem &&
//     nextProps.selected === props.selected &&
//     nextProps.dragSnap === props.dragSnap &&
//     nextProps.minResizeWidth === props.minResizeWidth &&
//     nextProps.canChangeGroup === props.canChangeGroup &&
//     nextProps.canMove === props.canMove &&
//     nextProps.canResize === props.canResize &&
//     nextProps.canSelect === props.canSelect
//   );
export const Items = <TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>(
  props: ItemsProps<TGroup, TItem>
): React.ReactElement => {
  const { canvasTimeStart, canvasTimeEnd, canvasTop, canvasBottom, dimensionItems, groups, items } =
    props;

  const isSelected = ({ id }: TimelineItemBase) =>
    props.selected ? props.selected.includes(id) : props.selectedItem === id;

  const itemIsOnVisibleCanvas = ({ id }: TItem) => {
    const dimensions = sortedDimensionItems[id]?.dimensions;
    // Don't show the item if we don't know its dimensions or it is completely outside
    // the vertical canvas.
    return !(
      dimensions === undefined ||
      dimensions.top === null ||
      dimensions.top + dimensions.height < canvasTop ||
      dimensions.top > canvasBottom
    );
  };

  const groupOrders = getGroupOrders(groups);
  const visibleItems = getVisibleItems(items, canvasTimeStart, canvasTimeEnd, groupOrders);
  const sortedDimensionItems = keyBy(dimensionItems, ({ id }) => id);

  return (
    <div className="rct-items">
      {visibleItems.filter(itemIsOnVisibleCanvas).map((item) => {
        const dimensions = sortedDimensionItems[item.id].dimensions;

        // This should never happen, we just checked it in the filter above.
        if (dimensions.top === null) return undefined;

        // Adjust the item top position as we need to place it on the canvas which might not
        // start at position 0.
        const adjustedDimensions = { ...dimensions, ...{ top: dimensions.top - canvasTop } };

        return (
          <Item
            canChangeGroup={
              item.canChangeGroup !== undefined ? item.canChangeGroup : props.canChangeGroup
            }
            canMove={item.canMove !== undefined ? item.canMove : props.canMove}
            canResizeLeft={canResizeLeft(item, props.canResize)}
            canResizeRight={canResizeRight(item, props.canResize)}
            canSelect={item.canSelect !== undefined ? item.canSelect : props.canSelect}
            canvasTimeEnd={props.canvasTimeEnd}
            canvasTimeStart={props.canvasTimeStart}
            canvasTop={canvasTop}
            canvasWidth={props.canvasWidth}
            dimensions={adjustedDimensions}
            dragSnap={props.dragSnap}
            groupTops={props.groupTops ?? []} // I used an empty array here as a default value to make it safer
            item={item}
            itemRenderer={props.itemRenderer}
            key={item.id}
            minResizeWidth={props.minResizeWidth}
            moveResizeValidator={props.moveResizeValidator}
            onContextMenu={props.onItemContextMenu}
            onDrag={props.itemDrag}
            onDrop={props.itemDrop}
            onItemDoubleClick={props.onItemDoubleClick}
            onResized={props.itemResized}
            onResizing={props.itemResizing}
            onSelect={props.itemSelect}
            order={groupOrders[item.group]}
            scrollRef={props.scrollRef}
            selected={isSelected(item)}
            useResizeHandle={props.useResizeHandle}
          />
        );
      })}
    </div>
  );
};

const canResizeLeft = (item: TimelineItemBase, canResize: ResizeOptions) => {
  const value = item.canResize ?? canResize;
  return value === "left" || value === "both";
};

const canResizeRight = (item: TimelineItemBase, canResize: ResizeOptions) => {
  const value = item.canResize ?? canResize;
  return value === "right" || value === "both";
};
