---
name: ingest-interview
description: Ingests a YouTube health-interview transcript into Atlas Salutis' content (src/content/people, src/content/interviews, src/content/docs/posts), extracting practical, sourced claims and citing them with SourcePopover. Use this whenever given a YouTube interview URL together with any request to add, ingest, process, ficharlo, or fold it into the site/wiki — not just when the user explicitly says "ingest-interview". Requires yt-dlp on PATH.
---

# Ingest an interview into Atlas Salutis

This skill turns one YouTube health-interview URL into sourced content
updates: new/updated `people` and `interviews` entries, and new/updated
`posts` that cite the interview via `SourcePopover`. It commits locally but
**never pushes** — the user reviews the diff and pushes themselves.

Read `docs/idea.md` once if you haven't already this session: it's the
project's editorial philosophy (iterative, cumulative, never delete prior
knowledge, show conflicting viewpoints side by side, cite everything, filter
out noise). Everything below operationalizes that philosophy against this
repo's actual schema.

**Prerequisite**: `yt-dlp` must be installed and on `PATH`
(`pipx install yt-dlp` or `brew install yt-dlp`). `scripts/fetch-transcript.ts`
checks this and fails with a clear message if it's missing — you don't need
to check yourself, just relay that message if it comes back.

## Step 0 — Preconditions

Run `git status --porcelain`. If it shows unrelated pending changes, tell the
user and stop — don't risk folding unrelated work into this run's commits.

## Step 1 — Canonicalize the URL and check idempotency (no network)

Extract the 11-character video id from the URL (works for `watch?v=`,
`youtu.be/`, and `/shorts/` forms) and build the canonical form
`https://www.youtube.com/watch?v=<id>`.

`Grep` `src/content/interviews/**/*.md` for `watch?v=<id>`. If a match
exists, report the existing file to the user and **stop** — this exact video
has already been ingested. This only blocks the *same video*: a second,
different interview with the same guest has a different id and is not
blocked.

## Step 2 — Fetch the transcript

Run:

```
pnpm exec tsx scripts/fetch-transcript.ts <url>
```

- Exit code `2` (no captions at all): relay the message to the user verbatim
  and stop. This pipeline does not fall back to audio transcription.
- Exit code `1`: relay the error and stop.
- Exit code `0`: stdout is a JSON summary — `videoId`, `title`, `channel`,
  `uploadDate`, `durationMinutes`, `youtubeUrl`, `captionsLang`,
  `captionsSource`, `outDir`, `segmentCount`. Keep `outDir` — that's where
  `transcript.txt` lives, plus a captions language independent of the post
  language you'll write in.

## Step 3 — Read and distill claims

Read `<outDir>/transcript.txt` (each line is `[HH:MM:SS] text`) in chunks —
use the Read tool's `offset`/`limit` for long interviews, roughly 2000 lines
at a time.

While reading, build a working list of candidate claims: discrete, practical,
applicable health statements, each tagged with its nearest `[HH:MM:SS]`
marker and the speaker who said it. Skip small talk, sponsor reads, and
non-actionable tangents — this filtering *is* the "sin ruido" idea.md asks
for; not everything said in a two-hour interview deserves a citation. For a
long interview, it's fine to jot this list to a scratch file (e.g.
`<outDir>/claims.md`, already gitignored under `tmp/`) rather than holding it
all in context.

## Step 4 — Resolve people

