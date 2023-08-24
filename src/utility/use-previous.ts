import React from "react";

/**
 * Persist a value between renderers, so we can compare current and previous props
 */
export const usePrevious = <A>(value: A) => {
  const ref = React.useRef<A>(value);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
