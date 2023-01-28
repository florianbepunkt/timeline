import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { CustomHeader, CustomHeaderPropsChildrenFnProps } from "./custom-header";
import { DateHeader } from "./date-header";
import { differenceInMonths, format, parse, parseISO } from "date-fns";
import { getCustomHeadersInTimeline, RenderHeadersWrapper, parsePxToNumbers } from "../test-helpers";
import { SidebarHeader } from "./sidebar-header";
import { TimelineHeaders } from "./timeline-headers";

describe("<CustomHeader />", () => {
  afterEach(cleanup);

  test("renders passed unit", () => {
    const { getAllByTestId } = render(
      getCustomHeadersInTimeline({
        unit: "month",
        timelineState: {
          timelineUnit: "month",
          canvasTimeStart: parseISO("2018-06-01").valueOf(),
          canvasTimeEnd: parseISO("2020-06-01").valueOf(),
          visibleTimeStart: parseISO("2019-01-01").valueOf(),
          visibleTimeEnd: parseISO("2020-01-01").valueOf(),
        },
      })
    );

    const intervals = getAllByTestId("customHeaderInterval");
    const start = parse(intervals[0].textContent!, "dd/MM/yyyy", new Date());
    const end = parse(intervals[1].textContent!, "dd/MM/yyyy", new Date());

    expect(differenceInMonths(end, start)).toBe(1);
  });

  test("style does not overridde default values for 'width' and 'position'", () => {
    const { getByTestId } = render(
      getCustomHeadersInTimeline({
        props: { style: { width: 0, position: "fixed" } },
      })
    );
    const { width, position } = getComputedStyle(getByTestId("customHeader"));
    expect(width).not.toBe("0px");
    expect(position).not.toBe("fixed");
  });

  test("renders style", () => {
    const { getByTestId } = render(getCustomHeadersInTimeline({ props: { style: { color: "white" } } }));
    const { color } = getComputedStyle(getByTestId("customHeader"));
    expect(color).toBe("white");
  });

  test("interval does not overridde default values for 'width', 'position' and 'left'", () => {
    const { getAllByTestId } = render(
      getCustomHeadersInTimeline({
        intervalStyle: {
          width: 0,
          position: "fixed",
          left: 1222222,
        },
      })
    );
    const { width, position, left } = getComputedStyle(getAllByTestId("customHeaderInterval")[0]);
    expect(width).not.toBe("0px");
    expect(position).not.toBe("fixed");
    expect(left).not.toBe("1222222px");
  });

  test("renders interval style", () => {
    const { getAllByTestId } = render(
      getCustomHeadersInTimeline({
        intervalStyle: {
          lineHeight: "30px",
          textAlign: "center",
          borderLeft: "1px solid black",
          cursor: "pointer",
          color: "white",
        },
      })
    );

    const { lineHeight, textAlign, borderLeft, cursor, color } = getComputedStyle(
      getAllByTestId("customHeaderInterval")[0]
    );

    expect(lineHeight).toBe("30px");
    expect(textAlign).toBe("center");
    expect(borderLeft).toBe("1px solid black");
    expect(cursor).toBe("pointer");
    expect(color).toBe("white");
  });

  test("unit defaults to timeline if not present", () => {
    const { getAllByTestId } = render(
      getCustomHeadersInTimeline({
        timelineState: {
          //default unit we are testing
          timelineUnit: "month",
          canvasTimeStart: parseISO("2018-06-01").valueOf(),
          canvasTimeEnd: parseISO("2020-06-01").valueOf(),
          visibleTimeStart: parseISO("2019-01-01").valueOf(),
          visibleTimeEnd: parseISO("2020-01-01").valueOf(),
        },
      })
    );

    const intervals = getAllByTestId("customHeaderInterval");
    const start = intervals[0].textContent!;
    const end = intervals[1].textContent!;

    expect(
      differenceInMonths(parse(end, "dd/MM/yyyy", new Date()), parse(start, "dd/MM/yyyy", new Date()))
    ).toBe(1);
  });

  test("intervals don't overlap in position", () => {
    const { getAllByTestId } = render(getCustomHeadersInTimeline());
    const intervals = getAllByTestId("customHeaderInterval");
    const intervalsCoordinations = intervals.map((interval) => {
      const { left, width } = getComputedStyle(interval);
      return {
        left: parsePxToNumbers(left),
        right: parsePxToNumbers(left) + parsePxToNumbers(width),
      };
    });

    for (let index = 0; index < intervalsCoordinations.length - 1; index++) {
      const a = intervalsCoordinations[index];
      const b = intervalsCoordinations[index + 1];
      expect(Math.abs(a.right - b.left)).toBeLessThan(0.1);
    }
  });

  test("showPeriod is passed to child render function", () => {
    const showPeriod = () => {};
    const renderer = vi.fn((a: CustomHeaderPropsChildrenFnProps<any>) => <div>header</div>);

    render(
      <RenderHeadersWrapper timelineState={{ showPeriod }}>
        <TimelineHeaders>
          <CustomHeader headerData={{}}>{renderer}</CustomHeader>
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    expect(renderer.mock.calls[0][0].showPeriod).toBe(showPeriod);
  });

  test("headerContext is passed to child render function", () => {
    const renderer = vi.fn((a: CustomHeaderPropsChildrenFnProps<any>) => <div>header</div>);

    render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <CustomHeader headerData={{}}>{renderer}</CustomHeader>
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    const headerContext = renderer.mock.calls[0][0].headerContext;
    expect(headerContext).toBeDefined();
  });

  test("headerContext is passed with intervals and unit to child render function", () => {
    const renderer = vi.fn((a: CustomHeaderPropsChildrenFnProps<any>) => <div>header</div>);

    render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <CustomHeader headerData={{}}>{renderer}</CustomHeader>
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    const headerContext = renderer.mock.calls[0][0].headerContext;
    const intervals = headerContext.intervals;
    const unit = headerContext.unit;
    expect(intervals).toBeDefined();
    expect(intervals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          labelWidth: expect.any(Number),
          left: expect.any(Number),
        }),
      ])
    );
    expect(unit).toEqual(expect.any(String));
  });

  test("timelineContext is passed to child render function", () => {
    const renderer = vi.fn((a: CustomHeaderPropsChildrenFnProps<any>) => <div>header</div>);

    render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <CustomHeader headerData={{}}>{renderer}</CustomHeader>
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    const timelineContext = renderer.mock.calls[0][0].timelineContext;
    expect(timelineContext).toBeDefined();
    expect(timelineContext).toMatchObject({
      timelineWidth: expect.any(Number),
      visibleTimeStart: expect.any(Number),
      visibleTimeEnd: expect.any(Number),
      canvasTimeStart: expect.any(Number),
      canvasTimeEnd: expect.any(Number),
    });
  });

  test("headerData props are passed to child render function", () => {
    const props = { data: "some" };
    const renderer = vi.fn((a: CustomHeaderPropsChildrenFnProps<any>) => <div>header</div>);

    render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <CustomHeader headerData={props}>{renderer}</CustomHeader>
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    expect(renderer.mock.calls[0][0].data).toBe(props);
  });

  describe("Intervals", () => {
    test("intervals have same width", () => {
      const renderer = vi.fn((a: CustomHeaderPropsChildrenFnProps<any>) => <div>header</div>);

      render(
        <RenderHeadersWrapper timelineState={{ timelineUnit: "hour" }}>
          <TimelineHeaders>
            <CustomHeader headerData={{}}>{renderer}</CustomHeader>
          </TimelineHeaders>
        </RenderHeadersWrapper>
      );

      const headerContext = renderer.mock.calls[0][0].headerContext;
      const intervals = headerContext.intervals;
      const widths = intervals.map((interval) => interval.labelWidth);

      for (let index = 0; index < widths.length - 1; index++) {
        const a = widths[index];
        const b = widths[index + 1];
        expect(Math.abs(b - a)).toBeLessThan(0.1);
      }
    });

    test("left property of intervals is different", () => {
      const renderer = vi.fn((a: CustomHeaderPropsChildrenFnProps<any>) => <div>header</div>);

      render(
        <RenderHeadersWrapper>
          <TimelineHeaders>
            <CustomHeader headerData={{}}>{renderer}</CustomHeader>
          </TimelineHeaders>
        </RenderHeadersWrapper>
      );

      const headerContext = renderer.mock.calls[0][0].headerContext;
      const intervals = headerContext.intervals;
      const lefts = intervals.map((interval) => interval.left);

      for (let index = 0; index < lefts.length - 1; index++) {
        const a = lefts[index];
        const b = lefts[index + 1];
        expect(a).toBeLessThan(b);
      }
    });
  });

  // Render The Example In The Docs
  test("renders correctly in the timeline", () => {
    const { getByTestId } = render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <SidebarHeader>
            {({ getRootProps }) => {
              return <div {...getRootProps()}>Left</div>;
            }}
          </SidebarHeader>
          <DateHeader unit="primaryHeader" />
          <DateHeader />
          <CustomHeader headerData={{}} unit="year">
            {({ headerContext: { intervals }, getRootProps, getIntervalProps, showPeriod }) => (
              <div data-testid="customHeader" {...getRootProps({ style: { height: 30 } })}>
                {intervals.map((interval) => {
                  const style: React.CSSProperties = {
                    backgroundColor: "Turquoise",
                    borderLeft: "1px solid black",
                    color: "white",
                    cursor: "pointer",
                    lineHeight: "30px",
                    textAlign: "center",
                  };

                  return (
                    <div
                      onClick={() => {
                        showPeriod(interval.startTime, interval.endTime);
                      }}
                      {...getIntervalProps({ interval, style })}
                    >
                      <div className="sticky">{format(interval.startTime, "yyyy")}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CustomHeader>
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    expect(getByTestId("customHeader")).toBeInTheDocument();
  });
});
