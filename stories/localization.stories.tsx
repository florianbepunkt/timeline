import "../src/timeline.scss";
import { de } from "date-fns/locale";
import { makeDemoData } from "./make-demo-data.js";
import { Timeline } from "../src/index.js";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Timeline/Localization",
  component: Timeline,
  argTypes: {},
} satisfies Meta<typeof Timeline>;

export default meta;
export type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <Timeline {...makeDemoData()} itemHeight={34} lineHeight={42} stackItems />
    </div>
  ),
};

export const WithLocale: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <Timeline {...makeDemoData()} locale={de} itemHeight={34} lineHeight={42} stackItems />
    </div>
  ),
};
