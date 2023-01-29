import { HeadersContext } from "./headers-context.js";
import { SidebarHeader } from "./sidebar-header.js";
import classNames from "classnames";
import React from "react";

export type TimelineHeaderProps = {
  calendarHeaderClassName?: string;
  calendarHeaderStyle?: React.CSSProperties;
  className?: string;
  headerRef?: React.Ref<any>;
  style?: React.CSSProperties;
};

export const TimelineHeaders = ({
  calendarHeaderClassName,
  calendarHeaderStyle,
  children,
  className,
  style,
  headerRef,
}: React.PropsWithChildren<TimelineHeaderProps>) => {
  const { leftSidebarWidth, rightSidebarWidth, registerScroll } = React.useContext(HeadersContext);

  const getRootStyle = () => ({ ...style, display: "flex", width: "100%" });

  const getCalendarHeaderStyle = () => ({
    ...calendarHeaderStyle,
    overflow: "hidden",
    width: `calc(100% - ${leftSidebarWidth + rightSidebarWidth}px)`,
  });

  const handleRootRef = (element: HTMLDivElement) => {
    if (headerRef && typeof headerRef === "function") {
      headerRef(element);
    }
  };

  // /**
  //  * check if child of type SidebarHeader
  //  * refer to for explanation https://github.com/gaearon/react-hot-loader#checking-element-types
  //  */
  const isSidebarHeader = (child: { type?: { secretKey: string } }) => {
    // TODO: this `child` type is a hack, this should be checked a bit more...
    if (child.type === undefined) return false;
    return child.type.secretKey === SidebarHeader.secretKey;
  };

  let rightSidebarHeader;
  let leftSidebarHeader;

  const calendarHeaders: React.ReactNode[] = [];

  const children2 = Array.isArray(children) ? children.filter((c) => c) : [children];

  React.Children.map(children2, (child) => {
    if (isSidebarHeader(child)) {
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

  if (!rightSidebarHeader && rightSidebarWidth) {
    rightSidebarHeader = <SidebarHeader variant="right" />;
  }

  return (
    <div
      className={classNames("rct-header-root", className)}
      data-testid="headerRootDiv"
      ref={handleRootRef}
      style={getRootStyle()}
    >
      {leftSidebarHeader}
      <div
        className={classNames("rct-calendar-header", calendarHeaderClassName)}
        data-testid="headerContainer"
        ref={registerScroll}
        style={getCalendarHeaderStyle()}
      >
        {calendarHeaders}
      </div>
      {rightSidebarHeader}
    </div>
  );
};

TimelineHeaders.secretKey = "TimelineHeaders";
