import React from "react";

import type {
  ItemContext,
  ItemRendererResizeProps,
  ResizeStyles,
  TimelineGroupBase,
  TimelineItemBase,
  TimelineItemProps,
} from "../types";

type Props<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase> = {
  item: TItem;
  itemContext: ItemContext<TGroup>;
  getItemProps: (itemProps?: Partial<Omit<TimelineItemProps, "key" | "ref">>) => TimelineItemProps;
  getResizeProps: (styles?: ResizeStyles) => ItemRendererResizeProps;
};

export function defaultItemRenderer<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>(
  props: Props<TGroup, TItem>
) {
  const { item, itemContext, getItemProps, getResizeProps } = props;
  const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
  return (
    <div {...getItemProps(item.itemProps)}>
      {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ""}

      <div className="rct-item-content" style={{ maxHeight: `${itemContext.dimensions.height}` }}>
        {itemContext.title}
      </div>

      {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ""}
    </div>
  );
}
