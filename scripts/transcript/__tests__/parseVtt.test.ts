import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { parseVttCues, mergeRollingCaptions, formatTimestamp, segmentsToText } from '../parseVtt.ts';

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../__fixtures__');
const readFixture = (name: string) => readFileSync(path.join(fixturesDir, name), 'utf-8');

test('formatTimestamp pads to HH:MM:SS and truncates fractional seconds', () => {
  assert.equal(formatTimestamp(0), '00:00:00');
  assert.equal(formatTimestamp(59.9), '00:00:59');
  assert.equal(formatTimestamp(754), '00:12:34');
  assert.equal(formatTimestamp(3661), '01:01:01');
});

test('parseVttCues strips inline tags, decodes entities, and joins wrapped lines', () => {
  const vtt = [
    'WEBVTT',
    '',
    '00:00:01.000 --> 00:00:02.000 align:start position:0%',
    'hello<00:00:01.200><c> world</c> &amp; friends',
    'second line',
    '',
  ].join('\n');

  const cues = parseVttCues(vtt);
  assert.equal(cues.length, 1);
  assert.equal(cues[0]!.text, 'hello world & friends second line');
  assert.equal(cues[0]!.start, 1);
  assert.equal(cues[0]!.end, 2);
});

test('parseVttCues skips cue-id lines preceding the timing line', () => {
  const cues = parseVttCues(readFixture('manual-captions.es.vtt'));
  assert.equal(cues.length, 3);
  assert.equal(cues[0]!.text, 'Hola, bienvenidos a este canal de salud.');
});

test('mergeRollingCaptions passes manual (non-overlapping) captions through 1:1', () => {
  const cues = parseVttCues(readFixture('manual-captions.es.vtt'));
  const segments = mergeRollingCaptions(cues);

  assert.deepEqual(
    segments.map((s) => s.text),
    [
      'Hola, bienvenidos a este canal de salud.',
      'Hoy tenemos con nosotros a un experto en sueño.',
      'Vamos a hablar sobre cómo mejorar la calidad del descanso.',
    ],
  );
  assert.deepEqual(
    segments.map((s) => s.start),
    [0, 3.5, 7.2],
  );
});

test('mergeRollingCaptions collapses YouTube-style rolling auto-caption duplication', () => {
  const cues = parseVttCues(readFixture('auto-captions.en.vtt'));
  assert.equal(cues.length, 8, 'fixture should parse into 8 raw cues');

  const segments = mergeRollingCaptions(cues);

  assert.deepEqual(
    segments.map((s) => s.text),
    ['sleeping less than six hours a night increases', 'cardiovascular risk according to peter attia'],
  );
  // Each segment keeps the *original* start of its first rolling cue, not
  // the timestamp of the "settled" duplicate that happened to extend it.
  assert.deepEqual(
    segments.map((s) => s.start),
    [0.08, 8.11],
  );
});

test('segmentsToText renders one bracketed-timestamp line per segment', () => {
  const text = segmentsToText([
    { start: 0, text: 'Hola.' },
    { start: 754, text: 'Dormir menos de seis horas...' },
  ]);
  assert.equal(text, '[00:00:00] Hola.\n[00:12:34] Dormir menos de seis horas...');
});
