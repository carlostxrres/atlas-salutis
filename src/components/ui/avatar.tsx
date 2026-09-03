import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('bg-avatar relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

// A plain `<img>`, not `AvatarPrimitive.Image`: Radix's Image primitive only
// swaps in once its client-side load state resolves to 'loaded', which never
// happens for these avatars since they render fully static with no
// hydration. Callers should render this or `AvatarFallback` (never both) —
// see e.g. `PersonProfileHeader`.
function AvatarImage({ className, ...props }: React.ComponentProps<'img'>) {
  return <img data-slot="avatar-image" className={cn('aspect-square size-full object-cover', className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('text-avatar-foreground flex size-full items-center justify-center rounded-full font-medium', className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
