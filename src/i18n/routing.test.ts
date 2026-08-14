import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import { getLocalizedPathname } from "astro-react-i18next/utils";

vi.mock("i18next", () => ({
  default: { language: "es-MX" },
}));

vi.mock("astro-react-i18next/utils", () => ({
  getLocalizedPathname: vi.fn((path: string, language: string) =>
    language === "es-MX" ? path : `/${language}${path}`,
  ),
}));

describe("homePath / projectPath / blogPath / blogPostPath", () => {
  it("returns the bare path for the default locale", async () => {
    const { homePath, projectPath } = await import("./routing");
    expect(homePath()).toBe("/");
    expect(projectPath("acme")).toBe("/work/acme");
  });

  it("prefixes the path with the locale for a non-default locale", async () => {
    (i18n as unknown as { language: string }).language = "en-US";
    const { homePath, blogPostPath } = await import("./routing");
    expect(homePath()).toBe("/en-US/");
    expect(blogPostPath("hola-mundo")).toBe("/en-US/blog/hola-mundo");
    (i18n as unknown as { language: string }).language = "es-MX";
  });
});

describe("servicePath", () => {
  it("maps a service key to its slug", async () => {
    const { servicePath } = await import("./routing");
    expect(servicePath("landingPages")).toBe("/landing-pages");
    expect(servicePath("wordpressEcommerce")).toBe("/wordpress-ecommerce");
  });
});

describe("isHome", () => {
  it("treats a trailing slash as equivalent to no trailing slash", async () => {
    const { isHome } = await import("./routing");
    expect(isHome("/")).toBe(true);
    expect(isHome("")).toBe(true);
  });

  it("returns false for any other pathname", async () => {
    const { isHome } = await import("./routing");
    expect(isHome("/work/acme")).toBe(false);
  });
});

describe("sectionHref", () => {
  beforeEach(() => {
    (i18n as unknown as { language: string }).language = "es-MX";
  });

  it("returns the bare hash when already on the home page", async () => {
    const { sectionHref } = await import("./routing");
    expect(sectionHref("/", "#contact")).toBe("#contact");
  });

  it("prefixes the hash with the home path when not on the home page", async () => {
    const { sectionHref } = await import("./routing");
    expect(sectionHref("/work/acme", "#contact")).toBe("/#contact");
  });
});
