/**
 * The two date shapes every interview surface needs: the ISO value for
 * `<time datetime>` (which doubles as the sort key on the listing) and the
 * localised label that is actually shown.
 *
 * Formatting here rather than in the component keeps both in step, and keeps
 * it on the server: `toLocaleDateString` in a hydrated island would follow the
 * visitor's own locale and disagree with the prerendered HTML.
 */
export function formatInterviewDate(date: Date): { dateISO: string; dateLabel: string } {
  return {
    dateISO: date.toISOString().slice(0, 10),
    dateLabel: date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
}
