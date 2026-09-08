import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Collapses a multi-paragraph text into a single clamped line of prose.
//
// Listing cards only ever show a couple of lines, and a hydrated island pays
// for its text twice — once in the server-rendered markup, once in the
// serialized props next to it — so trimming here rather than with CSS alone
// keeps the full text off the wire.
export function excerpt(text: string, maxLength = 180): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxLength) return collapsed;

  const cut = collapsed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]$/, '')}…`;
}

// Fallback initials for an Avatar when no photo is available yet.
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
