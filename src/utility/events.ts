import type React from "react";

export function composeEvents<TEvent extends React.UIEvent>(
  ...fns: (React.EventHandler<TEvent> | null | undefined)[]
) {
  return (event: TEvent) => {
    event.preventDefault();
    fns.forEach((fn) => fn && fn(event));
  };
}
