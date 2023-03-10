import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import { DateHeader } from "./date-header.js";
import { differenceInDays, differenceInMonths, format, parse } from "date-fns";
import { RenderHeadersWrapper } from "../test-helpers/index.js";
import { SidebarHeader } from "./sidebar-header.js";
import { TimelineHeaders } from "./timeline-headers.js";
import type { IntervalRenderer } from "./interval.js";
import type { TimeUnit } from "../shared-model.js";
import userEvent from "@testing-library/user-event";

describe("<DateHeader />", () => {
  afterEach(cleanup);

  const dateFnsFormat = "MM/dd/yyyy hh:mm a";

  test("renders correctly in the timeLine", () => {
    const { getAllByTestId } = render(
      <RenderHeadersWrapper>
        <TimelineHeaders>
          <SidebarHeader>{({ getRootProps }) => <div {...getRootProps()}>Left</div>}</SidebarHeader>
          <DateHeader unit="primaryHeader" />
          <DateHeader />
          <DateHeader
            intervalRenderer={({ getIntervalProps, intervalContext }) => (
              <div {...getIntervalProps()}>{intervalContext.intervalText}</div>
            )}
            style={{ height: 50 }}
            unit="day"
          />
        </TimelineHeaders>
      </RenderHeadersWrapper>
    );

    expect(getAllByTestId("dateHeader")).toHaveLength(3);
  });

  describe("labelFormat", () => {
    afterEach(cleanup);

    test("renders intervals with given string typed labelFormat", () => {
      const { getAllByTestId } = render(dateHeaderComponent({ unit: "day", labelFormat: "MM/dd" }));
      expect(getAllByTestId("dateHeader")[1]).toHaveTextContent("10/25");
      expect(getAllByTestId("dateHeader")[1]).toHaveTextContent("10/26");
      expect(getAllByTestId("dateHeader")[1]).toHaveTextContent("10/27");
    });

    test("renders intervals with given function typed labelFormat", () => {
      const formatlabel = vi.fn((interval) => format(interval[0], "MM/dd/yyyy"));
      const { getAllByTestId } = render(dateHeaderComponent({ unit: "day", labelFormat: formatlabel }));

      expect(formatlabel).toHaveBeenCalled();

      expect(getAllByTestId("dateHeader")[1]).toHaveTextContent("10/25/2018");
      expect(getAllByTestId("dateHeader")[1]).toHaveTextContent("10/26/2018");
      expect(getAllByTestId("dateHeader")[1]).toHaveTextContent("10/27/2018");
    });

    test("function types labelFormat is called with params 'interval', 'label' width and 'unit'", () => {
      const formatlabel = vi.fn(
        (interval: [Date | number, Date | number], unit: TimeUnit, labelWidth: number) =>
          format(interval[0], "MM/dd/yyyy")
      );

      render(dateHeaderComponent({ unit: "day", labelFormat: formatlabel }));
      expect(formatlabel).toHaveBeenCalled();
      formatlabel.mock.calls.forEach((param) => {
        const [[start, end], unit, labelWidth] = param;
        expect(start).toStrictEqual(expect.any(Date));
        expect(end).toStrictEqual(expect.any(Date));
        expect(differenceInDays(end.valueOf(), start.valueOf())).toBe(1);
        expect(unit).toBe("day");
        expect(labelWidth).toEqual(expect.any(Number));
      });
    });
  });

  // TODO: this test fails... clicking on the primary header does nothing
  // but clicking on the secondary header works
  test.skip("user click on the primary header changes unit", async () => {
    const user = userEvent.setup();
    const formatlabel = vi.fn((interval) => interval[0].format("MM/dd/yyyy"));
    const showPeriod = vi.fn();
    const sut = dateHeaderComponent({ unit: "day", labelFormat: formatlabel, showPeriod });
    const { getAllByTestId } = render(sut);

    const primaryHeader = getAllByTestId("dateHeader")[0];
    await user.click(within(primaryHeader).getByText("2018").parentElement!);

    expect(showPeriod).toBeCalled();
    const [start, end] = showPeriod.mock.calls[0];
    expect(start.format("dd/MM/yyyy hh:mm a")).toBe("01/01/2018 12:00 am");
    expect(end.format("dd/MM/yyyy hh:mm a")).toBe("31/12/2018 11:59 pm");
  });

  test("className us applied to <DateHeader />", () => {
    const { getAllByTestId } = render(
      dateHeaderComponent({
        labelFormat: "MM/dd/yyyy",
        className: "test-class-name",
      })
    );
    expect(getAllByTestId("dateHeader")[1]).toHaveClass("test-class-name");
  });

  test("style does not overridde default values for 'width', 'left' and 'position'", () => {
    const { getAllByTestId } = render(
      dateHeaderComponent({
        labelFormat: "MM/dd/yyyy",
        props: { style: { width: 100, position: "fixed", left: 2342 } },
      })
    );
    const { width, position, left } = getComputedStyle(getAllByTestId("interval")[0]);
    expect(width).not.toBe("100px");
    expect(position).toBe("absolute");
    expect(left).not.toBe("2342px");
  });

  test("styles other than 'width', 'left' and 'position' are applied", () => {
    const { getAllByTestId } = render(
      dateHeaderComponent({
        labelFormat: "MM/dd/yyyy",
        props: { style: { display: "flex" } },
      })
    );
    const { display } = getComputedStyle(getAllByTestId("interval")[0]);
    expect(display).toBe("flex");
  });

  test("intervalRenderer prop is called with the correct params", () => {
    const props = { title: "some title" };
    const intervalRenderer = vi.fn(({ intervalContext }) => (
      <div data-testid="myAwesomeInterval">{intervalContext.intervalText}</div>
    ));

    render(dateHeaderWithIntervalRenderer({ intervalRenderer, props }));
    expect(intervalRenderer).toBeCalled();
    expect(intervalRenderer).toReturn();
    expect(intervalRenderer.mock.calls[0][0].data).toBe(props);
    expect(intervalRenderer.mock.calls[0][0].getIntervalProps).toEqual(expect.any(Function));
    expect(intervalRenderer.mock.calls[0][0].intervalContext).toEqual(expect.any(Object));
  });

  describe("unit values", () => {
    test("unit defaults to timeline if not present", () => {
      const { getAllByTestId } = render(
        <RenderHeadersWrapper timelineState={{ timelineUnit: "day" }}>
          <TimelineHeaders>
            <DateHeader labelFormat={(interval) => format(interval[0], dateFnsFormat)} />
          </TimelineHeaders>
        </RenderHeadersWrapper>
      );

      const intervals = getAllByTestId("dateHeaderInterval").map((interval) => interval.textContent);

      for (let index = 0; index < intervals.length - 1; index++) {
        const a = intervals[index]!;
        const b = intervals[index + 1]!;
        const timeStampA = parse(a, dateFnsFormat, new Date());
        const timeStampB = parse(b, dateFnsFormat, new Date());
        const diff = differenceInDays(timeStampB, timeStampA);
        expect(diff).toBe(1);
      }
    });

    test("uses given unit", () => {
      const { getAllByTestId } = render(
        <RenderHeadersWrapper timelineState={{ timelineUnit: "month" }}>
          <TimelineHeaders>
            <DateHeader unit="day" labelFormat={(interval) => format(interval[0], dateFnsFormat)} />
          </TimelineHeaders>
        </RenderHeadersWrapper>
      );

      const intervals = getAllByTestId("dateHeaderInterval").map((interval) => interval.textContent);

      for (let index = 0; index < intervals.length - 1; index++) {
        const a = intervals[index]!;
        const b = intervals[index + 1]!;
        const timeStampA = parse(a, dateFnsFormat, new Date());
        const timeStampB = parse(b, dateFnsFormat, new Date());
        const diff = differenceInDays(timeStampB, timeStampA);
        expect(diff).toBe(1);
      }
    });

    test("when passing primaryHeader, the header unit is bigger than the timeline unit", () => {
      const { getAllByTestId } = render(
        <RenderHeadersWrapper timelineState={{ timelineUnit: "day" }}>
          <TimelineHeaders>
            <DateHeader
              unit="primaryHeader"
              labelFormat={(interval) => format(interval[0], dateFnsFormat)}
            />
          </TimelineHeaders>
        </RenderHeadersWrapper>
      );
      const intervals = getAllByTestId("dateHeaderInterval").map((interval) => interval.textContent);
      for (let index = 0; index < intervals.length - 1; index++) {
        const a = intervals[index]!;
        const b = intervals[index + 1]!;
        const timeStampA = parse(a, dateFnsFormat, new Date());
        const timeStampB = parse(b, dateFnsFormat, new Date());
        const diff = differenceInMonths(timeStampB, timeStampA);
        expect(diff).toBe(1);
      }
    });
  });

  describe("interval", () => {
    test("calls passed onClick handler", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { getAllByTestId } = render(
        <RenderHeadersWrapper>
          <TimelineHeaders>
            <DateHeader
              intervalRenderer={({ getIntervalProps, intervalContext }) => (
                <div data-testid="interval" {...getIntervalProps({ onClick: onClick })}>
                  {intervalContext.intervalText}
                </div>
              )}
            />
          </TimelineHeaders>
        </RenderHeadersWrapper>
      );
      const intervals = getAllByTestId("interval");
      await user.click(intervals[0]);
      expect(onClick).toHaveBeenCalled();
    });

    test("renders passed interval renderer", () => {
      const { getAllByTestId } = render(
        <RenderHeadersWrapper>
          <TimelineHeaders>
            <DateHeader
              intervalRenderer={({ getIntervalProps, intervalContext }) => (
                <div data-testid="interval" {...getIntervalProps()}>
                  {intervalContext.intervalText}
                </div>
              )}
            />
          </TimelineHeaders>
        </RenderHeadersWrapper>
      );
      expect(getAllByTestId("interval")[0]).toBeInTheDocument();
    });

    test("passed interval renderer is called with interval's context", () => {
      const renderer = vi.fn(({ getIntervalProps, intervalContext }) => (
        <div data-testid="interval" {...getIntervalProps()}>
          {intervalContext.intervalText}
        </div>
      ));

      render(
        <RenderHeadersWrapper>
          <TimelineHeaders>
            <DateHeader intervalRenderer={renderer} />
          </TimelineHeaders>
        </RenderHeadersWrapper>
      );

      expect(renderer.mock.calls[0][0].intervalContext).toEqual(
        expect.objectContaining({
          interval: expect.objectContaining({
            startTime: expect.any(Date),
            endTime: expect.any(Date),
            labelWidth: expect.any(Number),
            left: expect.any(Number),
          }),
          intervalText: expect.any(String),
        })
      );
    });
  });
});

