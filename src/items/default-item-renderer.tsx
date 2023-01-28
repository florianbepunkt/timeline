import type { ItemContext, ItemRendererResizeProps, ResizeStyles, TimelineItemProps } from "./item";
import type { TimelineGroupBase, TimelineItemBase } from "../shared-model";

type DefaultItemRendererProps<TGroup extends TimelineGroupBase, TItem extends TimelineItemBase> = {
  item: TItem;
  itemContext: ItemContext<TGroup>;
  getItemProps: (itemProps?: Partial<Omit<TimelineItemProps, "key" | "ref">>) => TimelineItemProps;
  getResizeProps: (styles?: ResizeStyles) => ItemRendererResizeProps;
};

export const defaultItemRenderer = <TGroup extends TimelineGroupBase, TItem extends TimelineItemBase>(
  props: DefaultItemRendererProps<TGroup, TItem>
): React.ReactElement => {
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
};
