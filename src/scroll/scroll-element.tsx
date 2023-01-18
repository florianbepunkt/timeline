import { millisecondsInPixel } from "../utility";
import React, { Component } from "react";

type ZoomSpeed = {
  alt: number;
  meta: number;
  ctrl: number;
};

type TouchCoordinates = {
  x: number;
  y: number;
  scrollY: number;
};

export type ScrollElementProps = {
  children?: React.ReactNode;
  height: number;
  isInteractingWithItem: boolean;
  scrollRef: React.RefCallback<HTMLDivElement>;
  top: number;
  width: number;
  zoomSpeed?: ZoomSpeed;

  getVisibleTimeWindow: () => { visibleTimeStart: number; visibleTimeEnd: number };
  onHorizontalScroll: (scrollX: number) => void;
  onVerticalScrollBy: (deltaY: number) => void;
  onWheelZoom: (speed: number, xPosition: number, deltaY: number) => void;
  onZoom: (scale: number, offset: number) => void;
  scrollHorizontallyByTime: (timeDelta: number) => void;
};

const defaultZoomSpeed: ZoomSpeed = {
  alt: 1,
  meta: 2,
  ctrl: 2,
};

export class ScrollElement extends Component<ScrollElementProps, { isDragging: boolean }> {
  public _scrollComponent: HTMLDivElement | null = null;
  private _lastTouchDistance: number | null = null;
  private _singleTouchStart: TouchCoordinates | null = null;
  private _lastSingleTouch: TouchCoordinates | null = null;

  // Remember these values at the start of a mouse drag
  private _dragStartClientX = 0;
  private _dragStartMillisecondsInPixel = 0;
  private _dragStartVisibleTimeStart = 0;

  constructor(props: ScrollElementProps) {
    super(props);

    this.state = {
      isDragging: false,
    };
  }

  componentWillUnmount() {
    if (this._scrollComponent) {
      this._scrollComponent.removeEventListener("wheel", this.handleWheel);
    }
  }

  handleScroll = () => {
    if (!this._scrollComponent) return;
    const scrollX = this._scrollComponent.scrollLeft;
    this.props.onHorizontalScroll(scrollX);
  };

  refHandler = (el: HTMLDivElement) => {
    this._scrollComponent = el;
    this.props.scrollRef(el);

    if (el) {
      el.addEventListener("wheel", this.handleWheel, { passive: false });
    }
  };

