import React from "react";
import type { ReactCalendarGroupRendererProps, TimelineGroupBase } from "../types";

export type SidebarProps<CustomGroup extends TimelineGroupBase = TimelineGroupBase> = {
  canvasBottom: number;
  canvasTop: number;
  groupHeights: number[];
  groups: CustomGroup[];
  isRightSidebar?: boolean;
  width: number;
  groupRenderer?: (props: ReactCalendarGroupRendererProps<CustomGroup>) => React.ReactNode;
};

/**
 * TODO: could be optimized with React.memo but seems premature at the moment
 * shouldComponentUpdate(nextProps: Readonly<SidebarProps<Group>>) {
    return !(
      nextProps.width === this.props.width &&
      nextProps.canvasTop === this.props.canvasTop &&
      nextProps.canvasBottom === this.props.canvasBottom &&
      arraysEqual(nextProps.groups, this.props.groups) &&
      arraysEqual(nextProps.groupHeights, this.props.groupHeights)
    );
  }
 */
export const Sidebar = <Group extends TimelineGroupBase = TimelineGroupBase>({
  canvasBottom,
  canvasTop,
  groupHeights,
  groups,
  width,
  groupRenderer,
  isRightSidebar,
}: SidebarProps<Group>): React.ReactElement => {
  const renderGroupContent = (
    group: Group,
    isRightSidebar: boolean | undefined,
    groupTitleKey: keyof Group,
    groupRightTitleKey: keyof Group
  ) =>
    groupRenderer
      ? groupRenderer({ group, isRightSidebar })
      : group[isRightSidebar ? groupRightTitleKey : groupTitleKey];

  const groupsStyle = { width: `${width}px` };
  const sidebarStyle = {
    height: `${canvasBottom - canvasTop}px`,
    top: `${canvasTop}px`,
    width: `${width}px`,
  };

  let currentGroupTop = 0;
  let currentGroupBottom = 0;
  let totalSkippedGroupHeight = 0;

  const groupLines = groups.map((group, index) => {
    const groupHeight = groupHeights[index];

    // Go to the next group
    currentGroupTop = currentGroupBottom;
    currentGroupBottom += groupHeight;

    // Skip if the group is not on the canvas
    if (currentGroupBottom < canvasTop || currentGroupTop > canvasBottom) {
      totalSkippedGroupHeight += groupHeight;
      return undefined;
    }

    const elementStyle: React.CSSProperties = {
      position: "relative",
      top: `${totalSkippedGroupHeight - canvasTop}px`,
      height: `${groupHeights[index]}px`,
      lineHeight: `${groupHeights[index]}px`,
    };

    return (
      <div
        className={"rct-sidebar-row rct-sidebar-row-" + (index % 2 === 0 ? "even" : "odd")}
        key={group.id}
        style={elementStyle}
      >
        {renderGroupContent(group, isRightSidebar, "title", "rightTitle") as React.ReactNode}
      </div>
    );
  });

  return (
    <div className={"rct-sidebar" + (isRightSidebar ? " rct-sidebar-right" : "")} style={sidebarStyle}>
      <div style={groupsStyle}>{groupLines}</div>
    </div>
  );
};
