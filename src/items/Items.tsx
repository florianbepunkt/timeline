import React, { Component } from "react";

import Item from "./Item";
import type {
  ClickType,
  Id,
  MoveResizeValidator,
  ReactCalendarItemRendererProps,
  ResizeOptions,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemEdge,
} from "../types";
import { arraysEqual, keyBy } from "../utility/generic";
import { getGroupOrders, getVisibleItems } from "../utility/calendar";
import type { ItemDimensions } from "../utility/calendar";

const canResizeLeft = (item: TimelineItemBase, canResize: ResizeOptions) => {
  const value = item.canResize ?? canResize;
  return value === "left" || value === "both";
};

const canResizeRight = (item: TimelineItemBase, canResize: ResizeOptions) => {
  const value = item.canResize ?? canResize;
  return value === "right" || value === "both" || value === true;
};

type Props<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase> = {
  groups: TGroup[];
  items: TItem[];
  dimensionItems: ItemDimensions<TGroup>[];

  canvasTimeStart: number;
  canvasTimeEnd: number;
  canvasWidth: number;
  canvasTop: number;
  canvasBottom: number;

  groupTops?: number[]; // Maybe this can be undefined...

  dragSnap: number;
  minResizeWidth: number;
  selectedItem?: Id | null;
  selected?: Id[] | null;

  canChangeGroup: boolean;
  canMove: boolean;
  canResize: ResizeOptions;
  canSelect: boolean;
  useResizeHandle: boolean;

  moveResizeValidator?: MoveResizeValidator<TItem>;
  itemSelect: (item: Id, clickType: ClickType, event: React.MouseEvent | React.TouchEvent) => void;
  itemDrag: (item: Id, dragTime: number, newGroupIndex: number) => void;
  itemDrop: (item: Id, dragTime: number, newGroupIndex: number) => void;
  itemResizing: (item: Id, resizeTime: number, edge: TimelineItemEdge) => void;
  itemResized: (item: Id, resizeTime: number, edge: TimelineItemEdge, timeDelta: number) => void;

  onItemDoubleClick: (item: Id, event: React.MouseEvent) => void;
  onItemContextMenu: (item: Id, event: React.MouseEvent) => void;

  itemRenderer?: (props: ReactCalendarItemRendererProps<TItem, TGroup>) => React.ReactNode;
  scrollRef: HTMLDivElement | null;
};

export default class Items<
  TGroup extends TimelineGroupBase,
  TItem extends TimelineItemBase
> extends Component<Props<TGroup, TItem>> {
  shouldComponentUpdate(nextProps: Props<TGroup, TItem>) {
    return !(
      arraysEqual(nextProps.groups, this.props.groups) &&
      arraysEqual(nextProps.items, this.props.items) &&
      arraysEqual(nextProps.dimensionItems, this.props.dimensionItems) &&
      nextProps.canvasTimeStart === this.props.canvasTimeStart &&
      nextProps.canvasTimeEnd === this.props.canvasTimeEnd &&
      nextProps.canvasWidth === this.props.canvasWidth &&
      nextProps.canvasTop === this.props.canvasTop &&
      nextProps.canvasBottom === this.props.canvasBottom &&
      nextProps.selectedItem === this.props.selectedItem &&
      nextProps.selected === this.props.selected &&
      nextProps.dragSnap === this.props.dragSnap &&
      nextProps.minResizeWidth === this.props.minResizeWidth &&
      nextProps.canChangeGroup === this.props.canChangeGroup &&
      nextProps.canMove === this.props.canMove &&
      nextProps.canResize === this.props.canResize &&
      nextProps.canSelect === this.props.canSelect
    );
  }

  isSelected(item: TimelineItemBase) {
    if (!this.props.selected) {
      return this.props.selectedItem === item.id;
    } else {
      return this.props.selected.includes(item.id);
    }
  }

  render() {
    const { canvasTimeStart, canvasTimeEnd, canvasTop, canvasBottom, dimensionItems, groups, items } =
      this.props;

    const groupOrders = getGroupOrders(groups);
    const visibleItems = getVisibleItems(items, canvasTimeStart, canvasTimeEnd, groupOrders);
    const sortedDimensionItems = keyBy(dimensionItems, (item) => item.id);

    return (
      <div className="rct-items">
        {visibleItems
          .filter((item) => {
            const dimensions = sortedDimensionItems[item.id]?.dimensions;
            // Don't show the item if we don't know its dimensions or it is completely outside
            // the vertical canvas.
            return !(
              dimensions === undefined ||
              dimensions.top === null ||
              dimensions.top + dimensions.height < canvasTop ||
              dimensions.top > canvasBottom
            );
          })
          .map((item) => {
            const dimensions = sortedDimensionItems[item.id].dimensions;

            if (dimensions.top === null) {
              // This should never happen, we just checked it in the filter above.
              return undefined;
            }

            // Adjust the item top position as we need to place it on the canvas which might not
            // start at position 0.
            const adjustedDimensions = { ...dimensions, ...{ top: dimensions.top - canvasTop } };
            return (
              <Item
                key={item.id}
                item={item}
                order={groupOrders[item.group]}
                dimensions={adjustedDimensions}
                selected={this.isSelected(item)}
                canChangeGroup={
                  item.canChangeGroup !== undefined ? item.canChangeGroup : this.props.canChangeGroup
                }
                canMove={item.canMove !== undefined ? item.canMove : this.props.canMove}
                canResizeLeft={canResizeLeft(item, this.props.canResize)}
                canResizeRight={canResizeRight(item, this.props.canResize)}
                canSelect={item.canSelect !== undefined ? item.canSelect : this.props.canSelect}
                useResizeHandle={this.props.useResizeHandle}
                groupTops={this.props.groupTops ?? []} // I used an empty array here as a default value to make it safer
                canvasTimeStart={this.props.canvasTimeStart}
                canvasTimeEnd={this.props.canvasTimeEnd}
                canvasWidth={this.props.canvasWidth}
                canvasTop={canvasTop}
                dragSnap={this.props.dragSnap}
                minResizeWidth={this.props.minResizeWidth}
                onResizing={this.props.itemResizing}
                onResized={this.props.itemResized}
                moveResizeValidator={this.props.moveResizeValidator}
                onDrag={this.props.itemDrag}
                onDrop={this.props.itemDrop}
                onItemDoubleClick={this.props.onItemDoubleClick}
                onContextMenu={this.props.onItemContextMenu}
                onSelect={this.props.itemSelect}
                itemRenderer={this.props.itemRenderer}
                scrollRef={this.props.scrollRef}
              />
            );
          })}
      </div>
    );
  }
}
