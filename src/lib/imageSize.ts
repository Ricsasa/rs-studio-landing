import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ImageSize = { width: number; height: number };

export function readImageSize(publicPath: string): ImageSize | null {
  let buffer: Buffer;

  try {
    buffer = readFileSync(join(process.cwd(), "public", publicPath.replace(/^\//, "")));
  } catch {
    return null;
  }

  return avifSize(buffer) ?? pngSize(buffer) ?? jpegSize(buffer);
}

function avifSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 12 || buffer.toString("ascii", 4, 8) !== "ftyp") return null;

  let largest: ImageSize | null = null;
  let index = buffer.indexOf("ispe", 0, "ascii");

  while (index !== -1 && index + 16 <= buffer.length) {
    const size = { width: buffer.readUInt32BE(index + 8), height: buffer.readUInt32BE(index + 12) };

    if (size.width > 0 && size.height > 0) {
      if (!largest || size.width * size.height > largest.width * largest.height) largest = size;
    }

    index = buffer.indexOf("ispe", index + 4, "ascii");
  }

  return largest;
}

function pngSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 24 || buffer.toString("ascii", 12, 16) !== "IHDR") return null;

  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;

    const marker = buffer[offset + 1]!;
    const length = buffer.readUInt16BE(offset + 2);

    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }

    offset += 2 + length;
  }

  return null;
}
