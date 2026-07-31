import i18n from "i18next";

export const WHATSAPP_PHONE = "522206315612";

/** wa.me link with the localized first message prefilled. */
export function whatsappHref(): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(i18n.t("whatsapp.message"))}`;
}
