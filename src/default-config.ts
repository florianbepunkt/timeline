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
    long: "yyyy",
    mediumLong: "yyyy",
    medium: "yyyy",
    short: "yy",
  },
  month: {
    long: "MMMM yyyy",
    mediumLong: "MMMM yyyy",
    medium: "MMMM",
    short: "M/yyyy",
  },
  week: {
    long: "MMMM yyyy, Io",
    mediumLong: "M/yyyy, Io",
    medium: "Io",
    short: "I",
  },
  day: {
    long: "dddd, LL",
    mediumLong: "dddd, LL",
    medium: "dd D",
    short: "D",
  },
  hour: {
    long: "dddd, LL, HH:00",
    mediumLong: "HH:00",
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
