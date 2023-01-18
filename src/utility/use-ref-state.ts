import React from "react";

const isFunction = <S>(setStateAction: React.SetStateAction<S>): setStateAction is (prevState: S) => S =>
  typeof setStateAction === "function";

/**
 * A React.useState like implementation for refs
 * @param initialState
 * @returns
 */
export const useRefState = <S>(
  initialState: S | (() => S)
): [React.MutableRefObject<S>, React.Dispatch<React.SetStateAction<S>>] => {
  const initial = isFunction(initialState) ? initialState() : initialState;
  const ref = React.useRef(initial);
  const dispatch = React.useCallback((a: React.SetStateAction<S>) => {
    ref.current = isFunction(a) ? a(ref.current) : a;
  }, []);

  return [ref, dispatch];
};
