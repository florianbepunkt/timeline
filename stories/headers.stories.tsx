import "../src/timeline.scss";
import { makeDemoData } from "./make-demo-data.js";
import {
  CustomHeader as CustomHeaderComponent,
  DateHeader as DateHeaderComponent,
  SidebarHeader as SidebarHeaderComponent,
  Timeline,
  TimelineHeaders,
} from "../src/index.js";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Timeline/Headers",
  component: Timeline,
  argTypes: {},
} satisfies Meta<typeof Timeline>;

export default meta;
export type Story = StoryObj<typeof Timeline>;

export const CustomHeader: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <Timeline {...makeDemoData()}>
        <TimelineHeaders>
          <CustomHeaderComponent headerData={{}}>{() => <h1>Custom Header</h1>}</CustomHeaderComponent>
        </TimelineHeaders>
      </Timeline>
    </div>
  ),
};

export const DateHeader: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <Timeline {...makeDemoData()}>
        <TimelineHeaders>
          <DateHeaderComponent unit="primaryHeader" />
          <DateHeaderComponent labelFormat={() => "CUSTOM FORMATTER"} />
        </TimelineHeaders>
      </Timeline>
    </div>
  ),
};

export const SidebarHeader: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <Timeline {...makeDemoData()}>
        <TimelineHeaders>
          <SidebarHeaderComponent>{() => <div>Left</div>}</SidebarHeaderComponent>
        </TimelineHeaders>
      </Timeline>
    </div>
  ),
};
