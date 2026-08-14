I want to refactor the projects sections.

#### How it works now:

The project information is stored in a json array at public/locales/[en-US/es-MX]/projects.json

Each project object has the following structure (typescript notation):

{
"title": string
"brief_description": string
"full_description"?: string //markdown to add styles and tags
"category": string
"year": string
"href"?: string
"cta"?: string
"technologies"?: String[]
"screenshots-prefix"?: String,
"screenshot-alts"?: String[]
}

full_description is written in markdown.

#### How it should work now
The change I want to implement is, each project will be written as a mdx at src/content/projects/[en-US/es-MX]/[project-name-directory]

Base on the following example for blogs: src/content/blog/en-US/hola-mundo/index.mdx

These are some of the relevant files:
- src/content/projects.ts (Some of the code here may need to change)
- src/components/work/*

Additionally, I want to remove the functionality of src/components/work/ProjectNext.astro 

## Acceptance criteria
- Migrate the info for each project currently at public/locales/[en-US/es-MX]/projects.json to a new folder and mdx file on src/content/projects/[en-US/es-MX]/[project-name-directory]
- The project info should appear as always at home page, and full info at src/pages/[...locale]/work
- 