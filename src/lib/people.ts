import { existsSync } from 'node:fs';
import { join } from 'node:path';

// `import.meta.url`-relative resolution breaks once this module is bundled
// for the build, since it then points at the bundle's location, not this
// source file's. `process.cwd()` stays pinned to the project root for both
// `astro dev` and `astro build`.
const PUBLIC_PEOPLE_DIR = join(process.cwd(), 'public', 'people');

// Person photos live at public/people/<personId>.png by convention — no
// frontmatter field to keep in sync. Falls back to `undefined` (Avatar's
// initials fallback) for anyone whose photo hasn't been added yet.
export function getPersonPhoto(personId: string): string | undefined {
  return existsSync(join(PUBLIC_PEOPLE_DIR, `${personId}.png`)) ? `/people/${personId}.png` : undefined;
}
