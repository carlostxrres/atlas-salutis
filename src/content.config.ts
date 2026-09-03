import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Extends Starlight's docs schema so that `src/content/docs/posts/**` entries
// can declare their sourced claims. Other doc pages (e.g. the landing page)
// simply leave `sources` empty.
//
// `interview`/`personIds` are plain string ids (not `reference()`) resolved
// manually with `getEntry('interviews'|'people', id)` in SourcePopover.astro:
// Astro's automatic reference-resolution only walks the top-level shape of a
// collection's schema, and doesn't reliably reach into `reference()` fields
// nested inside Starlight's `docsSchema({ extend })` composition.
const postsExtension = z.object({
  tags: z.array(z.string()).default([]),
  sources: z
    .array(
      z.object({
        // Local id, unique within the post, referenced by <SourcePopover ids={[...]} />.
        id: z.string(),
        interview: z.string(),
        // Which cited person(s) this specific claim is attributed to.
        personIds: z.array(z.string()),
        quote: z.string().optional(),
        // Timestamp into the source video, e.g. "00:12:34".
        timestamp: z.string().optional(),
      }),
    )
    .default([]),
});

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({ extend: postsExtension }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    role: z.enum(['interviewee', 'interviewer', 'both']),
    profession: z.string().optional(),
    bio: z.string(),
    links: z
      .object({
        website: z.url().optional(),
        youtube: z.url().optional(),
        instagram: z.url().optional(),
      })
      .optional(),
  }),
});

const interviews = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/interviews' }),
  schema: z.object({
    title: z.string(),
    interviewees: z.array(reference('people')),
    interviewers: z.array(reference('people')),
    channel: z.string(),
    date: z.coerce.date(),
    durationMinutes: z.number().optional(),
    youtubeUrl: z.url(),
    language: z.enum(['es', 'en']).default('es'),
    summary: z.string(),
  }),
});

export const collections = { docs, people, interviews };
