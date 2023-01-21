import { jsDateDriver } from "../src/utility";
import type { TimelineGroupBase, TimelineItemBase } from "../src/types";

type RelativeTimeWindow = {
  startOffset: number;
  duration: number;
};

const dateDriver = jsDateDriver;

const generateGroups = (amount = 2000): TimelineGroupBase[] => {
  const groups: TimelineGroupBase[] = [];
  for (let id = 0; id < amount; id++) groups.push({ id: id.toString(), title: `Group ${id}` });
  return groups;
};

const generateItems = (groups: TimelineGroupBase[]) => {
  const items: TimelineItemBase[] = [];
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

  for (let group = 0; group < groups.length; group++) {
    const rowDefinition = rowDefinitions[group % rowDefinitions.length];
    for (let item = 0; item < rowDefinition.length; item++) {
      const itemDefinition = rowDefinition[item];
      const start = dateDriver().add(itemDefinition.startOffset, "hour").valueOf();
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

  return items;
};

export const makeDemoData = () => {
  const groups = generateGroups();
  const items = generateItems(groups);
  return {
    defaultTimeEnd: dateDriver().add(12, "hour").valueOf(),
    defaultTimeStart: dateDriver().add(-12, "hour").valueOf(),
    groups,
    items,
  } as const;
};

// export const BasicTimeline = (): JSX.Element => (
//   <div style={{ height: "100vh" }}>
//     <Timeline
//       defaultTimeEnd={dateDriver().add(12, "hour").valueOf()}
//       defaultTimeStart={dateDriver().add(-12, "hour").valueOf()}
//       groups={groups}
//       itemHeight={34}
//       items={items}
//       lineHeight={42}
//       stackItems
//     />
//   </div>
// );
