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

/**
 * Basically we could implement an abstraction, allowing user to choose between several date libs
 * However, this gets unneccessarily complicated. Let's stick with a low-level, modular, low-footprint
 * date library that works with native JS dates/timestamps, e. g. date-fns
 *
 * Plan is to get rid of date driver alltogether
 */

// const obscureKey = "reactCalendarTimelineDateDriver" as const;

// // // @ts-ignore
// // if (!window[obscureKey]) {
// //   // @ts-ignore
// //   window[obscureKey] = (function () {
// //     let driver = jsDateDriver;
// //     const service = {
// //       get: () => {
// //         return driver;
// //       },
// //       set: (driver: (a: Date | number) => DateDriver) => {
// //         return driver;
// //       },
// //     };
// //     Object.freeze(service);
// //     return service;
// //   })();
// // }

// export const setDateDriver = (driver: DateDriver) => {
//   throw new Error("NOT IMPLEMENTED");
//   // // @ts-ignore
//   // window[obscureKey].set;
// };

export const dateDriver = jsDateDriver;
