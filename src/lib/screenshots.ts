import { readdirSync } from "node:fs";
import { join } from "node:path";

const PROJECTS_DIR = join(process.cwd(), "public", "projects");

const IMAGE_PATTERN = /\.(avif|webp|png|jpe?g|gif|svg)$/i;

const byNaturalOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export function readScreenshots(prefix: string | undefined): string[] {
  if (!prefix) return [];

  let entries: string[];

  try {
    entries = readdirSync(join(PROJECTS_DIR, prefix));
  } catch {
    return [];
  }

  return entries
    .filter((name) => !name.startsWith(".") && IMAGE_PATTERN.test(name))
    .sort(byNaturalOrder.compare)
    .map((name) => `/projects/${prefix}/${name}`);
}
