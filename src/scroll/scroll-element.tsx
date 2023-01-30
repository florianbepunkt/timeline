import { millisecondsInPixel } from "../utility/index.js";
import React, { Component } from "react";

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

export const ScrollElement: React.FC<ScrollElementProps> = ({
  getVisibleTimeWindow,
  height,
  isInteractingWithItem,
  onHorizontalScroll,
  onVerticalScrollBy,
  onWheelZoom,
  onZoom,
  scrollHorizontallyByTime,
  scrollRef,
  top,
  width,
  children,
  zoomSpeed,
}) => {
  const defaultZoomSpeed: ZoomSpeed = {
    alt: 1,
    meta: 2,
    ctrl: 2,
  };

  const _scrollComponent = React.useRef<HTMLDivElement | null>(null);
  const _lastTouchDistance = React.useRef<number | null>(null);
  const _singleTouchStart = React.useRef<TouchCoordinates | null>(null);
  const _lastSingleTouch = React.useRef<TouchCoordinates | null>(null);

  // Remember these values at the start of a mouse drag
  const _dragStartClientX = React.useRef(0);
  const _dragStartMillisecondsInPixel = React.useRef(0);
  const _dragStartVisibleTimeStart = React.useRef(0);

  const isMounted = React.useRef(false); // see note in handleScroll
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    isMounted.current = true;
    return function cleanUp() {
      if (_scrollComponent.current) {
        _scrollComponent.current.removeEventListener("wheel", handleWheel);
      }
    };
  });

  const handleScroll = () => {
    // TODO: this method is called on safari when timeline is mounted, this is a hack to prevent initial scroll
    if (!isMounted.current) return;
    if (!_scrollComponent.current) return;
    const scrollX = _scrollComponent.current.scrollLeft;
    onHorizontalScroll(scrollX);
  };

  const refHandler = (el: HTMLDivElement) => {
    _scrollComponent.current = el;
    scrollRef(el);
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
  };

  const handleWheel = (e: WheelEvent) => {
    console.error("WHEEL CALLED");
    // zoom in the time dimension
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const parentPosition = bounds ?? { x: 0, y: 0 };
      const xPosition = e.clientX - parentPosition.x;
      const speeds = zoomSpeed ?? defaultZoomSpeed;
      const speed = e.ctrlKey ? speeds.ctrl : e.metaKey ? speeds.meta : speeds.alt;
      // convert vertical zoom to horiziontal
      onWheelZoom(speed, xPosition, e.deltaY);
    } else if (e.shiftKey && _scrollComponent.current) {
      e.preventDefault();
      // shift+scroll event from a touchpad has deltaY property populated; shift+scroll event from a mouse has deltaX
      onHorizontalScroll(_scrollComponent.current.scrollLeft + (e.deltaY || e.deltaX));
      // no modifier pressed? we prevented the default event, so scroll or zoom as needed
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.isDefaultPrevented()) return;

    if (e.button === 0) {
      const { visibleTimeStart, visibleTimeEnd } = getVisibleTimeWindow();
      _dragStartVisibleTimeStart.current = visibleTimeStart;
      _dragStartMillisecondsInPixel.current = millisecondsInPixel(
        visibleTimeStart,
        visibleTimeEnd,
        width
      );
      _dragStartClientX.current = e.clientX;
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Check the interacion because we don't want to drag the chart if
    // the user is dragging an item.
    if (isDragging && !isInteractingWithItem && _scrollComponent.current) {
      // Horizontal scrolling
      const { visibleTimeStart } = getVisibleTimeWindow();
      const pixelMovement = _dragStartClientX.current - e.clientX;
      const desiredTimeMovement = pixelMovement * _dragStartMillisecondsInPixel.current;
      const chartMovement = _dragStartVisibleTimeStart.current - visibleTimeStart;
      const timeDelta = desiredTimeMovement + chartMovement;
      scrollHorizontallyByTime(timeDelta);

      // Vertical scrolling
      onVerticalScrollBy(-e.movementY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      _lastTouchDistance.current = Math.abs(e.touches[0].screenX - e.touches[1].screenX);
      _singleTouchStart.current = null;
      _lastSingleTouch.current = null;
    } else if (e.touches.length === 1) {
      e.preventDefault();

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      _lastTouchDistance.current = null;
      _singleTouchStart.current = { x: x, y: y, scrollY: window.scrollY };
      _lastSingleTouch.current = { x: x, y: y, scrollY: window.scrollY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isInteractingWithItem) {
      e.preventDefault();
      return;
    }

    if (_lastTouchDistance.current && e.touches.length === 2) {
      e.preventDefault();

      const touchDistance = Math.abs(e.touches[0].screenX - e.touches[1].screenX);
      const bounds = e.currentTarget.getBoundingClientRect();
      const parentPosition = bounds ?? { x: 0, y: 0 };
      const xPosition = (e.touches[0].screenX + e.touches[1].screenX) / 2 - parentPosition.x;

      if (touchDistance !== 0 && _lastTouchDistance.current !== 0) {
        onZoom(_lastTouchDistance.current / touchDistance, xPosition / width);
        _lastTouchDistance.current = touchDistance;
      }
    } else if (_lastSingleTouch.current && _singleTouchStart.current && e.touches.length === 1) {
      e.preventDefault();

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      _lastSingleTouch.current = { x: x, y: y, scrollY: window.scrollY };

      const deltaX = x - _lastSingleTouch.current.x;
      const deltaX0 = x - _singleTouchStart.current.x;
      const deltaY0 = y - _singleTouchStart.current.y;
      const moveX = Math.abs(deltaX0) * 3 > Math.abs(deltaY0);
      const moveY = Math.abs(deltaY0) * 3 > Math.abs(deltaX0);

      if (deltaX !== 0 && moveX && _scrollComponent.current) {
        onHorizontalScroll(_scrollComponent.current.scrollLeft - deltaX);
      }

      if (moveY) {
        window.scrollTo(window.pageXOffset, _singleTouchStart.current.scrollY - deltaY0);
      }
    }
  };

  const handleTouchEnd = () => {
    if (_lastTouchDistance.current) {
      _lastTouchDistance.current = null;
    }

    if (_lastSingleTouch.current) {
      _lastSingleTouch.current = null;
      _singleTouchStart.current = null;
    }
  };

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
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onScroll={handleScroll}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={refHandler}
      style={scrollComponentStyle}
    >
      {children}
    </div>
  );
};

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
