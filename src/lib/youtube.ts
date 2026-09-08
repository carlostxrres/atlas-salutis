// YouTube video ids are always 11 characters of the URL-safe base64 alphabet.
// Validating the shape (rather than trusting whatever sits after `v=`) keeps
// placeholder urls — e.g. the `?v=EXAMPLE` in the sample interview quoted by
// CONTRIBUTING.md — from rendering as a broken embed: callers fall back to a
// plain link when this returns `undefined`.
const VIDEO_ID_RE = /^[\w-]{11}$/;

/**
 * Extracts the video id from any of the URL shapes YouTube hands out:
 * `watch?v=`, `youtu.be/`, `/embed/`, `/live/` and `/shorts/`.
 */
export function getYouTubeVideoId(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const host = parsed.hostname.replace(/^www\./, '');
  const candidate =
    host === 'youtu.be'
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:embed|live|shorts)\/([^/]+)/)?.[1]);

  return candidate && VIDEO_ID_RE.test(candidate) ? candidate : undefined;
}

/**
 * Privacy-preserving embed url. `youtube-nocookie.com` keeps YouTube from
 * writing tracking cookies until the visitor actually plays the video.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/**
 * Thumbnail url for a video. `mqdefault` is the largest size YouTube
 * guarantees for every video and the only small one that is a true 16:9
 * (320×180) — `hqdefault` and `sddefault` are 4:3 and arrive letterboxed,
 * and `maxresdefault` 404s on older uploads.
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}
