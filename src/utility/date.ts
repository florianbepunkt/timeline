import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfMonth,
  endOfSecond,
  endOfWeek,
  endOfYear,
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getSeconds,
  getWeek,
  getYear,
  setDate,
  setHours,
  setMinutes,
  setMonth,
  setSeconds,
  setWeek,
  setYear,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { match } from "ts-pattern";
import type { TimeUnit } from "../shared-model";

export const addByUnit = (date: Date | number, unit: TimeUnit, value: number) =>
  match(unit)
    .with("day", () => addDays(date, value))
    .with("hour", () => addHours(date, value))
    .with("minute", () => addMinutes(date, value))
    .with("month", () => addMonths(date, value))
    .with("second", () => addSeconds(date, value))
    .with("week", () => addWeeks(date, value))
    .with("year", () => addYears(date, value))
    .exhaustive();

export const getByUnit = (date: Date | number, unit: TimeUnit) =>
  match(unit)
    .with("day", () => getDate(date))
    .with("hour", () => getHours(date))
    .with("minute", () => getMinutes(date))
    .with("month", () => getMonth(date))
    .with("second", () => getSeconds(date))
    .with("week", () => getWeek(date))
    .with("year", () => getYear(date))
    .exhaustive();

export const setByUnit = (date: Date | number, unit: TimeUnit, value: number) =>
  match(unit)
    .with("day", () => setDate(date, value))
    .with("hour", () => setHours(date, value))
    .with("minute", () => setMinutes(date, value))
    .with("month", () => setMonth(date, value))
    .with("second", () => setSeconds(date, value))
    .with("week", () => setWeek(date, value))
    .with("year", () => setYear(date, value))
    .exhaustive();

export const startOf = (date: Date | number, unit: TimeUnit) =>
  match(unit)
    .with("day", () => startOfDay(date))
    .with("hour", () => startOfHour(date))
    .with("minute", () => startOfMinute(date))
    .with("month", () => startOfMonth(date))
    .with("second", () => startOfSecond(date))
    .with("week", () => startOfWeek(date))
    .with("year", () => startOfYear(date))
    .exhaustive();

export const endOf = (date: Date | number, unit: TimeUnit) =>
  match(unit)
    .with("day", () => endOfDay(date))
    .with("hour", () => endOfHour(date))
    .with("minute", () => endOfMinute(date))
    .with("month", () => endOfMonth(date))
    .with("second", () => endOfSecond(date))
    .with("week", () => endOfWeek(date))
    .with("year", () => endOfYear(date))
    .exhaustive();
