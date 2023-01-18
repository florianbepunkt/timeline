import React from "react";
import { createMarkerStylesWithLeftOffset, createDefaultRenderer } from "./shared";

type CustomMarkerChildrenProps = {
  styles: React.CSSProperties;
  date: number;
};

type TodayMarkerProps = {
  getLeftOffsetFromDate: (date: number) => number;
  renderer?: (props: CustomMarkerChildrenProps) => React.ReactNode;
  interval: number;
};

type TodayMarkerState = {
  date: number;
};

const defaultRenderer = createDefaultRenderer("default-today-line");

/** Marker that is placed based on current date.  This component updates itself on
 * a set interval, dictated by the 'interval' prop.
 */
class TodayMarker extends React.Component<TodayMarkerProps, TodayMarkerState> {
  private _intervalToken: NodeJS.Timer | undefined;

  constructor(props: TodayMarkerProps) {
    super(props);
    this.state = {
      date: Date.now(),
    };
  }

  componentDidMount() {
    this._intervalToken = this.createIntervalUpdater(this.props.interval);
  }

  componentDidUpdate(prevProps: Readonly<TodayMarkerProps>) {
    if (prevProps.interval !== this.props.interval) {
      clearInterval(this._intervalToken);
      this._intervalToken = this.createIntervalUpdater(this.props.interval);
    }
  }

  createIntervalUpdater(interval: number) {
    return setInterval(() => {
      this.setState({
        date: Date.now(), // FIXME: use date utils pass in as props
      });
    }, interval);
  }

  componentWillUnmount() {
    clearInterval(this._intervalToken);
  }

  render() {
    const { date } = this.state;
    const leftOffset = this.props.getLeftOffsetFromDate(date);
    const styles = createMarkerStylesWithLeftOffset(leftOffset);
    const renderer = this.props.renderer ?? defaultRenderer;
    return renderer({ styles, date });
  }
}

export default TodayMarker;
