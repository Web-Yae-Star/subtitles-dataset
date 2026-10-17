import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { convertFile, findAssFiles } from '../src/convert';

const ASS = `[Script Info]
Title: Demo

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,Hola mundo
`;

test('findAssFiles walks the tree and skips ignored directories', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ass2md-'));
  try {
    await writeFile(path.join(root, 'a.ass'), ASS);
    await writeFile(path.join(root, 'index.txt'), 'x');
    await mkdir(path.join(root, 'tools'));
    await writeFile(path.join(root, 'tools', 'c.ass'), ASS);
    await mkdir(path.join(root, 'md'));
    await writeFile(path.join(root, 'md', 'd.ass'), ASS);

    const files = await findAssFiles(root);
    assert.deepEqual(files.map((file) => path.basename(file)), ['a.ass']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('convertFile returns markdown plus the derived output name', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ass2md-'));
  try {
    const input = path.join(root, 'ANI][Demo_01.ass');
    await writeFile(input, ASS);

    const { markdown, outputName } = await convertFile(input);
    assert.equal(outputName, 'ANI][Demo_01.md');
    assert.match(markdown, /^# Demo/);
    assert.match(markdown, /Hola mundo/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
