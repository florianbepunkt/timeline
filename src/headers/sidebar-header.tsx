import { HeadersContext } from "./headers-context";
import React from "react";

export type SidebarHeaderProps<Data> = {
  children?: (props: SidebarHeaderChildrenFnProps<Data>) => JSX.Element;
  headerData?: Data;
  variant?: "left" | "right";
};

export type SidebarHeaderChildrenFnProps<Data> = {
  data?: Data;
  getRootProps: (propsToOverride?: { style: React.CSSProperties }) => { style: React.CSSProperties };
};

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
