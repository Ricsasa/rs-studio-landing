import i18n from "i18next";
import { getLocalizedPathname } from "astro-react-i18next/utils";

export function homePath(): string {
  return getLocalizedPathname("/", i18n.language);
}

export function projectPath(slug: string): string {
  return getLocalizedPathname(`/work/${slug}`, i18n.language);
}

export function blogPath(): string {
  return getLocalizedPathname("/blog", i18n.language);
}

export function blogPostPath(slug: string): string {
  return getLocalizedPathname(`/blog/${slug}`, i18n.language);
}

export type ServiceKey = "landingPages" | "wordpressEcommerce" | "businessManagementTool" | "digitalMarketing";

export const SERVICE_SLUGS: Record<ServiceKey, string> = {
  landingPages: "landing-pages",
  wordpressEcommerce: "wordpress-ecommerce",
  businessManagementTool: "business-management-tool",
  digitalMarketing: "digital-marketing",
};

export function servicePath(key: ServiceKey): string {
  return getLocalizedPathname(`/${SERVICE_SLUGS[key]}`, i18n.language);
}

function normalize(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function isHome(pathname: string): boolean {
  return normalize(pathname) === normalize(homePath());
}

export function sectionHref(pathname: string, hash: string): string {
  if (isHome(pathname)) return hash;

  const home = homePath();
  return home.endsWith("/") ? `${home}${hash}` : `${home}/${hash}`;
}
