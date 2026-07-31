import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Resolved from the working directory, which Astro sets to the project root for
 * both `dev` and `build`. Deliberately not `import.meta.url`: this module gets
 * bundled into `dist/` for the build, so a module-relative path would look for
 * `dist/public/projects` and silently find nothing.
 */
const PROJECTS_DIR = join(process.cwd(), "public", "projects");

const IMAGE_PATTERN = /\.(avif|webp|png|jpe?g|gif|svg)$/i;

/** Numeric collation, so 10.avif sorts after 2.avif rather than after 1.avif. */
const byNaturalOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/**
 * Lists every image in `public/projects/<prefix>`, in natural filename order.
 *
 * Read at build time, so adding a screenshot to the folder is enough — no JSON
 * edit required. Returns an empty list when the folder is missing.
 */
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
