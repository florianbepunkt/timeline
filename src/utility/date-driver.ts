import { jsDateDriver } from "./js-date-driver";

export type DateDriver = {
  add: (amount: number, unit: string) => DateDriver;
  clone: () => DateDriver;
  day: () => number;
  endOf: (unit: string) => DateDriver;
  format: (format: string) => string;
  get: (unit: string) => number;
  set: (unit: string, value: number) => DateDriver;
  startOf: (unit: string) => DateDriver;
  unix: () => number;
  utcOffset: () => number;
  valueOf: () => number;
  v: string;
};

export const dateDriver = jsDateDriver;