  handleWheel = (e: WheelEvent) => {
    // zoom in the time dimension
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();

      const parentPosition = getParentPosition(e.currentTarget as HTMLDivElement); // We use the handler on a DIV so it is safe to cast
      const xPosition = e.clientX - parentPosition.x;
      const speeds = this.props.zoomSpeed ?? defaultZoomSpeed;
      const speed = e.ctrlKey ? speeds.ctrl : e.metaKey ? speeds.meta : speeds.alt;

      // convert vertical zoom to horiziontal
      this.props.onWheelZoom(speed, xPosition, e.deltaY);
    } else if (e.shiftKey && this._scrollComponent) {
      e.preventDefault();
      // shift+scroll event from a touchpad has deltaY property populated; shift+scroll event from a mouse has deltaX
      this.props.onHorizontalScroll(this._scrollComponent.scrollLeft + (e.deltaY || e.deltaX));
      // no modifier pressed? we prevented the default event, so scroll or zoom as needed
    }
  };

  handleMouseDown = (e: React.MouseEvent) => {
    if (e.isDefaultPrevented()) return;

    if (e.button === 0) {
      const { visibleTimeStart, visibleTimeEnd } = this.props.getVisibleTimeWindow();
      this._dragStartVisibleTimeStart = visibleTimeStart;
      this._dragStartMillisecondsInPixel = millisecondsInPixel(
        visibleTimeStart,
        visibleTimeEnd,
        this.props.width
      );
      this._dragStartClientX = e.clientX;

      this.setState({
        isDragging: true,
      });

      e.preventDefault();
    }
  };

  handleMouseMove = (e: React.MouseEvent) => {
    // Check the interacion because we don't want to drag the chart if
    // the user is dragging an item.
    if (this.state.isDragging && !this.props.isInteractingWithItem && this._scrollComponent) {
      // Horizontal scrolling
      const { visibleTimeStart } = this.props.getVisibleTimeWindow();
      const pixelMovement = this._dragStartClientX - e.clientX;
      const desiredTimeMovement = pixelMovement * this._dragStartMillisecondsInPixel;
      const chartMovement = this._dragStartVisibleTimeStart - visibleTimeStart;
      const timeDelta = desiredTimeMovement + chartMovement;
      this.props.scrollHorizontallyByTime(timeDelta);

      // Vertical scrolling
      this.props.onVerticalScrollBy(-e.movementY);
    }
  };

  handleMouseUp = () => {
    this.setState({
      isDragging: false,
    });
  };

  handleMouseLeave = () => {
    this.setState({
      isDragging: false,
    });
  };

  handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      this._lastTouchDistance = Math.abs(e.touches[0].screenX - e.touches[1].screenX);
      this._singleTouchStart = null;
      this._lastSingleTouch = null;
    } else if (e.touches.length === 1) {
      e.preventDefault();

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      this._lastTouchDistance = null;
      this._singleTouchStart = { x: x, y: y, scrollY: window.scrollY };
      this._lastSingleTouch = { x: x, y: y, scrollY: window.scrollY };
    }
  };

  handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const { isInteractingWithItem, width, onZoom } = this.props;

    if (isInteractingWithItem) {
      e.preventDefault();
      return;
    }

    if (this._lastTouchDistance && e.touches.length === 2) {
      e.preventDefault();

      const touchDistance = Math.abs(e.touches[0].screenX - e.touches[1].screenX);
      const parentPosition = getParentPosition(e.currentTarget);
      const xPosition = (e.touches[0].screenX + e.touches[1].screenX) / 2 - parentPosition.x;

      if (touchDistance !== 0 && this._lastTouchDistance !== 0) {
        onZoom(this._lastTouchDistance / touchDistance, xPosition / width);
        this._lastTouchDistance = touchDistance;
      }
    } else if (this._lastSingleTouch && this._singleTouchStart && e.touches.length === 1) {
      e.preventDefault();

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      this._lastSingleTouch = { x: x, y: y, scrollY: window.scrollY };

      const deltaX = x - this._lastSingleTouch.x;
      const deltaX0 = x - this._singleTouchStart.x;
      const deltaY0 = y - this._singleTouchStart.y;
      const moveX = Math.abs(deltaX0) * 3 > Math.abs(deltaY0);
      const moveY = Math.abs(deltaY0) * 3 > Math.abs(deltaX0);

      if (deltaX !== 0 && moveX && this._scrollComponent) {
        this.props.onHorizontalScroll(this._scrollComponent.scrollLeft - deltaX);
      }

      if (moveY) {
        window.scrollTo(window.pageXOffset, this._singleTouchStart.scrollY - deltaY0);
      }
    }
  };

  handleTouchEnd = () => {
    if (this._lastTouchDistance) {
      this._lastTouchDistance = null;
    }

    if (this._lastSingleTouch) {
      this._lastSingleTouch = null;
      this._singleTouchStart = null;
    }
  };

  render() {
    const { width, height, top, children } = this.props;
    const { isDragging } = this.state;

    const scrollComponentStyle: React.CSSProperties = {
      cursor: isDragging ? "move" : "default",
      height: `${height + 20}px`, //20px to push the scroll element down off screen...?
      position: "relative",
      top: `${top}px`,
      width: `${width}px`,
    };

    return (
      <div
        className="rct-scroll"
        data-testid="scroll-element"
        onMouseDown={this.handleMouseDown}
        onMouseLeave={this.handleMouseLeave}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onScroll={this.handleScroll}
        onTouchEnd={this.handleTouchEnd}
        onTouchMove={this.handleTouchMove}
        onTouchStart={this.handleTouchStart}
        ref={this.refHandler}
        style={scrollComponentStyle}
      >
        {children}
      </div>
    );
  }
}

// TODO: can we use getBoundingClientRect instead??
export function getParentPosition(element: HTMLElement | null) {
  let xPosition = 0;
  let yPosition = 0;
  let first = true;

  while (element) {
    if (
      !element.offsetParent &&
      element.tagName === "BODY" &&
      element.scrollLeft === 0 &&
      element.scrollTop === 0
    ) {
      element = (document.scrollingElement || element) as HTMLElement;
    }
    xPosition += element.offsetLeft - (first ? 0 : element.scrollLeft) + element.clientLeft;
    yPosition += element.offsetTop - (first ? 0 : element.scrollTop) + element.clientTop;
    element = element.offsetParent as HTMLElement;
    first = false;
  }
  return { x: xPosition, y: yPosition };
}
