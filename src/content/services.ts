import type { ServiceKey } from "@/i18n/routing";

export function getServiceOgImage(serviceKey: ServiceKey): string {
  return `/og/service.svg`;
}
