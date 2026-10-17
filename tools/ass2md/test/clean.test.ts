import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanText, isDrawing } from '../src/clean';

test('removes override / karaoke blocks', () => {
  assert.equal(cleanText('{\\pos(10,10)}Hola'), 'Hola');
  assert.equal(cleanText('{=410}{\\fscy100\\blur1.125}ADAM'), 'ADAM');
  assert.equal(cleanText('{\\fnFOT-ManyoGyosho Std E}SWEET'), 'SWEET');
});

test('converts line-break escapes to real newlines', () => {
  assert.equal(cleanText('una\\Ndos'), 'una\ndos');
  assert.equal(cleanText('una\\ndos'), 'una\ndos');
});

test('converts the non-breaking space escape', () => {
  assert.equal(cleanText('a\\hb'), 'a b');
});

test('keeps plain Spanish text intact, only trimming the edges', () => {
  assert.equal(cleanText('  Ya es suficiente.  '), 'Ya es suficiente.');
  assert.equal(cleanText('y no es exigente, con las'), 'y no es exigente, con las');
  assert.equal(cleanText('¡¿Por qué entras aquí sin permiso?!'), '¡¿Por qué entras aquí sin permiso?!');
});

test('detects drawing-mode events (\\p1 vector paths)', () => {
  assert.equal(isDrawing('{\\p1}m 6.875 82 b 7 79 7.375 76'), true);
  assert.equal(isDrawing('{\\pos(1,2)\\p1}m 1 2 l 3 4'), true);
  assert.equal(isDrawing('{\\p1}m 1 2{\\p0}Hola'), false);
  assert.equal(isDrawing('{\\pos(1,2)}Texto normal'), false);
  assert.equal(isDrawing('Sin tags'), false);
});