For each interviewer/interviewee (from the video metadata, the transcript's
intro, and your own knowledge of who's speaking):

1. Compute a slug: lowercase, accents/diacritics stripped, spaces → hyphens
   (`Peter Attia` → `peter-attia`, `Marcos Vázquez` → `marcos-vazquez`).
2. `Glob`/`Grep` `src/content/people/*.md` for that slug, and also check the
   `name:` frontmatter field with a case/accent-insensitive comparison, in
   case an existing file uses a slightly different slug.
3. **Found**: reuse that id as-is. Only edit the existing file if this
   interview's role for them differs from their stored `role` — in that case
   promote `role` to `both`. Don't touch any other field.
4. **Not found**: create `src/content/people/<slug>.md`:
   ```yaml
   ---
   name: <Proper Case Full Name>
   role: interviewee | interviewer
   profession: <fill from your general knowledge if confident>
   bio: |
     <2-3 sentences, from your general knowledge if confident>
   links:
     website: <only if you're confident it's correct>
     youtube: <only if you're confident it's correct>
   ---
   ```
   `bio` is a required schema field — if you're genuinely not confident about
   who this person is, write an honest placeholder instead of inventing
   facts, e.g. `Persona entrevistada en «<interview title>»; biografía
   pendiente de ampliar.` Omit `links` entirely rather than guess a URL.
   Leave `photo` unset (no image-sourcing in this pipeline).

## Step 5 — Create the interview file

Slug: `<primary-interviewer-slug>-entrevista-<primary-interviewee-slug>`,
optionally suffixed with a short topic slug or the upload year-month if that
base is taken (check with `Glob`), and with a numeric suffix (`-2`, `-3`, ...)
if even that collides — this keeps a second interview with the same guest
from clobbering the first (matches the seed pattern
`marcos-vazquez-entrevista-peter-attia-longevidad`).

Write `src/content/interviews/<slug>.md`:

```yaml
---
title: "<Spanish descriptive title>"
interviewees: [<person-id>, ...]
interviewers: [<person-id>, ...]
channel: <metadata channel>
date: <metadata uploadDate, YYYY-MM-DD>
durationMinutes: <metadata durationMinutes>
youtubeUrl: <canonical url from Step 1>
language: es | en   # the video's actual spoken language — independent of
                     # the post language, which is always Spanish (Step 6)
summary: |
  <2-4 sentence Spanish summary>
---
```

Leave the body empty below the frontmatter fence, matching existing
interview files — everything here is metadata.

## Step 6 — Find or create posts

List existing posts' frontmatter (`title`, `description`, `tags`) via
`Glob src/content/docs/posts/**/*.mdx` — note the `**`, posts live in
thematic subfolders — + reading just the frontmatter of each. For every candidate claim from Step 3:

- **Extend** an existing post if its topic substantially covers the claim —
  add a citation (Step 7) and weave the claim into the prose as a new
  sentence, paragraph, or subsection.
- **Create** a new post only when nothing existing covers the topic and the
  claim is substantial enough to anchor one. Posts are **topic-scoped**, not
  interview-scoped or claim-scoped: idea.md's model is "cada post es un
  texto que incluye toda la información sobre ese tema" — one interview
  usually touches a handful of topics across new and existing posts, never
  one post per claim. New post path:
  `src/content/docs/posts/<grupo>/<topic-slug>.mdx` — one flat file inside
  one of the five thematic folders, never a deeper nesting — where
  `<topic-slug>` is a 2-4 word kebab-case Spanish topic phrase (matches
  `calidad-del-sueno`, `longevidad-y-ejercicio`).

  The five groups, and what each one holds:

  | Folder | Sidebar group | Scope |
  |---|---|---|
  | `alimentacion` | Alimentación | What to eat and drink: nutrients, guidance, supplements, hydration |
  | `entrenamiento` | Entrenamiento y movimiento | How to train: strength, load, technique, mobility |
  | `sueno` | Sueño y descanso | Sleep: quality, rhythms, environment, insomnia |
  | `metabolismo` | Peso, metabolismo y hormonas | What the body measures: body composition, blood work, hormones |
  | `habitos` | Mente y hábitos | Why it sticks or doesn't: adherence, stress, mental health |

  Pick by the post's **main axis**, not by every topic it touches: *Cómo
  perder grasa* sits in `metabolismo` even though it discusses training,
  because the post is about body composition. A genuinely new group means
  editing the `sidebar` array in `astro.config.mjs` too — otherwise it never
  shows up in the navigation. Check existing `tags` across posts first and
  reuse that vocabulary instead of fragmenting it (don't add `sleep`
  alongside an existing `sueño`).
- Posts are **always written in Spanish**, regardless of the interview's
  spoken language — translate/distill English-language claims.
- The post's frontmatter `title` is **what the sidebar shows**. Write it as
  human-readable Spanish prose with proper accents and capitalisation
  (`Alimentación y longevidad`), never as a slug. The file name carries the
  slug (kebab-case, unaccented); the two are independent. This holds for
  every post you create, on every run — a slug-shaped `title` leaks straight
  into the site navigation.
- A brand-new post needs the standard import line at the top of its body:
  `import SourcePopover from '@/components/SourcePopover.astro';`
  Copy it exactly. It uses the `@/` alias from `tsconfig.json`, so it does
  not depend on how deep the file sits — do not turn it back into a relative
  path.
- Claims you judged as noise in Step 3 simply aren't written anywhere — that
  filtering already happened.
- Posts stay mostly text. A ```d2``` fenced block (rendered by the astro-d2
  integration) is worth adding only when a claim describes a cycle, causal
  chain, or process genuinely clearer as a diagram than as prose — not as
  decoration, and not on every post. When a diagram has one relationship
  that matters more than its neighbors (the edge that drives the cycle, the
  step that gates the rest), mark that single edge `{style.animated: true}`
  to draw the eye to it; leave ordinary edges unstyled. Don't animate more
  than one or two edges in the same diagram, or the emphasis is lost.

## Step 7 — Cite sources

Each new fact needs an entry in that post's frontmatter `sources[]` array
and a matching inline `<SourcePopover>`:

1. **id scheme**: `src-<person-slug>-<topic-slug>-<n>` (matches the seed
   pattern `src-attia-sueno-1`). These only need to be unique *within that
   one post's own `sources[]` array* — `SourcePopover.astro` filters against
   the post's own frontmatter, not a global namespace — so just scan that
   post's existing `sources[]`, find the highest `n` already used for that
   person+topic prefix, and use `n+1` (start at `1`).
2. **Append to frontmatter**:
   ```yaml
   sources:
     - id: src-attia-sueno-3
       interview: <interview slug from Step 5>
       personIds: [<person-id(s) this claim is attributed to>]
       quote: "<short direct quote, optional but preferred>"
       timestamp: "<HH:MM:SS from the transcript line>"
   ```
   `interview` and `personIds` are **plain strings**, not Astro
   `reference()`s — write them exactly as the ids/slugs, nothing fancier.
3. **Insert inline**, right after the sentence/clause it backs:
   ```mdx
   Dormir menos de 6 horas de forma crónica incrementa el riesgo cardiovascular
   <SourcePopover ids={["src-attia-sueno-3"]} sources={frontmatter.sources} />.
   ```
4. **Conflicting viewpoints**: never overwrite or delete what's already
   there. When two sources disagree on the same fact, give each its own
   attributed sentence and its own popover:
   ```mdx
   Según Peter Attia, dormir menos de 6 horas de forma crónica incrementa el
   riesgo cardiovascular <SourcePopover ids={["src-attia-sueno-1"]} sources={frontmatter.sources} />.
   Andrew Huberman matiza que el impacto depende en gran medida de la
   variabilidad genética individual <SourcePopover ids={["src-huberman-sueno-1"]} sources={frontmatter.sources} />.
   ```
   When sources agree/reinforce instead, they can share one popover on one
   consensus sentence: `ids={["src-a-1", "src-b-1"]}`.

## Step 8 — Commit (never push)

Follow `CONTRIBUTING.md` exactly — one logical change per commit, source
trailer in the body:

1. `content(person): añadir perfil(es) de <name(s)>` — bundle **all**
   newly-created people files from this run (plus any `role → both`
   promotion). Skip this commit entirely if no people were created/changed.
2. `content(interview): añadir entrevista <slug>` — the new interview file.
3. One `content(post): ...` commit **per post touched** (created or edited)
   — never batch unrelated posts into one commit. Post paths include their
   group: `src/content/docs/posts/<grupo>/<slug>.mdx`.

Every content commit body includes:
```
Source: interviews/<slug> (<youtubeUrl>)
```

When done, run `git log --oneline -n <N>` for the new commits and
`git status`, and tell the user explicitly:
**nothing has been pushed — review the diff and push yourself when satisfied.**

## Out of scope for this skill

- No Whisper/audio-transcription fallback when captions are missing.
- No automated `git push`.
- No periodic "re-evaluate all accumulated knowledge" pass across the whole
  site — idea.md mentions this as a future, separate concern. This skill
  only touches posts topically relevant to *this* interview's claims.
- No photo-sourcing, no automated tag-taxonomy cleanup beyond reusing
  existing tags where they obviously apply.
