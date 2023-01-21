import "../src/timeline.scss";
import { makeDemoData } from "./make-demo-data";
import { Timeline } from "../src";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Timeline/Basic",
  component: Timeline,
  argTypes: {},
} satisfies Meta<typeof Timeline>;

export default meta;
export type Story = StoryObj<typeof Timeline>;

export const Basic: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <Timeline {...makeDemoData()} itemHeight={34} lineHeight={42} stackItems />
    </div>
  ),
};
