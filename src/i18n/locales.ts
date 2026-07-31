import { getLocaleConfig } from "astro-react-i18next/utils";

/**
 * Display metadata only. The list of locales itself, and the routing rules for
 * them, come from the `reactI18next` config in astro.config.mjs.
 */
const LOCALE_LABELS: Record<string, { short: string; label: string }> = {
  "en-US": { short: "EN", label: "English" },
  "es-MX": { short: "ES", label: "Español" },
};

export type LocaleOption = { code: string; short: string; label: string };

export function getLocaleOptions(): LocaleOption[] {
  return getLocaleConfig().locales.map((code) => ({
    code,
    ...(LOCALE_LABELS[code] ?? { short: code.toUpperCase(), label: code }),
  }));
}
