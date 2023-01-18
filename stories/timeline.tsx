import "../src/Timeline.scss";
import { jsDateDriver } from "../src/utility";
import { Timeline } from "../src";
import React from "react";
import type { TimelineGroupBase, TimelineItemBase } from "../src/types";

const groups: TimelineGroupBase[] = [];

for (let id = 0; id < 2000; id++) {
  groups.push({ id: id.toString(), title: `Group ${id}` });
}

const items: TimelineItemBase[] = [];

type RelativeTimeWindow = {
  startOffset: number;
  duration: number;
};

const rowDefinitions: RelativeTimeWindow[][] = [
  [
    {
      startOffset: -2,
      duration: 1,
    },
    {
      startOffset: 0,
      duration: 2,
    },
    {
      startOffset: 3,
      duration: 2,
    },
  ],
  [
    {
      startOffset: -1,
      duration: 4,
    },
    {
      startOffset: 4,
      duration: 3,
    },
  ],
];

const dateDriver = jsDateDriver;

const _baseDate = dateDriver().startOf("hour").valueOf();
const getBaseDate = () => dateDriver(_baseDate);

for (let group = 0; group < groups.length; group++) {
  const rowDefinition = rowDefinitions[group % rowDefinitions.length];
  for (let item = 0; item < rowDefinition.length; item++) {
    const itemDefinition = rowDefinition[item];
    const start = getBaseDate().add(itemDefinition.startOffset, "hour").valueOf();
    const end = dateDriver(start).add(itemDefinition.duration, "hour").valueOf();
    items.push({
      id: `${group}-${item}`,
      group: group.toString(),
      title: `Group ${group} / Item ${item}`,
      startTime: start,
      endTime: end,
    });
  }
}

export const BasicTimeline = (): JSX.Element => (
  <div style={{ height: "100vh" }}>
    <Timeline
      defaultTimeEnd={getBaseDate().add(12, "hour").valueOf()}
      defaultTimeStart={getBaseDate().add(-12, "hour").valueOf()}
      groups={groups}
      itemHeight={34}
      items={items}
      lineHeight={42}
      stackItems
    />
  </div>
);
