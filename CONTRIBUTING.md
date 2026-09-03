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

## Dónde va cada post

Los posts viven en cinco carpetas temáticas bajo `src/content/docs/posts/`.
La carpeta forma parte de la URL (`/posts/<grupo>/<slug>/`) y determina en qué
grupo del sidebar aparece el post:

| Carpeta | Grupo en el sidebar | Qué recoge |
|---|---|---|
| `alimentacion` | Alimentación | Qué comer y beber: nutrientes, pautas, suplementos, hidratación |
| `entrenamiento` | Entrenamiento y movimiento | Cómo entrenar: fuerza, carga, técnica, movilidad |
| `sueno` | Sueño y descanso | Dormir: calidad, ritmos, entorno, insomnio |
| `metabolismo` | Peso, metabolismo y hormonas | Qué mide el cuerpo: composición corporal, analítica, hormonas |
| `habitos` | Mente y hábitos | Por qué se sostiene o se abandona: adherencia, estrés, salud mental |

Al crear un post nuevo hay que elegir una de las cinco. Si un tema encaja en
dos, decide el eje principal del post: *Cómo perder grasa* va en
`metabolismo` aunque hable de entrenamiento, porque el objeto del post es la
composición corporal.

Las etiquetas del sidebar están en `astro.config.mjs`; una carpeta nueva no
aparece en la navegación hasta que se le añade su entrada.

## Un cambio lógico por commit

No agrupar ediciones de posts no relacionados en un mismo commit: mantiene
`git log -- src/content/docs/posts/<grupo>/<slug>.mdx` como un historial
limpio por post.

## Renombrar antes de editar

Cuando la reorganización de conocimiento implica mover o renombrar un fichero
de post (`src/content/docs/posts/<grupo>/<slug>.mdx`), hacer el `git mv` en su propio
commit (`content(reorg): ...`), separado de cualquier edición de contenido en
el mismo post. Así la detección de renombrados de git funciona de forma fiable
y los diffs se mantienen legibles.

## Componentes ShadCn y overrides de Starlight

Los componentes UI viven en `src/components/ui/` (alias `shadcn add`, ver
`components.json`) y usan tokens semánticos (`bg-card`, `text-muted-foreground`,
`border-input`...) definidos en `src/styles/global.css`, no clases de color
directas (`bg-slate-900`). Un componente nuevo debe seguir el mismo patrón:
así el tema claro/oscuro se resuelve solo, sin `dark:` repetido por todas
partes.

Starlight expone `data-theme='light'|'dark'` en `<html>` (nunca `'auto'`, lo
resuelve antes de escribirlo) en vez de una clase `.dark`; por eso
`global.css` redefine la variante `dark:` de Tailwind con
`@custom-variant dark` apuntando a `[data-theme='dark']`. Cualquier color que
no sea uno de los tokens del tema debe usar esa variante en vez de
`prefers-color-scheme`.

Los [overrides de componentes de Starlight](https://starlight.astro.build/reference/overrides/)
se registran en la clave `components` de `starlight()` en `astro.config.mjs`,
apuntando a ficheros en `src/overrides/` (crear la carpeta al añadir el
primer override). De la lista completa de componentes sobreescribibles, los
candidatos identificados hasta ahora son `ThemeSelect` y `LanguageSelect`
(rehacerlos con ShadCn); el home tipo revista no necesita override de `Hero`
porque Starlight ya soporta un hero vía frontmatter (`hero:` en el
frontmatter de la página), reforzado por `starlight-theme-next`.

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
