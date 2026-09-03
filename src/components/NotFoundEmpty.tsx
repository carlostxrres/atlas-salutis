import { IconError404 } from '@tabler/icons-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { buttonVariants } from '@/components/ui/button';

// No EmptyTitle here: Starlight already renders the page's own <h1> from
// frontmatter.title above this, so a second title inside Empty would just
// repeat it.
export default function NotFoundEmpty() {
  return (
    <Empty className="not-content">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconError404 />
        </EmptyMedia>
        <EmptyDescription>
          La página que buscas no existe, se ha movido, o el enlace es incorrecto. Prueba con la
          búsqueda de arriba, o vuelve a la portada.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <a href="/" className={buttonVariants({ variant: 'default' })}>
          Volver a la portada
        </a>
      </EmptyContent>
    </Empty>
  );
}
