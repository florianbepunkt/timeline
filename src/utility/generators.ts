export function* map<TItem, TResult>(items: Iterable<TItem>, mapper: (i: TItem) => TResult) {
  for (const i of items) yield mapper(i);
}

export function* mapRange<T>(start: number, end: number, map: (index: number) => T) {
  for (let index = start; index < end; index++) {
    yield map(index);
  }
}
