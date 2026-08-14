import { getLocaleConfig } from "astro-react-i18next/utils";

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
