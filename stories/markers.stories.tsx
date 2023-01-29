import "../src/timeline.scss";
import { addDays } from "date-fns";
import {
  CursorMarker as CursorMarkerComponent,
  CustomMarker as CustomMarkerComponent,
  Timeline,
  NowMarker as NowMarkerComponent,
} from "../src/index.js";
import { makeDemoData } from "./make-demo-data.js";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Timeline/Markers",
  component: Timeline,
  argTypes: {},
} satisfies Meta<typeof Timeline>;

export default meta;
export type Story = StoryObj<typeof Timeline>;

const SUT = ({ children }: { children: React.ReactElement }): JSX.Element => (
  <div style={{ height: "100vh" }}>
    <Timeline {...makeDemoData()} itemHeight={34} lineHeight={42} stackItems>
      {children}
    </Timeline>
  </div>
);

export const CursorMarker: Story = {
  render: () => (
    <SUT>
      <CursorMarkerComponent id="cursor-marker-example" />
    </SUT>
  ),
};

export const CustomMarker: Story = {
  render: () => (
    <SUT>
      <CustomMarkerComponent date={addDays(new Date(), 1)} id="custom-marker-example">
        {({ styles }) => {
          const customStyles = {
            ...styles,
            backgroundColor: "deeppink",
            width: "4px",
          };
          return <div style={customStyles} onClick={() => alert("custom handler called")} />;
        }}
      </CustomMarkerComponent>
    </SUT>
  ),
};

export const NowMarker: Story = {
  render: () => (
    <SUT>
      <NowMarkerComponent id="now-marker-example" />
    </SUT>
  ),
};
