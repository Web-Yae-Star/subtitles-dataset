import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseAss } from '../src/ass';

const SAMPLE = `\uFEFF[Script Info]
; a comment line
Title: Sample Episode
ScriptType: v4.00+

[Aegisub Project Garbage]
Audio File: x.mkv

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour
Style: Default,Arial,65,&H00FFFFFF
Style: Signs,Gilroy,27,&H3CFFFFFF

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:07.49,0:00:09.36,Default,,0,0,0,,Ya es suficiente.
Comment: 0,0:00:01.00,0:00:02.00,Signs,Dark,0,0,0,,{\\pos(10,10)}ADAM's
Dialogue: 0,0:00:26.57,0:00:28.65,Default,Juan,0,0,0,,y no es muy exigente, con las\\Npersonas.
`;

test('parseAss reads Script Info, styles and events', () => {
  const script = parseAss(SAMPLE);

  assert.equal(script.info.Title, 'Sample Episode');
  assert.equal(script.info['Audio File'], undefined, 'garbage sections are ignored');
  assert.deepEqual(script.styles.map((style) => style.name), ['Default', 'Signs']);
  assert.equal(script.events.length, 3);
  assert.equal(script.events[0].type, 'Dialogue');
  assert.equal(script.events[1].type, 'Comment');
});

test('parseAss keeps commas and line breaks inside the Text field', () => {
  const script = parseAss(SAMPLE);

  assert.equal(script.events[2].text, 'y no es muy exigente, con las\\Npersonas.');
  assert.equal(script.events[2].name, 'Juan');
  assert.equal(script.events[2].style, 'Default');
  assert.equal(script.events[2].start, '0:00:26.57');
  assert.equal(script.events[2].end, '0:00:28.65');
});

test('parseAss falls back to the default event format when none is declared', () => {
  const script = parseAss('[Events]\nDialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,Hola\n');
  assert.equal(script.events[0].text, 'Hola');
  assert.equal(script.events[0].style, 'Default');
});
