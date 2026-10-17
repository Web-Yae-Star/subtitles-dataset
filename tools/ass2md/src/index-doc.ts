export interface CorpusEntry {
  /** Generated file name inside the output directory (e.g. `ANI][Foo_01.md`). */
  outputName: string;
  /** Resolved document title. */
  title: string;
  /** Dialogue lines emitted for this file. */
  rendered: number;
  /** Total events found in the source script. */
  total: number;
}

export interface IndexOptions {
  /** Description of the flags used, echoed in the header (e.g. `ass2md --dedupe`). */
  note?: string;
}

/** Build the `INDEX.md` table that lets an agent navigate the generated corpus. */
export function renderIndex(entries: CorpusEntry[], options: IndexOptions = {}): string {
  const files = [...entries].sort((a, b) => a.outputName.localeCompare(b.outputName));
  const lines = files.reduce((sum, entry) => sum + entry.rendered, 0);

  const out: string[] = ['# Markdown Corpus Index', '', `- **Files:** ${files.length}`, `- **Dialogue lines:** ${lines}`];
  if (options.note) out.push(`- **Generated with:** ${options.note}`);

  out.push(
    '',
    'Read-only Markdown mirror of the `.ass` corpus (dialogue only; drawings, comments and',
    'consecutive duplicates are excluded when those options are on). The `.ass` files remain',
    'the source of truth.',
    '',
    '| File | Title | Lines |',
    '| :--- | :--- | ---: |',
  );

  for (const entry of files) {
    out.push(`| \`${escapeCell(entry.outputName)}\` | ${escapeCell(entry.title)} | ${entry.rendered} |`);
  }

  return `${out.join('\n')}\n`;
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|');
}
