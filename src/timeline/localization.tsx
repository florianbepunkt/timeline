import React from "react";
import type { Locale } from "date-fns";

export type LocalizationContext = {
  /**
   * date-fns locale
   * e. g. import { de } from "date-fns/locale"
   */
  locale?: Locale;
};
export const LocalizationContext = React.createContext<LocalizationContext>({});
