import { SidebarHeader } from "./sidebar-header";
import { TimelineHeaderProps } from "../types";
import { TimelineHeadersConsumer } from "./headers-context";
import classNames from "classnames";
import React from "react";

export type TimelineHeadersProps = {
  registerScroll: React.RefCallback<HTMLElement>;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  calendarHeaderStyle?: React.CSSProperties;
  calendarHeaderClassName?: string;
  headerRef?: (ref?: HTMLDivElement) => unknown;
};

class _TimelineHeaders extends React.Component<TimelineHeadersProps> {
  constructor(props: TimelineHeadersProps) {
    super(props);
  }

  getRootStyle = () => {
    return {
      ...this.props.style,
      display: "flex",
      width: "100%",
    };
  };

  getCalendarHeaderStyle = () => {
    const { leftSidebarWidth, rightSidebarWidth, calendarHeaderStyle } = this.props;
    return {
      ...calendarHeaderStyle,
      overflow: "hidden",
      width: `calc(100% - ${leftSidebarWidth + rightSidebarWidth}px)`,
    };
  };

  handleRootRef = (element: HTMLDivElement) => {
    if (this.props.headerRef) {
      this.props.headerRef(element);
    }
  };

  /**
   * check if child of type SidebarHeader
   * refer to for explanation https://github.com/gaearon/react-hot-loader#checking-element-types
   */
  isSidebarHeader = (child: { type?: { secretKey: string } }) => {
    // TODO: this `child` type is a hack, this should be checked a bit more...
    if (child.type === undefined) return false;
    return child.type.secretKey === SidebarHeader.secretKey;
  };

  render() {
    let rightSidebarHeader;
    let leftSidebarHeader;
    const calendarHeaders: React.ReactNode[] = [];
    const children = Array.isArray(this.props.children)
      ? this.props.children.filter((c) => c)
      : [this.props.children];
    React.Children.map(children, (child) => {
      if (this.isSidebarHeader(child)) {
        if (child.props.variant === "right") {
          rightSidebarHeader = child;
        } else {
          leftSidebarHeader = child;
        }
      } else {
        calendarHeaders.push(child);
      }
    });
    if (!leftSidebarHeader) {
      leftSidebarHeader = <SidebarHeader />;
    }
    if (!rightSidebarHeader && this.props.rightSidebarWidth) {
      rightSidebarHeader = <SidebarHeader variant="right" />;
    }
    return (
      <div
        ref={this.handleRootRef}
        data-testid="headerRootDiv"
        style={this.getRootStyle()}
        className={classNames("rct-header-root", this.props.className)}
      >
        {leftSidebarHeader}
        <div
          ref={this.props.registerScroll}
          style={this.getCalendarHeaderStyle()}
          className={classNames("rct-calendar-header", this.props.calendarHeaderClassName)}
          data-testid="headerContainer"
        >
          {calendarHeaders}
        </div>
        {rightSidebarHeader}
      </div>
    );
  }
}

export const TimelineHeaders = ({
  children,
  style,
  className,
  calendarHeaderStyle,
  calendarHeaderClassName,
}: React.PropsWithChildren<TimelineHeaderProps>) => (
  <TimelineHeadersConsumer>
    {({ leftSidebarWidth, rightSidebarWidth, registerScroll }) => {
      return (
        <_TimelineHeaders
          leftSidebarWidth={leftSidebarWidth}
          rightSidebarWidth={rightSidebarWidth}
          registerScroll={registerScroll}
          style={style}
          className={className}
          calendarHeaderStyle={calendarHeaderStyle}
          calendarHeaderClassName={calendarHeaderClassName}
        >
          {children}
        </_TimelineHeaders>
      );
    }}
  </TimelineHeadersConsumer>
);

TimelineHeaders.secretKey = "TimelineHeaders";
