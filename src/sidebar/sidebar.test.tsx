import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Sidebar, SidebarProps } from "./sidebar.js";

const makeSut = (props: Partial<SidebarProps> = {}) => {
  const defaultProps: SidebarProps = {
    canvasBottom: 100,
    canvasTop: 0,
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
    groupHeights: [30, 27],
    width: 10,
  };

  return [render(<Sidebar {...defaultProps} {...props} />)] as const;
};

describe("<Sidebar />", () => {
  afterEach(cleanup);

  test("passes props and get right height for first group", () => {
    const [{ container }] = makeSut();
    const component = container.querySelector("div.rct-sidebar-row");
    expect(component).toHaveStyle({ height: "30px" });
  });

  test.todo("group renderer");
});
