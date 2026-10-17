import path from 'node:path';

import type { AssEvent, AssScript } from './ass';
import { cleanText, isDrawing } from './clean';

export interface RenderOptions {
  /** Source file name, used for the title fallback and the metadata header. */
  sourceName?: string;
  /** Include `Start → End` ticks next to the speaker. Default: true. */
  timestamps?: boolean;
  /** Include `Comment:` (typesetting/karaoke) events. Default: false. */
  includeComments?: boolean;
  /** Include vector drawing events (`\p1` paths). Default: false. */
  includeDrawings?: boolean;
  /** Style names to drop, case-insensitive (e.g. sign/credit styles). */
  skipStyles?: string[];
  /** Collapse runs of consecutive identical lines. Default: false. */
  dedupe?: boolean;
}

const GENERIC_TITLES = new Set(['', 'subtitles', 'untitled', 'title', 'default', 'sample', 'script']);

/** Script Info keys worth surfacing for a translation corpus. */
const INFO_WHITELIST = [
  'Original Script',
  'Original Translation',
  'Original Editing',
  'Original Timing',
  'Script Updated By',
];

export interface RenderResult {
  /** Resolved document title. */
  title: string;
  /** Full Markdown document. */
  markdown: string;
  /** Number of events that produced a line of text. */
  rendered: number;
  /** Total number of events in the script. */
  total: number;
}

export function renderDocument(script: AssScript, options: RenderOptions = {}): RenderResult {
  const {
    timestamps = true,
    includeComments = false,
    includeDrawings = false,
    skipStyles = [],
    dedupe = false,
    sourceName = '',
  } = options;

  const file = sourceName || 'subtitle.ass';
  const events = script.events;
  const skip = new Set(skipStyles.map((style) => style.trim().toLowerCase()).filter((style) => style !== ''));

  const typeKept = (event: AssEvent): boolean => includeComments || event.type === 'Dialogue';
  const drawingKept = (event: AssEvent): boolean => includeDrawings || !isDrawing(event.text);
  const styleKept = (event: AssEvent): boolean => !skip.has(event.style.trim().toLowerCase());

  const blocks: string[] = [];
  const meta: string[] = [];
  let renderedCount = 0;
  let deduped = 0;
  let previousText: string | undefined;

  for (const event of events) {
    if (!typeKept(event) || !drawingKept(event) || !styleKept(event)) continue;

    const text = cleanText(event.text);
    if (text === '') continue;
    if (dedupe && text === previousText) {
      deduped += 1;
      continue;
    }

    previousText = text;
    renderedCount += 1;
    blocks.push(`${formatLabel(event, timestamps)}\n${text}`, '');
  }

  const excluded: string[] = [];
  if (!includeComments) pushCount(excluded, 'comment', events.filter((event) => event.type === 'Comment').length);
  if (!includeDrawings) {
    pushCount(excluded, 'drawing', events.filter((event) => isDrawing(event.text) && typeKept(event)).length);
  }
  if (skip.size > 0) {
    pushCount(
      excluded,
      'style',
      events.filter((event) => typeKept(event) && drawingKept(event) && !styleKept(event)).length,
    );
  }

  meta.push(`- **File:** \`${file}\``, `- **Events:** ${renderedCount} rendered of ${events.length}`);
  if (excluded.length > 0) meta.push(`- **Excluded:** ${excluded.join(' · ')}`);
  if (deduped > 0) meta.push(`- **Deduped:** ${deduped}`);
  if (script.styles.length > 0) meta.push(`- **Styles:** ${script.styles.map((style) => style.name).join(', ')}`);
  for (const key of INFO_WHITELIST) {
    const value = script.info[key];
    if (value) meta.push(`- **${key}:** ${value}`);
  }

  const title = resolveTitle(script, file);
  const lines = [`# ${title}`, '', ...meta, '', '---', '', ...blocks];

  return {
    title,
    markdown: `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`,
    rendered: renderedCount,
    total: events.length,
  };
}

/** Convenience wrapper that returns only the Markdown document. */
export function renderMarkdown(script: AssScript, options: RenderOptions = {}): string {
  return renderDocument(script, options).markdown;
}

function pushCount(target: string[], label: string, count: number): void {
  if (count > 0) target.push(`${count} ${label}`);
}

function formatLabel(event: AssEvent, timestamps: boolean): string {
  const speaker = event.name.trim() || event.style.trim() || 'Dialogue';
  if (!timestamps) return `**${speaker}**`;
  return `**${speaker}** \`${normalizeTime(event.start)} → ${normalizeTime(event.end)}\``;
}

/** `0:00:07.49` → `00:00:07.49` (tolerates `:` as the centisecond separator). */
function normalizeTime(value: string): string {
  const match = /^(\d+):(\d{1,2}):(\d{1,2})[.:](\d{1,3})$/.exec(value.trim());
  if (!match) return value.trim();

  const [, hours, minutes, seconds, centis] = match;
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.${centis
    .padEnd(2, '0')
    .slice(0, 2)}`;
}

function resolveTitle(script: AssScript, file: string): string {
  const title = (script.info.Title ?? '').trim();
  if (title !== '' && !GENERIC_TITLES.has(title.toLowerCase())) return title;
  return path.basename(file).replace(/\.ass$/i, '');
}
