import { HeadersContext } from "./headers-context";
import React from "react";

export type SidebarHeaderProps<Data> = {
  /**
   * Function as a child component to render the header
   */
  children?: (props: SidebarHeaderChildrenFnProps<Data>) => JSX.Element;

  /**
   * Contextual data to be passed to the item renderer as a data prop
   */
  headerData?: Data;

  /**
   * Renders above the left or right sidebar
   */
  variant?: "left" | "right";
};

type SidebarHeaderChildrenFnProps<Data> = {
  data?: Data;
  getRootProps: (
    propsToOverride?: Partial<
      React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
    >
  ) => { style: React.CSSProperties };
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
