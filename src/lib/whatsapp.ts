import i18n from "i18next";

export const WHATSAPP_PHONE = "522206315612";

export function whatsappHref(message: string = i18n.t("whatsapp.message")): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
