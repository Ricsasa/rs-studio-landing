import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: "**/index.mdx",
    base: "./src/content/blog",
    // Default id (e.g. "es-MX/hola-mundo") kept as-is: it must stay unique per
    // entry, and stripping the locale segment made the es-MX/en-US pair
    // collide onto one id, so the glob loader silently dropped one of them.
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      lang: z.enum(["es-MX", "en-US"]),
    }),
});

export const collections = { blog };

/** The id minus its leading locale segment — the route param for a post. */
export function postSlug(id: string): string {
  return id.split("/").slice(1).join("/");
}
