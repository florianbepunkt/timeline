import { describe, expect, test } from "vitest";
import { items, groups } from "../../../__fixtures__/itemsAndGroups";
import {
  props,
  propsNoStack,
  state,
  stateMoveItem,
  stateResizeItemLeft,
  stateResizeItemRight,
} from "../../../__fixtures__/stateAndProps";
import { stackTimelineItems } from "./calendar";
import type { TimelineItemEdge } from "../../types";

describe("stackItems", () => {
  test("work as expected", () => {
    expect(
      stackTimelineItems({
        calculateExtraSpace: false,
        canvasTimeEnd: state.canvasTimeEnd,
        canvasTimeStart: state.canvasTimeStart,
        canvasWidth: 9000,
        draggingItem: state.draggingItem ?? null,
        dragTime: state.dragTime,
        groups,
        itemHeight: props.itemHeightRatio,
        items,
        lineHeight: props.lineHeight,
        newGroupOrder: state.newGroupOrder,
        resizeTime: state.resizeTime,
        resizingEdge: state.resizingEdge,
        resizingItem: state.resizingItem,
        stackItems: props.stackItems,
      })
    ).toMatchSnapshot();
  });

  test("work as expected no stack", () => {
    expect(
      stackTimelineItems({
        calculateExtraSpace: false,
        canvasTimeEnd: state.canvasTimeEnd,
        canvasTimeStart: state.canvasTimeStart,
        canvasWidth: 9000,
        draggingItem: state.draggingItem ?? null,
        dragTime: state.dragTime,
        groups,
        itemHeight: propsNoStack.itemHeightRatio,
        items,
        lineHeight: propsNoStack.lineHeight,
        newGroupOrder: state.newGroupOrder,
        resizeTime: state.resizeTime,
        resizingEdge: state.resizingEdge,
        resizingItem: state.resizingItem,
        stackItems: propsNoStack.stackItems,
      })
    ).toMatchSnapshot();
  });

  test("should stack items while moving an item", () => {
    expect(
      stackTimelineItems({
        calculateExtraSpace: false,
        canvasTimeEnd: stateMoveItem.canvasTimeEnd,
        canvasTimeStart: stateMoveItem.canvasTimeStart,
        canvasWidth: 9000,
        draggingItem: stateMoveItem.draggingItem,
        dragTime: stateMoveItem.dragTime,
        groups,
        itemHeight: props.itemHeightRatio,
        items,
        lineHeight: props.lineHeight,
        newGroupOrder: stateMoveItem.newGroupOrder,
        resizeTime: stateMoveItem.resizeTime,
        resizingEdge: stateMoveItem.resizingEdge,
        resizingItem: stateMoveItem.resizingItem,
        stackItems: props.stackItems,
      })
    ).toMatchSnapshot();
  });

  test("should stack items while resize item left", () => {
    expect(
      stackTimelineItems({
        calculateExtraSpace: false,
        items,
        groups,
        canvasWidth: 9000,
        canvasTimeStart: stateResizeItemLeft.canvasTimeStart,
        canvasTimeEnd: stateResizeItemLeft.canvasTimeEnd,
        lineHeight: props.lineHeight,
        itemHeight: props.itemHeightRatio,
        stackItems: props.stackItems,
        draggingItem: stateResizeItemLeft.draggingItem ?? null,
        resizingItem: stateResizeItemLeft.resizingItem,
        dragTime: stateResizeItemLeft.dragTime,
        resizingEdge: stateResizeItemLeft.resizingEdge as TimelineItemEdge,
        resizeTime: stateResizeItemLeft.resizeTime,
        newGroupOrder: stateResizeItemLeft.newGroupOrder,
      })
    ).toMatchSnapshot();
  });

  test("should stack items while resize item right", () => {
    expect(
      stackTimelineItems({
        calculateExtraSpace: false,
        canvasTimeEnd: stateResizeItemRight.canvasTimeEnd,
        canvasTimeStart: stateResizeItemRight.canvasTimeStart,
        canvasWidth: 9000,
        draggingItem: stateResizeItemRight.draggingItem ?? null,
        dragTime: stateResizeItemRight.dragTime,
        groups,
        itemHeight: props.itemHeightRatio,
        items,
        lineHeight: props.lineHeight,
        newGroupOrder: stateResizeItemRight.newGroupOrder,
        resizeTime: stateResizeItemRight.resizeTime,
        resizingEdge: stateResizeItemRight.resizingEdge as TimelineItemEdge,
        resizingItem: stateResizeItemRight.resizingItem,
        stackItems: props.stackItems,
      })
    ).toMatchSnapshot();
  });

  test("should return empty dimensions if groups are empty", () => {
    expect(
      stackTimelineItems({
        calculateExtraSpace: false,
        items,
        groups: [],
        canvasWidth: 9000,
        canvasTimeStart: state.canvasTimeStart,
        canvasTimeEnd: state.canvasTimeEnd,
        lineHeight: props.lineHeight,
        itemHeight: props.itemHeightRatio,
        stackItems: props.stackItems,
        draggingItem: state.draggingItem ?? null,
        resizingItem: state.resizingItem,
        dragTime: state.dragTime,
        resizingEdge: state.resizingEdge,
        resizeTime: state.resizeTime,
        newGroupOrder: state.newGroupOrder,
      })
    ).toMatchObject({
      dimensionItems: [],
      height: 0,
      groupHeights: [],
      groupTops: [],
    });
  });
});
