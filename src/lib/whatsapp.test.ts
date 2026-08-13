import { describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import { WHATSAPP_PHONE, whatsappHref } from "./whatsapp";

vi.mock("i18next", () => ({
  default: {
    t: vi.fn(() => "Hola, quiero cotizar un proyecto"),
  },
}));

describe("whatsappHref", () => {
  it("builds a wa.me link with the phone number and the default localized message", () => {
    const href = whatsappHref();
    expect(href).toBe(
      `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hola, quiero cotizar un proyecto")}`,
    );
    expect(i18n.t).toHaveBeenCalledWith("whatsapp.message");
  });

  it("uses a custom message instead of the localized default when one is passed", () => {
    const href = whatsappHref("mensaje libre");
    expect(href).toBe(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("mensaje libre")}`);
  });

  it("percent-encodes spaces and symbols in the message", () => {
    const href = whatsappHref("hola & bienvenido?");
    expect(href).toContain(encodeURIComponent("hola & bienvenido?"));
  });
});
