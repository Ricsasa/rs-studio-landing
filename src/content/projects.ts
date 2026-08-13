import enProjects from "../../public/locales/en-US/projects.json";
import { readScreenshots } from "@/lib/screenshots";

export type Project = {
  title: string;
  brief_description: string;
  /** Markdown. Its presence is what earns a project its own case-study page. */
  full_description?: string;
  category: string;
  year: string;
  href?: string;
  cta?: string;
  technologies?: string[];
  /** Folder under `public/projects/` whose images make up the gallery. */
  "screenshots-prefix"?: string;
  /** Alt text for each screenshot, in display order. Falls back to generic if not provided. */
  "screenshot-alts"?: string[];
};

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // drop accents: "Láser" -> "Laser"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Titles are translated ("Admin System" / "Sistema de Administración"), so slugs
 * are derived from en-US only. That keeps one URL per project across locales and
 * lets the language toggle stay on the same case study.
 *
 * Positions are the shared key: index N in any locale's projects.json is the
 * same project.
 */
const catalogue = enProjects.projects as Project[];

export const projectSlugs: string[] = catalogue.map((project) => slugify(project.title));

/**
 * Screenshots are not translatable, so — like slugs — the prefix is read from
 * en-US and the resulting list is shared by every locale. Indexed to match
 * `projectSlugs`.
 */
export const projectScreenshots: string[][] = catalogue.map((project) =>
  readScreenshots(project["screenshots-prefix"]),
);

/**
 * Alt text for each screenshot. Indexed to match `projectScreenshots`.
 * Inner arrays contain alt text in display order, or undefined for generic fallback.
 */
export const projectScreenshotAlts: (string | undefined)[][] = catalogue.map((project) => {
  const alts = project["screenshot-alts"] || [];
  const screenshots = projectScreenshots[catalogue.indexOf(project)] || [];
  return screenshots.map((_, index) => alts[index]);
});

export function isCaseStudy(project: Project): boolean {
  return Boolean(project.full_description);
}

/** Only projects with a write-up get a route. */
export const caseStudySlugs: string[] = projectSlugs.filter((_, index) =>
  isCaseStudy(catalogue[index]!),
);
