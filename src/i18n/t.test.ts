import { describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import { tList } from "./t";

vi.mock("i18next", () => ({
  default: {
    t: vi.fn(() => [{ slug: "a" }, { slug: "b" }]),
  },
}));

describe("tList", () => {
  it("returns the array produced by i18next with returnObjects: true", () => {
    const result = tList<{ slug: string }>("projects.list");
    expect(result).toEqual([{ slug: "a" }, { slug: "b" }]);
  });

  it("passes the key and returnObjects: true to i18next.t, with no namespace by default", () => {
    tList("projects.list");
    expect(i18n.t).toHaveBeenCalledWith("projects.list", { ns: undefined, returnObjects: true });
  });

  it("forwards a custom namespace when one is given", () => {
    tList("faq.items", "services");
    expect(i18n.t).toHaveBeenCalledWith("faq.items", { ns: "services", returnObjects: true });
  });
});
