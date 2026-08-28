## Concepto

Un blog sobre salud práctica personal. Lo que lo hace diferente:

- No es realmente un "blog" sino un repositorio estructurado, como una pequeña wikipedia.
- El contenido es 100% creado y mantenido con IA, con 0 intervención humana.
- Todas las afirmaciones tienen una fuente trazable.
- Está en contanste cambio. De forma iterativa, se van añadiendo fuentes. La IA no inventa nada, solo destila y reorganiza posts e ideas.

No es un blog de entrevistas, sino una base de conocimiento viva en constante cambio: cada vez que se añade un conocimiento nuevo (es decir, la transcripción de una entrevista), los posts son susceptibles de ser eliminados, creados, o cambiados; en definitiva, reorganizados.

Las fuentes son entrevistas a expertos en salud, de vídeos de YouTube.

Debido a los cambios de contenido, es importante establecer una buena convención de git para mantener el historial del blog.

## Pain point

Consumo entrevistas de salud a menudo. Y ocurren varias cosas que no me gustan:

- Oigo ideas interesantes y aplicables de entrevistados en los que confío, pero no las apunto (porque estoy haciendo algo, como duchándome), me olvido, y nunca las llego a aplicar.
- Las ideas interesantes y aplicables están diluidas en mucho tiempo de ideas no interesantes o no aplicables. De una entrevista de dos horas quizás me llevo solo unas pocas.
- Lo que dicen unos entrevistados no coincide exactamente con lo que dicen otros. Normalmente se complementan, o se contradicen en parte o incluso totalmente.

De aquí nace la necesidad de:

- Extraer el contenido de salud realmente interesante y aplicable de  cada entrevista, sin ruido.
- Poner frente a frente ideas diferentes (complementarias o contradictorias), cada una con sus fuentes.
- Saber qué ideas cuentan con amplio consenso y cuáles son más discutidas.
- Hacer que el contenido sea buscable.

## Método

Cogeremos transcripciones de todas las entrevistas de Tengo un Plan y otros canales de youtube similares (Fitness Revolucionario, Marcos Vázquez, Peter Attia, Huberman...), relacionados con salud a nivel divulgativo, personal y práctico.

Estructuraremos los conocimientos en carpetas y archivos .mdx donde cada post es un tema diferente.

Con cada entrevista:

- se detectan los posts donde debería ir cada parte de información
- se enmienda cada parte del artículo, siempre señalando la fuente
- la IA reevalúa todo el conocimiento acumulado

El objetivo es que cada post sea un texto que incluye toda la información sobre ese tema, de forma comprensiva y práctica. Cuando para un mismo hecho haya varias opiniones, se refleja cada una, señalando

Iterativo: poco a poco vamos añadiendo un nuevo vídeo que añade contenidos nuevos.

Acumulativo: el conocimiento anterior nunca se elimina. Solo se añade nuevo conocimiento, ofreciendo diferentes puntos de vista sobre un mismo hecho.

La IA automáticamente detecta los temas de posts y genera los nuevos archivos, reestructura los posts si hace falta, etcétera.

Tenemos que definir el pipeline: cómo se iniciará (el input será, supongo, una URL de un vídeo de una entrevista), y cómo serán los pasos, que terminarán haciendo commit de unos cambios en la carpeta de contenidos.

## Páginas

### People

Una agenda con cada perfil de Interviewee e Interviewer, con capacidad de búsqueda. Contendría datos estáticos de la persona (fotografía, bio...) y datos computados (enlaces a los posts donde se referencia, número de referencias -puede haber más de una por post-, lista de entrevistas con enlace a `/interviews/:interviewId`...).

Rutas:

- `/people`
- `/people/:personId`

### Interview

Una agenda con cada entrevista, con sus Interviewee e Interviewer enlacados (`/people/:personId`), fecha, un pequeño resumen, enlace a la entrevista en YouTube y otros datos.

Rutas:

- `/interviews`
- `/interviews/:interviewId`

### Post

El contenido principal. Son posts de salud, organizados por carpetas en archivos .mdx.

Rutas:

- `/posts/:postId`

## Componentes

La app usará TypeScript. Para los componentes, usaremos React y ShadCn.

Estos son algunos componentes que podemos usar:

### SourcePopover

En cada afirmación podemos ver un tooltip con el número de fuentes. En el contenido del popover vemos una lista con cada fuente, cada una de ellas con:

- El entrevistado (con link a `/people/:personId`)
- El título de la entrevista (con enlace a `/interviews/:interviewId`)

### D2 diagrams

Usaremos D2 o algo similar para permitir a la IA crear diagramas de forma sencilla.

## Stack

### Astro Starlight

Para el contenido usaríamos Astro Starlight o algún otro framework de documentación fácil de mantener, sin sobreingeniería, como Docusaurus, Fumadocs, Nextra, o similares. El framework debe cumplir los siguientes requisitos:

- Organizar el contenido automáticamente a partir de una estructura de carpetas y archivos .md o .mdx.
- Permitir usar componentes de React dentro de .mdx.
- Fácil de mantener, sin sobreingeniería.
- Tener feature de búsqueda, usando por ejemplo Pagefind.
- Compatibilidad con TypeScript.

### TypeScript & React

### ShadCn

Los componentes serán de shadCn.

### Supabase

Aprovechando que estoy pagando la versión pro.

## SQL

Algunas tablas:

- interviewee
- interviewer
- interviews:
	- interviewee[]
	- interviewer[]
	- summary
	- transcription (esto no debería estar en la base de datos, ¿no?)
	- datetime
	- duration
	- url (youtube)
	- language