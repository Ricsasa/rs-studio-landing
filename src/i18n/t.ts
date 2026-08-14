import i18n from "i18next";

export function tList<T>(key: string, ns?: string): T[] {
  return i18n.t(key, { ns, returnObjects: true }) as unknown as T[];
}
