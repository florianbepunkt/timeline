import { CompleteTimeSteps } from "./types";

export const defaultTimeSteps: CompleteTimeSteps = {
  second: 1,
  minute: 1,
  hour: 1,
  day: 1,
  week: 1,
  month: 1,
  year: 1,
};

export const defaultHeaderFormats = {
  year: {
    long: "YYYY",
    mediumLong: "YYYY",
    medium: "YYYY",
    short: "YY",
  },
  month: {
    long: "MMMM YYYY",
    mediumLong: "MMMM YYYY",
    medium: "MMMM",
    short: "M/YYYY",
  },
  week: {
    long: "MMMM YYYY, \\W\\e\\e\\k W",
    mediumLong: "M/YYYY, \\W W",
    medium: "\\W W",
    short: "W",
  },
  day: {
    long: "dddd, LL",
    mediumLong: "dddd, LL",
    medium: "dd D",
    short: "D",
  },
  hour: {
    long: "dddd, LL, HH:00",
    mediumLong: "L, HH:00",
    medium: "HH:00",
    short: "HH",
  },
  minute: {
    long: "HH:mm",
    mediumLong: "HH:mm",
    medium: "HH:mm",
    short: "mm",
  },
};

//TODO: delete this
export const defaultHeaderLabelFormats = {
  yearShort: "YY",
  yearLong: "YYYY",
  monthShort: "MM/YY",
  monthMedium: "MM/YYYY",
  monthMediumLong: "MMM YYYY",
  monthLong: "MMMM YYYY",
  dayShort: "L",
  dayLong: "dddd, LL",
  hourShort: "HH",
  hourMedium: "HH:00",
  hourMediumLong: "L, HH:00",
  hourLong: "dddd, LL, HH:00",
  time: "LLL",
};

//TODO: delete this
export const defaultSubHeaderLabelFormats = {
  yearShort: "YY",
  yearLong: "YYYY",
  monthShort: "MM",
  monthMedium: "MMM",
  monthLong: "MMMM",
  dayShort: "D",
  dayMedium: "dd D",
  dayMediumLong: "ddd, Do",
  dayLong: "dddd, Do",
  hourShort: "HH",
  hourLong: "HH:00",
  minuteShort: "mm",
  minuteLong: "HH:mm",
};
