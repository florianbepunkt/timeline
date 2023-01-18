import { arraysEqual } from "../utility/generic";
import { ReactCalendarGroupRendererProps, TimelineGroupBase } from "../types";
import React, { Component } from "react";

export type SidebarProps<CustomGroup extends TimelineGroupBase = TimelineGroupBase> = {
  canvasBottom: number;
  canvasTop: number;
  groupHeights: number[];
  groups: CustomGroup[];
  isRightSidebar?: boolean;
  width: number;

  groupRenderer?: (props: ReactCalendarGroupRendererProps<CustomGroup>) => React.ReactNode;
};

export class Sidebar<Group extends TimelineGroupBase = TimelineGroupBase> extends Component<
  SidebarProps<Group>
> {
  shouldComponentUpdate(nextProps: Readonly<SidebarProps<Group>>) {
    return !(
      nextProps.width === this.props.width &&
      nextProps.canvasTop === this.props.canvasTop &&
      nextProps.canvasBottom === this.props.canvasBottom &&
      arraysEqual(nextProps.groups, this.props.groups) &&
      arraysEqual(nextProps.groupHeights, this.props.groupHeights)
    );
  }

  renderGroupContent(
    group: Group,
    isRightSidebar: boolean | undefined,
    groupTitleKey: keyof Group,
    groupRightTitleKey: keyof Group
  ) {
    if (this.props.groupRenderer) {
      return this.props.groupRenderer({ group, isRightSidebar });
    } else {
      return group[isRightSidebar ? groupRightTitleKey : groupTitleKey];
    }
  }

  render() {
    const { width, groupHeights, isRightSidebar, canvasTop, canvasBottom } = this.props;

    const sidebarStyle = {
      top: `${canvasTop}px`,
      width: `${width}px`,
      height: `${canvasBottom - canvasTop}px`,
    };

    const groupsStyle = {
      width: `${width}px`,
    };

    let currentGroupTop = 0;
    let currentGroupBottom = 0;
    let totalSkippedGroupHeight = 0;

    const groupLines = this.props.groups.map((group, index) => {
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
          key={group.id}
          className={"rct-sidebar-row rct-sidebar-row-" + (index % 2 === 0 ? "even" : "odd")}
          style={elementStyle}
        >
          {this.renderGroupContent(group, isRightSidebar, "title", "rightTitle") as React.ReactNode}
        </div>
      );
    });

    return (
      <div className={"rct-sidebar" + (isRightSidebar ? " rct-sidebar-right" : "")} style={sidebarStyle}>
        <div style={groupsStyle}>{groupLines}</div>
      </div>
    );
  }
}
