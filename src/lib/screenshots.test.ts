import { beforeEach, describe, expect, it, vi } from "vitest";
import { readdirSync } from "node:fs";

vi.mock("node:fs", () => ({
  readdirSync: vi.fn(),
}));

const mockedReaddirSync = vi.mocked(readdirSync);

describe("readScreenshots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty list when prefix is undefined", async () => {
    const { readScreenshots } = await import("./screenshots");
    expect(readScreenshots(undefined)).toEqual([]);
    expect(mockedReaddirSync).not.toHaveBeenCalled();
  });

  it("returns an empty list when the folder does not exist", async () => {
    mockedReaddirSync.mockImplementation(() => {
      throw new Error("ENOENT");
    });
    const { readScreenshots } = await import("./screenshots");
    expect(readScreenshots("missing-project")).toEqual([]);
  });

  it("filters out non-image files and dotfiles", async () => {
    mockedReaddirSync.mockReturnValue([".DS_Store", "notes.txt", "1.avif"] as unknown as ReturnType<
      typeof readdirSync
    >);
    const { readScreenshots } = await import("./screenshots");
    expect(readScreenshots("acme")).toEqual(["/projects/acme/1.avif"]);
  });

  it("sorts filenames in natural numeric order, not lexicographic order", async () => {
    mockedReaddirSync.mockReturnValue(["10.avif", "2.avif", "1.avif"] as unknown as ReturnType<
      typeof readdirSync
    >);
    const { readScreenshots } = await import("./screenshots");
    expect(readScreenshots("acme")).toEqual([
      "/projects/acme/1.avif",
      "/projects/acme/2.avif",
      "/projects/acme/10.avif",
    ]);
  });

  it("accepts every supported extension, case-insensitively", async () => {
    mockedReaddirSync.mockReturnValue([
      "a.PNG",
      "b.webp",
      "c.jpeg",
      "d.jpg",
      "e.gif",
      "f.svg",
    ] as unknown as ReturnType<typeof readdirSync>);
    const { readScreenshots } = await import("./screenshots");
    expect(readScreenshots("acme")).toHaveLength(6);
  });
});
