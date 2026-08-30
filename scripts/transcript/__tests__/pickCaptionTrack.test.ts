import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pickCaptionTrack } from '../cli.ts';

test('prefers manual captions over automatic ones', () => {
  assert.deepEqual(pickCaptionTrack(['es'], ['es', 'en'], undefined), {
    source: 'manual',
    lang: 'es',
  });
});

test('honours the language hint before the es/en default order', () => {
  assert.deepEqual(pickCaptionTrack([], ['es', 'en'], 'en'), { source: 'auto', lang: 'en' });
  assert.deepEqual(pickCaptionTrack([], ['es', 'en'], undefined), { source: 'auto', lang: 'es' });
});

test('falls back to any available track when neither es nor en is present', () => {
  assert.deepEqual(pickCaptionTrack([], ['pt', 'de'], undefined), { source: 'auto', lang: 'de' });
});

// Regression: videos with a live-chat replay list `live_chat` under `subtitles`.
// It is not a transcript and only exists as JSON, so preferring it aborted the
// run even when usable automatic captions were available.
test('ignores the live_chat pseudo-track and uses automatic captions instead', () => {
  assert.deepEqual(pickCaptionTrack(['live_chat'], ['es', 'en'], undefined), {
    source: 'auto',
    lang: 'es',
  });
});

test('returns null when live_chat is the only track on offer', () => {
  assert.equal(pickCaptionTrack(['live_chat'], [], undefined), null);
});
