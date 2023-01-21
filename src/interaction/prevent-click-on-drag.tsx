import React from "react";

export type PreventClickOnDragProps = {
  clickTolerance: number;
  onClick: (event: React.MouseEvent) => void;
  renderChildren: (args: {
    onClick: (event: React.MouseEvent) => void;
    onMouseDown: (event: React.MouseEvent) => void;
    onMouseUp: (event: React.MouseEvent) => void;
  }) => React.ReactElement;
};

export const PreventClickOnDrag: React.FC<PreventClickOnDragProps> = ({
  clickTolerance,
  onClick,
  renderChildren,
}: PreventClickOnDragProps) => {
  const [cancelClick, setCancelClick] = React.useState(false);
  const [originClickX, setOriginClickX] = React.useState<number | null>(null);

  const handleMouseDown = (event: React.MouseEvent) => {
    setOriginClickX(event.clientX);
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (originClickX !== null && Math.abs(originClickX - event.clientX) > clickTolerance) {
      setCancelClick(true);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!cancelClick) onClick(event);
    setCancelClick(false);
    setOriginClickX(null);
  };

  return renderChildren({
    onClick: handleClick,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
  });
};
