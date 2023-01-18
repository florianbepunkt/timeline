import React from "react";

export const usePrevious = <A>(value: A) => {
  const ref = React.useRef<A>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
