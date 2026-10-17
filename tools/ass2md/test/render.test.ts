import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AssScript } from '../src/ass';
import { renderMarkdown } from '../src/render';

const script: AssScript = {
  info: { Title: 'Sample Episode', 'Original Translation': 'Coolmic' },
  styles: [
    { name: 'Default', fields: {} },
    { name: 'Signs', fields: {} },
  ],
  events: [
    {
      type: 'Dialogue',
      layer: '0',
      start: '0:00:07.49',
      end: '0:00:09.36',
      style: 'Default',
      name: '',
      text: 'Ya es suficiente.',
      fields: {},
    },
    {
      type: 'Comment',
      layer: '0',
      start: '0:00:01.00',
      end: '0:00:02.00',
      style: 'Signs',
      name: 'Dark',
      text: '{\\pos(10,10)}TITLE CARD',
      fields: {},
    },
    {
      type: 'Dialogue',
      layer: '0',
      start: '0:00:26.57',
      end: '0:00:28.65',
      style: 'Default',
      name: 'Juan',
      text: 'una\\Ndos',
      fields: {},
    },
    {
      type: 'Dialogue',
      layer: '0',
      start: '0:00:16.73',
      end: '0:00:16.77',
      style: 'Signs',
      name: 'Signs',
      text: '{\\p1}m 6.875 82 b 7 79 7.375 76',
      fields: {},
    },
  ],
};

test('renders a titled transcript with normalized timestamps and speaker fallback', () => {
  const md = renderMarkdown(script, { sourceName: 'ANI][Sample_01.ass' });

  assert.match(md, /^# Sample Episode/);
  assert.match(md, /File:\*\* `ANI\]\[Sample_01\.ass`/);
  assert.match(md, /\*\*Default\*\* `00:00:07\.49 → 00:00:09\.36`/);
  assert.match(md, /Ya es suficiente\./);
  assert.match(md, /\*\*Juan\*\* `00:00:26\.57 → 00:00:28\.65`/);
  assert.match(md, /una\ndos/);
  assert.match(md, /Original Translation:\*\* Coolmic/);
});

test('accounts for rendered vs excluded events', () => {
  const md = renderMarkdown(script, { sourceName: 'x.ass' });
  assert.match(md, /Events:\*\* 2 rendered of 4/);
  assert.match(md, /Excluded:\*\* 1 comment · 1 drawing/);
});

test('skips Comment and drawing events by default, includes them on request', () => {
  const md = renderMarkdown(script, { sourceName: 'x.ass' });
  assert.doesNotMatch(md, /TITLE CARD/);
  assert.doesNotMatch(md, /m 6\.875/);

  const withComments = renderMarkdown(script, { sourceName: 'x.ass', includeComments: true });
  assert.match(withComments, /TITLE CARD/);
  assert.match(withComments, /Events:\*\* 3 rendered of 4/);
  assert.match(withComments, /Excluded:\*\* 1 drawing/);

  const withDrawings = renderMarkdown(script, { sourceName: 'x.ass', includeDrawings: true });
  assert.match(withDrawings, /m 6\.875/);
  assert.match(withDrawings, /Events:\*\* 3 rendered of 4/);
  assert.match(withDrawings, /Excluded:\*\* 1 comment/);
});

test('omits timestamps when disabled', () => {
  const md = renderMarkdown(script, { sourceName: 'x.ass', timestamps: false });
  assert.doesNotMatch(md, /00:00:07\.49/);
  assert.match(md, /\*\*Default\*\*/);
});

test('falls back to the file name for generic titles', () => {
  const generic: AssScript = { info: { Title: 'subtitles' }, styles: [], events: [] };
  assert.match(renderMarkdown(generic, { sourceName: 'ANI][Meijyou_01_EXT.ass' }), /^# ANI\]\[Meijyou_01_EXT/m);
});

test('skips events by style name (case-insensitive)', () => {
  const signs: AssScript = {
    info: {},
    styles: [],
    events: [
      { type: 'Dialogue', layer: '0', start: '0:00:01.00', end: '0:00:02.00', style: 'Signs', name: '', text: 'CREDIT', fields: {} },
      { type: 'Dialogue', layer: '0', start: '0:00:03.00', end: '0:00:04.00', style: 'Default', name: '', text: 'Hola', fields: {} },
    ],
  };

  const md = renderMarkdown(signs, { sourceName: 'x.ass', skipStyles: ['signs'] });
  assert.doesNotMatch(md, /CREDIT/);
  assert.match(md, /Hola/);
  assert.match(md, /Events:\*\* 1 rendered of 2/);
  assert.match(md, /Excluded:\*\* 1 style/);
});

test('collapses consecutive identical lines when dedupe is enabled', () => {
  const repeated: AssScript = {
    info: {},
    styles: [],
    events: [
      { type: 'Dialogue', layer: '0', start: '0:00:01.00', end: '0:00:01.04', style: 'TITL', name: '', text: "ADAM's", fields: {} },
      { type: 'Dialogue', layer: '0', start: '0:00:01.04', end: '0:00:01.08', style: 'TITL', name: '', text: "ADAM's", fields: {} },
      { type: 'Dialogue', layer: '0', start: '0:00:01.08', end: '0:00:01.12', style: 'TITL', name: '', text: "ADAM's", fields: {} },
    ],
  };

  const md = renderMarkdown(repeated, { sourceName: 'x.ass', dedupe: true });
  assert.match(md, /Events:\*\* 1 rendered of 3/);
  assert.match(md, /Deduped:\*\* 2/);
  assert.equal(md.match(/ADAM's/g)?.length, 1);
});
