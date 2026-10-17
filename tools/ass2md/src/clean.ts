const OVERRIDE_BLOCK = /\{[^{}]*\}/g;
const OVERRIDE_BLOCK_CONTENT = /\{([^{}]*)\}/g;
const DRAWING_FLAG = /\\p(\d+)/g;

export interface CleanOptions {
  /** Collapse runs of whitespace into single spaces (off by default). */
  collapseWhitespace?: boolean;
}

export function cleanText(raw: string, options: CleanOptions = {}): string {
  let text = raw
    .replace(OVERRIDE_BLOCK, '')
    .replace(/\\[Nn]/g, '\n')
    .replace(/\\h/g, ' ');

  if (options.collapseWhitespace) text = text.replace(/[ \t]{2,}/g, ' ');
  text = text.replace(/[ \t]+$/gm, '');

  return text.trim();
}

/**
 * Detect ASS drawing events. When the last `\p<N>` override tag has a value > 0
 * the event text is a vector path (`m ... b ... l ...`), not dialogue, so it must
 * not leak into a text corpus.
 */
export function isDrawing(raw: string): boolean {
  let flag: number | undefined;

  for (const block of raw.matchAll(OVERRIDE_BLOCK_CONTENT)) {
    for (const tag of block[1].matchAll(DRAWING_FLAG)) {
      flag = Number(tag[1]);
    }
  }

  return flag !== undefined && flag > 0;
}

