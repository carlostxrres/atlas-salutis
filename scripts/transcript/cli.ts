import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parseVttCues, mergeRollingCaptions, segmentsToText } from './parseVtt.ts';

const USAGE = 'Usage: fetch-transcript.ts <youtube-url> [--lang es|en] [--out-dir tmp/ingest]';
const MAX_BUFFER = 20 * 1024 * 1024;

/** Thrown when a video has no captions at all — the pipeline's documented, deliberate stopping point. */
export class NoCaptionsError extends Error {}

interface Args {
  url: string;
  lang?: string;
  outDir: string;
}

interface VideoMeta {
  videoId: string;
  title: string;
  channel: string;
  uploadDate: string;
  durationMinutes: number;
  youtubeUrl: string;
  captionsLang: string;
  captionsSource: 'manual' | 'auto';
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let lang: string | undefined;
  let outDir = 'tmp/ingest';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--lang') {
      lang = argv[++i];
    } else if (arg === '--out-dir') {
      outDir = argv[++i] ?? outDir;
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else {
      positional.push(arg);
    }
  }

  const url = positional[0];
  if (!url) throw new Error(USAGE);
  return { url, lang, outDir };
}

// Accepts watch?v=, youtu.be/, and /shorts/ URL forms.
function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?.*?[?&]?v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match) return match[1]!;
  }
  return null;
}

function checkYtDlpAvailable(): void {
  const result = spawnSync('yt-dlp', ['--version'], { encoding: 'utf-8' });
  if (result.error) {
    throw new Error(
      'yt-dlp not found on PATH. Install it (e.g. `pipx install yt-dlp` or `brew install yt-dlp`) — ' +
        'see https://github.com/yt-dlp/yt-dlp#installation',
    );
  }
}

function fetchMetadataJson(youtubeUrl: string): any {
  const result = spawnSync('yt-dlp', ['--dump-json', '--skip-download', youtubeUrl], {
    encoding: 'utf-8',
    maxBuffer: MAX_BUFFER,
  });
  if (result.status !== 0) {
    throw new Error(`yt-dlp failed to fetch video metadata:\n${result.stderr || result.stdout}`);
  }
  try {
    return JSON.parse(result.stdout.trim());
  } catch {
    throw new Error('yt-dlp returned metadata that could not be parsed as JSON.');
  }
}

// Pseudo-tracks YouTube lists alongside real subtitles but which are not
// transcripts. `live_chat` is the live-chat replay of a past stream: it only
// exists as JSON, so selecting it downloads no .vtt and aborts the run — and
// because it lands in `subtitles` (not `automatic_captions`), the
// any-manual-track fallback below used to prefer it over perfectly good
// automatic captions.
const NON_SUBTITLE_TRACKS = new Set(['live_chat']);

export function pickCaptionTrack(
  manualLangs: string[],
  autoLangs: string[],
  langHint: string | undefined,
): { source: 'manual' | 'auto'; lang: string } | null {
  const manual = manualLangs.filter((lang) => !NON_SUBTITLE_TRACKS.has(lang));
  const auto = autoLangs.filter((lang) => !NON_SUBTITLE_TRACKS.has(lang));
  const priority = [langHint, 'es', 'en'].filter((lang): lang is string => Boolean(lang));

  for (const lang of priority) if (manual.includes(lang)) return { source: 'manual', lang };
  if (manual.length > 0) return { source: 'manual', lang: [...manual].sort()[0]! };

  for (const lang of priority) if (auto.includes(lang)) return { source: 'auto', lang };
  if (auto.length > 0) return { source: 'auto', lang: [...auto].sort()[0]! };

  return null;
}

function downloadCaptions(
  youtubeUrl: string,
  track: { source: 'manual' | 'auto'; lang: string },
  videoOutDir: string,
): string {
  const args = [
    '--skip-download',
    track.source === 'manual' ? '--write-subs' : '--write-auto-subs',
    '--sub-langs',
    track.lang,
    '--sub-format',
    'vtt',
    '--output',
    path.join(videoOutDir, 'captions.%(ext)s'),
    youtubeUrl,
  ];
  const result = spawnSync('yt-dlp', args, { encoding: 'utf-8', maxBuffer: MAX_BUFFER });
  if (result.status !== 0) {
    throw new Error(`yt-dlp failed to download captions:\n${result.stderr || result.stdout}`);
  }

  const vttFile = readdirSync(videoOutDir).find((file) => file.endsWith('.vtt'));
  if (!vttFile) {
    throw new Error(`yt-dlp reported success but no .vtt file was found in ${videoOutDir}.`);
  }
  return path.join(videoOutDir, vttFile);
}

function formatUploadDate(raw: string | undefined): string {
  if (!raw || !/^\d{8}$/.test(raw)) return raw ?? '';
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

export async function runFetchTranscript(argv: string[]): Promise<number> {
  try {
    const args = parseArgs(argv);

    const videoId = extractVideoId(args.url);
    if (!videoId) {
      throw new Error(`Could not extract a YouTube video id from URL: ${args.url}`);
    }
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    checkYtDlpAvailable();

    const metaJson = fetchMetadataJson(youtubeUrl);
    const manualLangs = Object.keys(metaJson.subtitles ?? {});
    const autoLangs = Object.keys(metaJson.automatic_captions ?? {});

    const track = pickCaptionTrack(manualLangs, autoLangs, args.lang);
    if (!track) {
      throw new NoCaptionsError(
        `No captions (manual or automatic) are available for video ${videoId}. ` +
          'Per project policy this pipeline does not fall back to audio transcription — aborting.',
      );
    }

    const videoOutDir = path.join(args.outDir, videoId);
    mkdirSync(videoOutDir, { recursive: true });

    const vttPath = downloadCaptions(youtubeUrl, track, videoOutDir);
    const cues = parseVttCues(readFileSync(vttPath, 'utf-8'));
    const segments = mergeRollingCaptions(cues);

    const meta: VideoMeta = {
      videoId,
      title: metaJson.title ?? '',
      channel: metaJson.channel ?? metaJson.uploader ?? '',
      uploadDate: formatUploadDate(metaJson.upload_date),
      durationMinutes: Math.round((metaJson.duration ?? 0) / 60),
      youtubeUrl,
      captionsLang: track.lang,
      captionsSource: track.source,
    };

    writeFileSync(path.join(videoOutDir, 'meta.json'), JSON.stringify(meta, null, 2));
    writeFileSync(path.join(videoOutDir, 'transcript.json'), JSON.stringify({ segments }, null, 2));
    writeFileSync(path.join(videoOutDir, 'transcript.txt'), segmentsToText(segments));

    console.log(JSON.stringify({ ...meta, outDir: videoOutDir, segmentCount: segments.length }, null, 2));
    return 0;
  } catch (err) {
    if (err instanceof NoCaptionsError) {
      console.error(`Error: ${err.message}`);
      return 2;
    }
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}
