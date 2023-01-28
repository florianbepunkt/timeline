import { GroupRow } from "./group-row";
import { mapRange } from "../utility/generators";
import React, { Component } from "react";
import type { TimelineGroupBase } from "../shared-model";

export type GroupRowsProps<TGroup extends TimelineGroupBase = TimelineGroupBase> = {
  canvasWidth: number;
  canvasTop: number;
  canvasBottom: number;
  clickTolerance: number;
  groups: TGroup[];
  groupHeights: number[];
  lineCount: number;
  onRowClick: (event: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => void;
  onRowContextClick: (event: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => void;
  onRowDoubleClick: (event: React.MouseEvent<Element, MouseEvent>, rowIndex: number) => void;
  horizontalLineClassNamesForGroup?: (group: TGroup) => string[] | undefined;
  onRowDrop?: (event: React.DragEvent, rowIndex: number) => void;
};

export class GroupRows<TGroup extends TimelineGroupBase = TimelineGroupBase> extends Component<
  GroupRowsProps<TGroup>
> {
  shouldComponentUpdate(nextProps: GroupRowsProps<TGroup>) {
    return !(
      nextProps.canvasWidth === this.props.canvasWidth &&
      nextProps.canvasTop === this.props.canvasTop &&
      nextProps.canvasBottom === this.props.canvasBottom &&
      nextProps.lineCount === this.props.lineCount &&
      nextProps.groupHeights === this.props.groupHeights &&
      nextProps.groups === this.props.groups
    );
  }

  render() {
    const {
      canvasWidth,
      canvasTop,
      canvasBottom,
      lineCount,
      groupHeights,
      onRowDrop,
      onRowClick,
      onRowDoubleClick,
      clickTolerance,
      groups,
      horizontalLineClassNamesForGroup,
      onRowContextClick,
    } = this.props;

    let currentGroupTop = 0;
    let currentGroupBottom = 0;
    let totalSkippedGroupHeight = 0;

    return (
      <div className="rct-horizontal-lines">
        {Array.from(
          mapRange(0, lineCount, (index) => {
            const group = groups[index];
            const groupHeight = groupHeights[index];

            // Go to the next group
            currentGroupTop = currentGroupBottom;
            currentGroupBottom += groupHeight;

            // Skip if the group is not on the canvas
            if (currentGroupBottom < canvasTop || currentGroupTop > canvasBottom) {
              totalSkippedGroupHeight += groupHeight;
              return undefined;
            }

            return (
              <GroupRow
                clickTolerance={clickTolerance}
                group={group}
                horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
                isEvenRow={index % 2 === 0}
                key={`horizontal-line-${index}`}
                onClick={(evt) => onRowClick(evt, index)}
                onContextMenu={(evt) => onRowContextClick(evt, index)}
                onDoubleClick={(evt) => onRowDoubleClick(evt, index)}
                onDrop={onRowDrop !== undefined ? (evt) => onRowDrop(evt, index) : undefined}
                style={{
                  position: "relative",
                  top: `${totalSkippedGroupHeight - canvasTop}px`,
                  width: `${canvasWidth}px`,
                  height: `${groupHeights[index]}px`,
                }}
              />
            );
          })
        )}
      </div>
    );
  }
}
