import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { GroupRows, GroupRowsProps } from "./group-rows.js";
import { noop } from "../test-helpers/index.js";

const makeSut = (props: Partial<GroupRowsProps> = {}) => {
  const defaultProps: GroupRowsProps = {
    groups: [
      {
        id: "2998",
        rightTitle: "Wolff",
        title: "Carlotta",
      },
      {
        id: "2999",
        rightTitle: '"Sauer"',
        title: "Elmer",
      },
    ],
    canvasBottom: 100,
    canvasTop: 0,
    canvasWidth: 10,
    clickTolerance: 0,
    groupHeights: [30, 27],
    lineCount: 2,
    onRowClick: noop,
    onRowContextClick: noop,
    onRowDoubleClick: noop,
  };

  return [render(<GroupRows {...defaultProps} {...props} />)] as const;
};

describe("<GroupRows />", () => {
  afterEach(cleanup);

  test("passes props and get right height for first group", () => {
    const [{ container }] = makeSut();
    const component = container?.firstElementChild?.childNodes[0];
    if (!component)
      throw new Error("Expected container?.firstElementChild?.childNodes[0] not to be null");
    expect(component).toHaveStyle({ height: "30px" });
  });
});
