import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { GroupRow, GroupRowProps } from "./group-row.js";
import { noop } from "../test-helpers/index.js";
import userEvent from "@testing-library/user-event";

const makeSut = (props: Partial<GroupRowProps> = {}) => {
  const defaultProps: GroupRowProps = {
    clickTolerance: 10,
    group: { id: "1", title: "1" },
    isEvenRow: false,
    onClick: noop,
    onContextMenu: noop,
    onDoubleClick: noop,
    style: {},
  };

  return [render(<GroupRow {...defaultProps} {...props} />)] as const;
};

describe("<GroupRow />", () => {
  afterEach(cleanup);

  test("calls passed in onDoubleClick", async () => {
    const user = userEvent.setup();
    const onDoubleClickMock = vi.fn();
    const [{ container }] = makeSut({ onDoubleClick: onDoubleClickMock });
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    await user.dblClick(container.firstElementChild);
    expect(onDoubleClickMock).toHaveBeenCalledTimes(1);
  });

  test("calls passed in onClick", async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    const [{ container }] = makeSut({ onClick: onClickMock });
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    await user.click(container.firstElementChild);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test("calls passed in onContextMenu", () => {
    const onContextMenuMock = vi.fn();
    const [{ container }] = makeSut({ onContextMenu: onContextMenuMock });
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    fireEvent.contextMenu(container.firstElementChild);
    expect(onContextMenuMock).toHaveBeenCalledTimes(1);
  });

  test('assigns "rct-hl-even" class if isEvenRow is true', () => {
    const [{ container }] = makeSut({ isEvenRow: true });
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    expect(container.firstElementChild.className.trim()).toBe("rct-hl-even");
  });

  test('assigns "rct-hl-odd" if isEvenRow is false', () => {
    const [{ container }] = makeSut({ isEvenRow: false });
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    expect(container.firstElementChild.className.trim()).toBe("rct-hl-odd");
  });

  test("passes style prop to style", () => {
    const [{ container }] = makeSut({ style: { border: "1px solid black" } });
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    expect(container.firstElementChild).toHaveStyle({ border: "1px solid black" });
  });
});
