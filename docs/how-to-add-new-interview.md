# Cómo añadir una entrevista nueva

Manual de uso del pipeline de ingesta. Describe el flujo completo desde una
URL de YouTube hasta unos commits listos para revisar.

El trabajo de destilado lo hace la skill `/ingest-interview`
(`.claude/skills/ingest-interview/`). Tu papel es lanzarla, revisar el
resultado y decidir si se publica: **la skill nunca hace push**.

---

## 1. Requisitos (solo la primera vez)

```bash
pnpm install
pipx install yt-dlp   # o: brew install yt-dlp
yt-dlp --version      # debe responder
```

`yt-dlp` se rompe con frecuencia porque YouTube cambia; conviene actualizarlo
antes de una sesión de ingesta:

```bash
pipx upgrade yt-dlp   # o: pip install -U yt-dlp
```

Si al ejecutarlo avisa de que no encuentra un runtime de JavaScript, instala
Deno (`curl -fsSL https://deno.land/install.sh | sh`). Sin él, YouTube puede
devolver metadatos incompletos.

---

## 2. Flujo normal

### Paso 1 — Partir de un árbol limpio

```bash
git status --porcelain   # no debe devolver nada
```

La skill se detiene si hay cambios pendientes, para no mezclar trabajo ajeno
con los commits de contenido.

### Paso 2 — Lanzar la skill

En una sesión de Claude Code, en la raíz del repo:

```
/ingest-interview https://www.youtube.com/watch?v=VIDEO_ID
```

Valen las formas `watch?v=`, `youtu.be/` y `/shorts/`.

### Paso 3 — Qué ocurre por dentro

1. **Canonicaliza la URL** y comprueba si ese vídeo ya está ingerido
   (busca el id en `src/content/interviews/`). Si ya existe, se detiene.
2. **Descarga la transcripción** a `tmp/ingest/<videoId>/` (ignorado por git).
3. **Lee y destila** la transcripción, quedándose solo con afirmaciones
   prácticas y aplicables. Descarta charla, patrocinios y divagaciones.
4. **Resuelve las personas**: reutiliza los perfiles existentes o crea los que
   falten en `src/content/people/`.
5. **Crea la entrevista** en `src/content/interviews/`.
6. **Escribe los posts**: amplía los existentes cuando el tema ya está
   cubierto y crea nuevos solo cuando ningún post lo cubre. Cada afirmación
   lleva su entrada en `sources[]` y su `<SourcePopover>` inline.
7. **Hace commits locales**, uno por cambio lógico.

### Paso 4 — Revisar

```bash
pnpm build              # validación real: falla si alguna cita no resuelve
git log --oneline -10
git diff <sha-anterior>..HEAD
pnpm dev                # http://localhost:4321
```

`pnpm build` es la comprobación más útil: `SourcePopover.astro` lanza un error
si un `sources[].interview` o un `personIds[]` apunta a algo que no existe, así
que un build verde garantiza que todas las citas están bien enlazadas.

Al revisar el contenido, mira sobre todo:

- **¿Las afirmaciones dicen lo que dice el vídeo?** Contrasta los `timestamp`
  de `sources[]` con la transcripción en `tmp/ingest/<videoId>/transcript.txt`.
- **¿Los perfiles de personas nuevas son correctos?** Es lo más fácil de
  equivocar (ver "Identidad de los invitados" más abajo).
- **¿Los posts nuevos hacían falta?** Un tema ya cubierto debería haberse
  ampliado, no duplicado.
- **¿Se han respetado las etiquetas existentes?** Sin sinónimos redundantes
  (`sueño` y `descanso`, `nutrición` y `alimentación`).

### Paso 5 — Publicar

```bash
git push
```

---

## 3. Deshacer una ingesta de prueba

Los commits son locales hasta que hagas push, así que basta con retroceder:

```bash
git log --oneline                  # localiza el commit anterior a la ingesta
git reset --hard <sha-anterior>
```

La transcripción descargada sigue en `tmp/ingest/<videoId>/`, que está
ignorado por git. Puedes dejarla (ahorra volver a descargarla si repites la
ingesta) o borrarla:

