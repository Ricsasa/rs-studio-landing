import { getCollection, type CollectionEntry } from "astro:content";
import { readScreenshots } from "@/lib/screenshots";

export type ProjectEntry = CollectionEntry<"projects">;
export type Project = ProjectEntry["data"];

export function projectSlug(id: string): string {
  return id.split("/").slice(1).join("/");
}

const allProjects = await getCollection("projects");

function byLocale(lang: Project["lang"]): ProjectEntry[] {
  return allProjects
    .filter((entry) => entry.data.lang === lang && !projectSlug(entry.id).startsWith("__"))
    .sort((a, b) => a.data.project_id - b.data.project_id);
}

const enProjects = byLocale("en-US");

export const projectSlugs: string[] = enProjects.map((entry) => projectSlug(entry.id));

export const projectScreenshots: string[][] = enProjects.map((entry) =>
  readScreenshots(entry.data["screenshots-prefix"]),
);

export const projectScreenshotAlts: (string | undefined)[][] = enProjects.map((entry, index) => {
  const alts = entry.data["screenshot-alts"] || [];
  const screenshots = projectScreenshots[index] || [];
  return screenshots.map((_, shotIndex) => alts[shotIndex]);
});

export function isCaseStudy(entry: ProjectEntry): boolean {
  return Boolean(entry.body?.trim());
}

export const caseStudySlugs: string[] = projectSlugs.filter((_, index) =>
  isCaseStudy(enProjects[index]!),
);

export function projectsForLocale(lang: Project["lang"]): ProjectEntry[] {
  return byLocale(lang);
}

export function findProject(lang: Project["lang"], slug: string): ProjectEntry | undefined {
  return byLocale(lang).find((entry) => projectSlug(entry.id) === slug);
}
