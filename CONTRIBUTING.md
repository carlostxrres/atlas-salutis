# Convenciones de este repositorio

El contenido de este sitio se genera y mantiene con IA, y cambia con
frecuencia: los posts se crean, editan, dividen, fusionan y reorganizan a
medida que se procesan nuevas entrevistas. Estas convenciones existen para
que el historial de git siga siendo legible y trazable pese a ese ritmo de
cambio.

## Prefijos de commit

Cambios de **contenido**:

- `content(post): ...` — post nuevo o editado (`src/content/docs/posts/**`)
- `content(interview): ...` — entrevista nueva o editada (`src/content/interviews/**`)
- `content(person): ...` — perfil de persona nuevo o editado (`src/content/people/**`)
- `content(reorg): ...` — división, fusión o renombrado de posts, sin cambios
  de contenido sustanciales

Cambios de **repositorio** (código, configuración, dependencias):

- `scaffold:` — cambios de andamiaje/estructura del proyecto
- `feat:` — nueva funcionalidad
- `fix:` — corrección de errores
- `chore:` — mantenimiento (dependencias, configuración, etc.)
- `docs:` — documentación fuera del contenido del sitio (este archivo, `docs/idea.md`, etc.)

## Trazabilidad en el cuerpo del commit

Los commits de contenido deben nombrar la fuente que motivó el cambio, por
ejemplo:

```
content(post): añadir sección sobre zona 2 a longevidad-y-ejercicio

Source: interviews/marcos-vazquez-entrevista-peter-attia-longevidad
(https://www.youtube.com/watch?v=EXAMPLE)
```

Esto complementa —no sustituye— el campo `sources[]` en el frontmatter de
cada post, que es la fuente de verdad para el renderizado de citas
(`SourcePopover`). El commit da trazabilidad a nivel de `git log`.

## Un cambio lógico por commit

No agrupar ediciones de posts no relacionados en un mismo commit: mantiene
`git log -- src/content/docs/posts/<slug>.mdx` como un historial limpio por
post.

## Renombrar antes de editar

Cuando la reorganización de conocimiento implica mover o renombrar un fichero
de post (`src/content/docs/posts/<slug>.mdx`), hacer el `git mv` en su propio
commit (`content(reorg): ...`), separado de cualquier edición de contenido en
el mismo post. Así la detección de renombrados de git funciona de forma fiable
y los diffs se mantienen legibles.

## Pipeline de ingesta de entrevistas

`scripts/fetch-transcript.ts` (usado por la skill `.claude/skills/ingest-interview/`)
requiere `yt-dlp` instalado localmente y acceso de red a YouTube — ninguna de
las dos cosas está disponible en una sesión en la nube con política de red
restringida, así que la lógica de parseo/limpieza de subtítulos se valida con
`pnpm test:transcript` (fixtures locales, sin red), y el flujo completo se
prueba manualmente en local:

```bash
pnpm exec tsx scripts/fetch-transcript.ts <url-de-youtube-real>
# inspeccionar tmp/ingest/<videoId>/meta.json y transcript.txt

# luego, en una sesión de Claude Code con la skill cargada:
/ingest-interview <url-de-youtube-real>
# revisar el diff/commits resultantes antes de hacer push (o `git reset` si
# solo era una prueba)
```
