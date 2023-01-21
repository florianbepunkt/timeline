import { BasicTimeline } from "./timeline";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Timeline",
  component: BasicTimeline,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof BasicTimeline>;

export default meta;
type Story = StoryObj<typeof BasicTimeline>;

export const Simple: Story = {};