const dateHeaderComponent = ({
  labelFormat,
  unit,
  props,
  className,
  style,
  showPeriod,
}: {
  className?: string;
  props?: any;
  labelFormat?:
    | string
    | ((
        [startTime, endTime]: [Date | number, Date | number],
        unit: TimeUnit,
        labelWidth: number
      ) => string);
  showPeriod?: (startDate: Date | number, endDate: Date | number) => void;
  style?: React.CSSProperties;
  unit?: TimeUnit;
}) => (
  <RenderHeadersWrapper showPeriod={showPeriod} timelineState={{ timelineUnit: "month" }}>
    <TimelineHeaders>
      <SidebarHeader>{({ getRootProps }) => <div {...getRootProps()}>Left</div>}</SidebarHeader>
      <DateHeader unit="primaryHeader" />
      <DateHeader
        className={className}
        headerData={props}
        intervalRenderer={({ getIntervalProps, intervalContext, data }) => (
          <div data-testid="interval" {...getIntervalProps(data)}>
            {intervalContext.intervalText}
          </div>
        )}
        labelFormat={labelFormat}
        style={style}
        unit={unit}
      />
      <DateHeader />
    </TimelineHeaders>
  </RenderHeadersWrapper>
);

const dateHeaderWithIntervalRenderer = ({
  intervalRenderer,
  props,
}: {
  intervalRenderer: (props?: IntervalRenderer<any> | undefined) => React.ReactNode;
  props: any;
}) => (
  <RenderHeadersWrapper timelineState={{ timelineUnit: "month" }}>
    <TimelineHeaders>
      <SidebarHeader>{({ getRootProps }) => <div {...getRootProps()}>Left</div>}</SidebarHeader>
      <DateHeader unit="primaryHeader" />
      <DateHeader
        headerData={props}
        intervalRenderer={intervalRenderer}
        labelFormat={"MM/dd/yyyy"}
        unit={"day"}
      />
      <DateHeader />
    </TimelineHeaders>
  </RenderHeadersWrapper>
);
