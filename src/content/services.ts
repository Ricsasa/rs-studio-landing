import type { ServiceKey } from "@/i18n/routing";

export function getServiceOgImage(serviceKey: ServiceKey): string {
  const images: Record<ServiceKey, string> = {
    landingPages: "/og/landingPages.svg",
    wordpressEcommerce: "/og/wordpressEcommerce.svg",
    businessManagementTool: "/og/businessManagementTool.svg",
    digitalMarketing: "/og/digitalMarketing.svg",
  };
  return images[serviceKey];
}
