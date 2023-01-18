import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ScrollElement, ScrollElementProps } from "./ScrollElement";
import { sel, noop } from "../test-helpers";
import { visibleTimeStart, visibleTimeEnd } from "../../__fixtures__/stateAndProps";

const makeSut = (props: Partial<ScrollElementProps> = {}) => {
  const defaultProps: ScrollElementProps = {
    children: <div />,
    getVisibleTimeWindow: () => ({ visibleTimeEnd, visibleTimeStart }),
    height: 800,
    isInteractingWithItem: false,
    onHorizontalScroll: noop,
    onVerticalScrollBy: noop,
    onWheelZoom: noop,
    onZoom: noop,
    scrollHorizontallyByTime: noop,
    scrollRef: noop,
    top: 0,
    width: 1000,
  };

  return [
    render(<ScrollElement {...defaultProps} {...props} />),
    { ...defaultProps, ...props },
  ] as const;
};

const createMouseEvent = (pageX: number) => ({
  button: 0,
  pageX,
  preventDefault: noop,
});

const scrollElementSelector = sel("scroll-element");

test.todo(
  "No clue how this is supposed to work... the old enzyme version modifies / calls components methods directly, which feels like an anti-pattern"
);

// describe.only("ScrollElement", () => {
//   // describe("mouse event delegates", () => {
//   // they are all not used any more
//   // });

//   describe("mouse drag", () => {
//     test.only("scrolls left", () => {
//       const originX = 0;
//       const destinationX = 200;
//       const scrollDifference = -(destinationX - originX);
//       const mouseDownEvent = createMouseEvent(originX);
//       const mouseOverEvent = createMouseEvent(destinationX);

//       // let instance: HTMLDivElement | null = null;

//       const [{ container, getByTestId }] = makeSut();

//       // if (!(instance as HTMLDivElement | null)) throw new Error("");
//       // console.log("instance", (instance as any)._scrollComponent);
//       // (instance as unknown as HTMLDivElement).scrollLeft = originX;

//       const scrollElement = getByTestId("scroll-element");
//       fireEvent.mouseDown(scrollElement, mouseDownEvent);
//       fireEvent.mouseMove(scrollElement, mouseOverEvent);
//       expect(scrollElement.scrollLeft).toBe(originX + scrollDifference);
//     });

//     test.skip("scrolls right", () => {
//       const originX = 300;
//       const destinationX = 100;
//       const scrollDifference = -(destinationX - originX);
//       console.log("scrollDifference", scrollDifference);
//       const mouseDownEvent = createMouseEvent(originX);
//       const mouseOverEvent = createMouseEvent(destinationX);

//       const [{ container }] = makeSut();
//       if (!container.firstElementChild) throw new Error("Expected firstElementChild not to be null");
//       // @ts-ignore
//       container.firstElementChild.scrollComponent.scrollLeft = originX;
//       const scrollElement = container.querySelector(scrollElementSelector);
//       if (!scrollElement) throw new Error("Expected scrollElement not to be null");
//       fireEvent.mouseDown(scrollElement, mouseDownEvent);
//       fireEvent.mouseMove(scrollElement, mouseOverEvent);
//       // @ts-ignore
//       expect(container.firstElementChild.scrollComponent.scrollLeft).toBe(originX + scrollDifference);
//     });
//   });

//   describe.skip("mouse leave", () => {
//     // guard against bug where dragging persisted after mouse leave
//     test.skip("cancels dragging on mouse leave", () => {
//       const { container } = render(
//         <ScrollElement {...defaultProps}>
//           <div />
//         </ScrollElement>
//       );

//       const initialScrollLeft = container.firstElementChild.scrollComponent.scrollLeft;
//       const mouseDownEvent = createMouseEvent(100);
//       const mouseLeaveEvent = createMouseEvent(100);
//       const mouseMoveEvent = createMouseEvent(200);

//       const scrollElement = container.querySelector(scrollElementSelector);
//       fireEvent.mouseDown(scrollElement, mouseDownEvent);
//       fireEvent.mouseLeave(scrollElement, mouseLeaveEvent);
//       fireEvent.mouseMove(scrollElement, mouseMoveEvent);

//       // scrollLeft doesnt move
//       expect(container.firstElementChild.scrollComponent.scrollLeft).toBe(initialScrollLeft);
//     });
//   });

//   describe.skip("scroll", () => {
//     test.skip("calls onScroll with current scrollLeft", () => {
//       const onScrollMock = jest.fn();
//       const props = {
//         ...defaultProps,
//         onScroll: onScrollMock,
//       };

//       const { container } = render(
//         <ScrollElement {...props}>
//           <div />
//         </ScrollElement>
//       );
//       const scrollLeft = 200;
//       container.firstElementChild.scrollComponent.scrollLeft = scrollLeft;

//       fireEvent.scroll(container.querySelector(scrollElementSelector));

//       expect(onScrollMock).toHaveBeenCalledTimes(1);
//     });

//     test.skip("adds width to scrollLeft if scrollLeft is less than half of width", () => {
//       const width = 800;
//       const props = {
//         ...defaultProps,
//         width,
//       };

//       const { container } = render(
//         <ScrollElement {...props}>
//           <div />
//         </ScrollElement>
//       );

//       const currentScrollLeft = 300;
//       container.firstElementChild.scrollComponent.scrollLeft = currentScrollLeft;

//       fireEvent.scroll(container.firstElementChild);

//       expect(container.firstElementChild.scrollComponent.scrollLeft).toBe(currentScrollLeft + width);
//     });

//     test.skip("subtracts width from scrollLeft if scrollLeft is greater than one and a half of width", () => {
//       const width = 800;
//       const props = {
//         ...defaultProps,
//         width,
//       };

//       const { container } = render(
//         <ScrollElement {...props}>
//           <div />
//         </ScrollElement>
//       );

//       const currentScrollLeft = 1300;
//       container.firstElementChild.scrollComponent.scrollLeft = currentScrollLeft;

//       fireEvent.scroll(container.firstElementChild);

//       expect(container.firstElementChild.scrollComponent.scrollLeft).toBe(currentScrollLeft - width);
//     });

//     test.skip("does not alter scrollLeft if scrollLeft is between 0.5 and 1.5 of width", () => {
//       const width = 800;
//       const props = {
//         ...defaultProps,
//         width,
//       };

//       const { container } = render(
//         <ScrollElement {...props}>
//           <div />
//         </ScrollElement>
//       );

//       // three samples between this range
//       const scrolls = [width * 0.5 + 1, width, width * 1.5 - 1];

//       scrolls.forEach((scroll) => {
//         container.firstElementChild.scrollComponent.scrollLeft = scroll;

//         fireEvent.scroll(container.firstElementChild);

//         expect(container.firstElementChild.scrollComponent.scrollLeft).toBe(scroll);
//       });
//     });
//   });
// });
