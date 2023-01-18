import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Itch as ItchComponent } from "./Itch";
import React from "react";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Itch",
  component: ItchComponent,
} as ComponentMeta<typeof ItchComponent>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Itch: ComponentStory<typeof ItchComponent> = (args) => <ItchComponent {...args} />;
