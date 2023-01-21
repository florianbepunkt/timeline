import "../src/timeline.scss";
import { makeDemoData } from "./make-demo-data";
import { Timeline } from "../src";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Timeline/Headers",
  component: Timeline,
  argTypes: {},
} satisfies Meta<typeof Timeline>;

export default meta;
export type Story = StoryObj<typeof Timeline>;

export const CustomHeader: Story = {};

export const DateHeader: Story = {};

export const SidebarHeader: Story = {};
