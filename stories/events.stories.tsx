import "../src/timeline.scss";
import { makeDemoData } from "./make-demo-data.js";
import { Id, Timeline } from "../src/index.js";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Timeline/Events",
  component: Timeline,
  argTypes: {},
} satisfies Meta<typeof Timeline>;

export default meta;
export type Story = StoryObj<typeof Timeline>;

export const Events: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Id[]>([]);

    return (
      <div style={{ height: "100vh" }}>
        <Timeline
          {...makeDemoData()}
          onCanvasClick={() => alert("Canvas clicked")}
          onCanvasContextMenu={() => alert("Canvas context menu")}
          onCanvasDrop={() => alert("Canvas drop")}
          onItemClick={(id) => alert(`Item with id ${id} clicked`)}
          onItemDoubleClick={(id) => alert(`Item with id ${id} double clicked`)}
          onItemSelect={(a: Id) => setSelected([a])}
          onItemDeselect={() => setSelected([])}
          selected={selected}
        />
      </div>
    );
  },
};