```bash
rm -rf tmp/ingest/<videoId>
```

---

## 4. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `yt-dlp not found on PATH` | No está instalado: `pipx install yt-dlp`. |
| `No captions (manual or automatic) are available` (código 2) | El vídeo no tiene subtítulos de ningún tipo. El pipeline **no** transcribe audio por decisión de diseño: busca otro vídeo o espera a que YouTube genere los automáticos. |
| `yt-dlp failed to fetch video metadata` | Suele ser `yt-dlp` desactualizado. Actualízalo y reintenta. |
| `Could not extract a YouTube video id from URL` | URL con formato no reconocido (listas de reproducción, enlaces acortados). Usa la forma `watch?v=<id>`. |
| La skill dice que el vídeo ya está ingerido | Correcto: ese id ya aparece en `src/content/interviews/`. Otra entrevista distinta al mismo invitado sí se puede añadir, porque tiene otro id. |
| La skill se detiene por cambios pendientes | Haz commit o `git stash` de tu trabajo antes de lanzarla. |

---

## 5. Cosas a tener en cuenta

### Clips frente a episodios completos

Muchos canales publican clips cortos además del episodio íntegro. Ambos son
ingeribles, pero ten en cuenta que:

- Cada uno tiene su propio id, así que **ingerir el clip y luego el episodio
  completo creará dos entrevistas** con contenido solapado. Elige uno.
- Los títulos de los clips suelen ser reclamos que no describen el contenido
  real ("Come esto todos los días para bajar de peso" en un fragmento que
  habla de perfiles lipídicos). El post se organiza por el tema real, no por
  el título.

Para construir la base de conocimiento, **el episodio completo es la mejor
fuente**: más afirmaciones y contexto suficiente para atribuirlas bien.

### Identidad de los invitados

Es el punto más delicado. La transcripción rara vez dice el nombre completo, y
los apellidos frecuentes se prestan a confusión. La skill consulta la
descripción del vídeo, que suele traer la biografía del invitado, y verifica
antes de escribir una `bio`. Aun así, **revisa siempre los perfiles nuevos**:
un perfil erróneo contamina todas las citas que cuelgan de él.

Si no hay información fiable, la skill escribe un marcador honesto en lugar de
inventar datos. Si ves uno, complétalo a mano.

### Vídeos largos

Una entrevista de dos horas son varios miles de líneas de transcripción. La
skill las lee por tramos y puede dejar una lista de trabajo en
`tmp/ingest/<videoId>/claims.md` (ignorado por git). El proceso tarda bastante
más que con un clip y consume bastante contexto; es normal.

### Qué NO hace la skill

- No transcribe audio cuando no hay subtítulos.
- No hace `git push` nunca.
- No busca ni añade fotografías de las personas.
- No reevalúa todo el conocimiento acumulado del sitio: solo toca los posts
  relacionados con las afirmaciones de esa entrevista. La reorganización
  global es una tarea aparte.

---

## 6. Referencia: el script de transcripción

La skill lo llama por ti, pero se puede ejecutar suelto para inspeccionar un
vídeo antes de ingerirlo:

```bash
pnpm transcript:fetch <url> [--lang es|en] [--out-dir tmp/ingest]
```

Escribe en `tmp/ingest/<videoId>/`:

| Archivo | Contenido |
|---|---|
| `meta.json` | Título, canal, fecha, duración, idioma y origen de los subtítulos |
| `captions.<lang>.vtt` | Subtítulos originales sin procesar |
| `transcript.json` | Segmentos con marca de tiempo |
| `transcript.txt` | Texto legible, una línea por segmento: `[HH:MM:SS] texto` |

Prefiere subtítulos manuales sobre automáticos, y dentro de cada tipo el
español, después el inglés, y si no cualquier otro idioma disponible.

Códigos de salida: `0` correcto · `1` error · `2` sin subtítulos.

Los tests del parser no necesitan red ni `yt-dlp`:

```bash
pnpm test:transcript
```
