import i18n from "i18next";

/**
 * `t()` is typed as returning a string, but the content collections in the
 * locale files are arrays of objects. This narrows those lookups.
 *
 * `ns` selects a namespace other than the default (`common`).
 */
export function tList<T>(key: string, ns?: string): T[] {
  return i18n.t(key, { ns, returnObjects: true }) as unknown as T[];
}
