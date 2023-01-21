import { HeadersContext } from "./headers-context";
import { SidebarHeaderChildrenFnProps, SidebarHeaderProps } from "../types";
import React from "react";

const defaultSidebarHeaderChildren = ({ getRootProps }: SidebarHeaderChildrenFnProps<unknown>) => (
  <div data-testid="sidebarHeader" {...getRootProps({ style: {} })} />
);

export const SidebarHeader = <T,>(props: SidebarHeaderProps<T>): JSX.Element => {
  const { children = defaultSidebarHeaderChildren, headerData, variant = "left" } = props;
  const { leftSidebarWidth, rightSidebarWidth } = React.useContext(HeadersContext);

  const getRootProps = (props: { style?: React.CSSProperties } = {}) => {
    const { style = {} } = props;
    const width = variant === "right" ? rightSidebarWidth : leftSidebarWidth;
    return { style: { ...style, width } };
  };

  return children({
    data: headerData,
    getRootProps,
  });
};

SidebarHeader.secretKey = "SidebarHeader";
