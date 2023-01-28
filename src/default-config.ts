import { CompleteTimeSteps } from "./shared-model";

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
    short: "M",
  },
  week: {
    long: "MMMM yyyy, Io",
    mediumLong: "M/yyyy, Io",
    medium: "Io",
    short: "I",
  },
  day: {
    long: "PPPP",
    mediumLong: "PPP",
    medium: "PP",
    short: "P",
  },
  hour: {
    long: "P, HH:00",
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
