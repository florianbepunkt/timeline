import { BasicTimeline } from "./timeline";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Basic",
  component: BasicTimeline,
} as ComponentMeta<typeof BasicTimeline>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Itch: ComponentStory<typeof BasicTimeline> = (args) => <BasicTimeline {...args} />;
