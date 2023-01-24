import type React from "react";

export const composeEvents =
  <TEvent extends React.UIEvent>(...fns: (React.EventHandler<TEvent> | null | undefined)[]) =>
  (event: TEvent) => {
    event.preventDefault();
    fns.forEach((fn) => fn && fn(event));
  };
