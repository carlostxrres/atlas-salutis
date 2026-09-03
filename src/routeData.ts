import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

// Thin horizontal bar pinned to the very top of the viewport, its width
// tracking scroll position through the page. Pure progressive enhancement:
// the script creates its own element at runtime, so nothing renders (and
// nothing breaks) with JS disabled. No Starlight component override needed
// for this — `head` route data reaches every page already.
const READING_PROGRESS_STYLE = `
  #reading-progress {
    position: fixed;
    inset-block-start: 0;
    inset-inline-start: 0;
    height: 2px;
    width: 0%;
    background: var(--sl-color-accent);
    z-index: calc(var(--sl-z-index-navbar) + 1);
    transition: width 80ms linear;
  }
  @media (prefers-reduced-motion: reduce) {
    #reading-progress {
      transition: none;
    }
  }
`;

const READING_PROGRESS_SCRIPT = `
  (function () {
    var bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.appendChild(bar);
    function update() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      bar.style.width = (scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0) + '%';
    }
    document.addEventListener('scroll', update, { passive: true });
    update();
  })();
`;

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals;

  const overviewItem = starlightRoute.toc?.items[0];
  if (overviewItem) overviewItem.text = '';

  starlightRoute.head.push(
    { tag: 'style', content: READING_PROGRESS_STYLE },
    { tag: 'script', content: READING_PROGRESS_SCRIPT },
  );
});
