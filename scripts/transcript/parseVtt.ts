// Pure, network-free VTT parsing/cleaning. Split out from cli.ts so it can be
// unit-tested against checked-in fixtures without shelling out to yt-dlp.

export interface VttCue {
  /** Cue start time, in seconds. */
  start: number;
  /** Cue end time, in seconds. */
  end: number;
  text: string;
}

export interface TranscriptSegment {
  /** Segment start time, in seconds. */
  start: number;
  text: string;
}

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (match) => HTML_ENTITIES[match] ?? match);
}

function cleanCueText(rawLines: string[]): string {
  const joined = rawLines.join(' ');
  const withoutTags = joined.replace(/<[^>]*>/g, '');
  return decodeEntities(withoutTags).replace(/\s+/g, ' ').trim();
}

// Parses "HH:MM:SS.mmm" or "MM:SS.mmm" into seconds.
function parseVttTimestamp(raw: string): number {
  const match = /^(?:(\d+):)?(\d{2}):(\d{2})\.(\d{3})$/.exec(raw.trim());
  if (!match) {
    throw new Error(`Invalid VTT timestamp: "${raw}"`);
  }
  const [, hours, minutes, seconds, millis] = match;
  return (
    (hours ? Number(hours) * 3600 : 0) +
    Number(minutes) * 60 +
    Number(seconds) +
    Number(millis) / 1000
  );
}

const CUE_TIMING_RE = /(\S+)\s*-->\s*(\S+)/;

/** Parses raw WEBVTT text into cues, dropping empty cues, tags, and header/NOTE/STYLE blocks. */
export function parseVttCues(vtt: string): VttCue[] {
  const normalized = vtt.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const blocks = normalized.split(/\n\n+/);
  const cues: VttCue[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.length > 0);
    const timingIndex = lines.findIndex((line) => CUE_TIMING_RE.test(line));
    if (timingIndex === -1) continue; // WEBVTT header, NOTE, STYLE, or a stray cue-id-only block

    const timingMatch = CUE_TIMING_RE.exec(lines[timingIndex]!);
    if (!timingMatch) continue;
    const start = parseVttTimestamp(timingMatch[1]!);
    const end = parseVttTimestamp(timingMatch[2]!);

    const text = cleanCueText(lines.slice(timingIndex + 1));
    if (text.length === 0) continue;

    cues.push({ start, end, text });
  }

  return cues;
}

/**
 * Collapses YouTube's rolling auto-caption duplication (each cue re-showing
 * the previous cue's tail plus a few new words) into clean, non-overlapping
 * segments. Manual captions (no overlap) pass through ~1:1.
 */
export function mergeRollingCaptions(cues: VttCue[]): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  let open: TranscriptSegment | null = null;

  for (const cue of cues) {
    if (open === null) {
      open = { start: cue.start, text: cue.text };
    } else if (cue.text.startsWith(open.text)) {
      // Rolling continuation: same segment, more words revealed. Keep the
      // original start timestamp.
      open.text = cue.text;
    } else if (open.text.startsWith(cue.text)) {
      // Cue carries no new information beyond what's already captured.
      continue;
    } else {
      segments.push(open);
      open = { start: cue.start, text: cue.text };
    }
  }

  if (open !== null) segments.push(open);

  return segments;
}

/** Formats a seconds offset as "HH:MM:SS" (truncated, no fractional seconds). */
export function formatTimestamp(totalSeconds: number): string {
  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Renders segments as "[HH:MM:SS] text" lines, one per segment. */
export function segmentsToText(segments: TranscriptSegment[]): string {
  return segments.map((segment) => `[${formatTimestamp(segment.start)}] ${segment.text}`).join('\n');
}
