import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderIndex } from '../src/index-doc';

test('renders a sorted index with totals and per-file rows', () => {
  const md = renderIndex(
    [
      { outputName: 'b.md', title: 'Bee', rendered: 3, total: 5 },
      { outputName: 'a.md', title: 'Aye', rendered: 2, total: 2 },
    ],
    { note: 'ass2md --dedupe' },
  );

  assert.match(md, /^# Markdown Corpus Index/);
  assert.match(md, /Files:\*\* 2/);
  assert.match(md, /Dialogue lines:\*\* 5/);
  assert.match(md, /Generated with:\*\* ass2md --dedupe/);
  assert.match(md, /\| `a\.md` \| Aye \| 2 \|/);
  assert.match(md, /\| `b\.md` \| Bee \| 3 \|/);

  const a = md.indexOf('`a.md`');
  const b = md.indexOf('`b.md`');
  assert.ok(a !== -1 && b !== -1 && a < b, 'rows are sorted by file name');
});

test('escapes pipes so the table stays valid', () => {
  const md = renderIndex([{ outputName: 'x.md', title: 'A | B', rendered: 1, total: 1 }]);
  assert.match(md, /A \\\| B/);
  assert.doesNotMatch(md, /Generated with/);
});
