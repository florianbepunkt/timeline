import { describe, expect, test, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { noop } from "../test-helpers/index.js";
import { PreventClickOnDrag, PreventClickOnDragProps } from "./prevent-click-on-drag.js";
import React from "react";
import userEvent from "@testing-library/user-event";

const makeSut = (props: Partial<PreventClickOnDragProps & { children?: React.ReactNode }> = {}) => {
  const defaultProps: PreventClickOnDragProps = {
    clickTolerance: 10,
    onClick: noop,
    renderChildren: (props) => <div {...props} />,
  };

  return [
    render(<PreventClickOnDrag {...defaultProps} {...props} />),
    { ...defaultProps, ...props },
  ] as const;
};

describe("<PreventClickOnDrag />", () => {
  test("should prevent click if element is dragged further than clickTolerance pixels forwards", async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    const [{ container }, usedProps] = makeSut({ onClick: onClickMock });
    const originalClientX = 100;
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    fireEvent.mouseDown(container.firstElementChild, { clientX: originalClientX });
    fireEvent.mouseUp(container.firstElementChild, {
      clientX: originalClientX + usedProps.clickTolerance + 1,
    });
    await user.click(container.firstElementChild);
    expect(onClickMock).not.toHaveBeenCalled();
  });

  test("should prevent click if element is dragged further than clickTolerance pixels backwards", async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    const [{ container }, usedProps] = makeSut({ onClick: onClickMock });
    const originalClientX = 100;
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    fireEvent.mouseDown(container.firstElementChild, { clientX: originalClientX });
    fireEvent.mouseUp(container.firstElementChild, {
      clientX: originalClientX - usedProps.clickTolerance - 1,
    });
    await user.click(container.firstElementChild);
    expect(onClickMock).not.toHaveBeenCalled();
  });

  test("should not prevent click if element is dragged less than clickTolerance pixels forwards", async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    const [{ container }, usedProps] = makeSut({ onClick: onClickMock });
    const originalClientX = 100;
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    fireEvent.mouseDown(container.firstElementChild, { clientX: originalClientX });
    fireEvent.mouseUp(container.firstElementChild, {
      clientX: originalClientX + usedProps.clickTolerance - 1,
    });
    await user.click(container.firstElementChild);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test("should not prevent click if element is dragged less than clickTolerance pixels backwards", async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    const [{ container }, usedProps] = makeSut({ onClick: onClickMock });
    const originalClientX = 100;
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    fireEvent.mouseDown(container.firstElementChild, { clientX: originalClientX });
    fireEvent.mouseUp(container.firstElementChild, {
      clientX: originalClientX - usedProps.clickTolerance + 1,
    });
    await user.click(container.firstElementChild);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test("should not prevent click if first interaction was drag but second is click", async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    const [{ container }, usedProps] = makeSut({ onClick: onClickMock });
    const originalClientX = 100;
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    fireEvent.mouseDown(container.firstElementChild, { clientX: originalClientX });
    fireEvent.mouseUp(container.firstElementChild, {
      clientX: originalClientX + usedProps.clickTolerance + 1,
    });
    await user.click(container.firstElementChild);
    expect(onClickMock).not.toHaveBeenCalled();
    fireEvent.mouseDown(container.firstElementChild, { clientX: originalClientX });
    fireEvent.mouseUp(container.firstElementChild, {
      clientX: originalClientX + usedProps.clickTolerance - 1, // less thanthreshold
    });
    await user.click(container.firstElementChild);
    expect(onClickMock).toHaveBeenCalled();
  });

  test("calls all other event handlers in wrapped component", async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    const doubleClickMock = vi.fn();
    const [{ container }] = makeSut({
      renderChildren: (props) => <div {...props} onDoubleClick={doubleClickMock} />,
      onClick: onClickMock,
    });
    if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
    await user.dblClick(container.firstElementChild);
    expect(doubleClickMock).toHaveBeenCalled();
  });
});
