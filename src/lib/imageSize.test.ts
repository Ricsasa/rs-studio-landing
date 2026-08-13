import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

const mockedReadFileSync = vi.mocked(readFileSync);

/** Minimal valid PNG header: signature + IHDR chunk with width/height. */
function buildPngBuffer(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(24);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

/** Minimal JPEG: SOI marker + one SOF0 segment carrying height/width. */
function buildJpegBuffer(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(12);
  buffer.writeUInt16BE(0xffd8, 0); // SOI
  buffer[2] = 0xff;
  buffer[3] = 0xc0; // SOF0
  buffer.writeUInt16BE(8, 4); // segment length (2 length bytes + 6 payload bytes)
  buffer[6] = 0x08; // precision byte
  buffer.writeUInt16BE(height, 7);
  buffer.writeUInt16BE(width, 9);
  return buffer;
}

/** Minimal ISOBMFF container with one "ispe" box carrying width/height. */
function buildAvifBuffer(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(24);
  buffer.write("ftyp", 4, "ascii");
  buffer.write("ispe", 8, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

describe("readImageSize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when the file cannot be read from disk", async () => {
    mockedReadFileSync.mockImplementation(() => {
      throw new Error("ENOENT");
    });
    const { readImageSize } = await import("./imageSize");
    expect(readImageSize("/projects/x/1.avif")).toBeNull();
  });

  it("reads width and height from a PNG IHDR chunk", async () => {
    mockedReadFileSync.mockReturnValue(buildPngBuffer(800, 600));
    const { readImageSize } = await import("./imageSize");
    expect(readImageSize("/projects/x/1.png")).toEqual({ width: 800, height: 600 });
  });

  it("reads width and height from a JPEG SOF0 segment", async () => {
    mockedReadFileSync.mockReturnValue(buildJpegBuffer(1024, 768));
    const { readImageSize } = await import("./imageSize");
    expect(readImageSize("/projects/x/1.jpg")).toEqual({ width: 1024, height: 768 });
  });

  it("picks the largest ispe box in an AVIF file, ignoring thumbnail boxes", async () => {
    // Simulates a file with a small thumbnail ispe box followed by the real one.
    const thumbnail = buildAvifBuffer(64, 64);
    const full = buildAvifBuffer(1920, 1080);
    const combined = Buffer.concat([thumbnail, full]);
    mockedReadFileSync.mockReturnValue(combined);
    const { readImageSize } = await import("./imageSize");
    expect(readImageSize("/projects/x/1.avif")).toEqual({ width: 1920, height: 1080 });
  });

  it("returns null for a buffer that matches no known format", async () => {
    mockedReadFileSync.mockReturnValue(Buffer.from("not an image"));
    const { readImageSize } = await import("./imageSize");
    expect(readImageSize("/projects/x/1.avif")).toBeNull();
  });
});
