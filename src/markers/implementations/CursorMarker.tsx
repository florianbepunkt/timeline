import { createMarkerStylesWithLeftOffset, createDefaultRenderer } from "./shared";
import { MarkerCanvasConsumer } from "../MarkerCanvasContext";
import React from "react";

type CustomMarkerChildrenProps = {
  styles: React.CSSProperties;
  date: number;
};

type CursorMarkerProps = {
  renderer?: (props: CustomMarkerChildrenProps) => React.ReactNode;
  getLeftOffsetFromDate: (date: number) => number; // TODO: please check this, I think it is never used
};

type WrapperdCursorMarkerProps = CursorMarkerProps & {
  subscribeToCanvasMouseOver: (
    callback: (value: { leftOffset: number; date: number; isCursorOverCanvas: boolean }) => void
  ) => () => void;
};

type CursorMarkerState = {
  leftOffset: number;
  date: number;
  isShowingCursor: boolean;
};

const defaultRenderer = createDefaultRenderer("default-cursor-marker");

/**
 * CursorMarker implementation subscribes to 'subscribeToCanvasMouseOver' on mount.
 * This subscription is passed in via MarkerCanvasConsumer, which is wired up to
 * MarkerCanvasProvider in the MarkerCanvas component. When the user mouses over MarkerCanvas,
 * the callback registered in CursorMarker (this component) is passed:
 *  leftOffset - pixels from left edge of canvas, used to position this element
 *  date - the date the cursor pertains to
 *  isCursorOverCanvas - whether the user cursor is over the canvas. This is set to 'false'
 *  when the user mouseleaves the element
 */
class CursorMarker extends React.Component<WrapperdCursorMarkerProps, CursorMarkerState> {
  private _unsubscribe: null | (() => void) = null;

  constructor(props: WrapperdCursorMarkerProps) {
    super(props);

    this.state = {
      leftOffset: 0,
      date: 0,
      isShowingCursor: false,
    };
  }

  handleCanvasMouseOver = ({
    leftOffset,
    date,
    isCursorOverCanvas,
  }: {
    leftOffset: number;
    date: number;
    isCursorOverCanvas: boolean;
  }) => {
    this.setState({
      leftOffset,
      date,
      isShowingCursor: isCursorOverCanvas,
    });
  };

  componentDidMount() {
    this._unsubscribe = this.props.subscribeToCanvasMouseOver(this.handleCanvasMouseOver);
  }

  componentWillUnmount() {
    if (this._unsubscribe !== null && typeof this._unsubscribe === "function") {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  render() {
    const { isShowingCursor, leftOffset, date } = this.state;

    if (!isShowingCursor) return null;

    const styles = createMarkerStylesWithLeftOffset(leftOffset);

    const renderer = this.props.renderer ?? defaultRenderer;

    return renderer({ styles, date });
  }
}

// TODO: turn into HOC?
const CursorMarkerWrapper = (props: CursorMarkerProps) => {
  return (
    <MarkerCanvasConsumer>
      {({ subscribeToMouseOver }) => {
        return <CursorMarker subscribeToCanvasMouseOver={subscribeToMouseOver} {...props} />;
      }}
    </MarkerCanvasConsumer>
  );
};

CursorMarkerWrapper.displayName = "CursorMarkerWrapper";

export default CursorMarkerWrapper;
