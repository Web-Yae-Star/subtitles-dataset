# ass2md

Convert the `.ass` subtitle corpus of this repository into clean, agent-friendly
**Markdown**. The generated files live in [`../../md/`](../../md/) and are meant to be
read by AI agents as a vocabulary and translation-style reference.

The original `.ass` files are the single source of truth and are **never modified** —
this tool only reads them.

---

## Why

`.ass` files are optimized for playback, not for reading. A single dialogue line can be
wrapped in override tags (`{\pos(...)}`, `{\fscy100}`, `{=410}`), split with `\N`/`\h`
escapes, buried under `Comment:` typesetting events, or replaced entirely by `\p1` vector
drawings. `ass2md` strips all of that down to the plain Spanish text while keeping the
useful context (episode title, speaker, timestamps, translation credits).

---

## Usage

```bash
cd tools/ass2md
pnpm install

# Regenerate the committed corpus exactly as it lives in ../../md
pnpm run md

# Generic conversion (every CLI flag is forwarded)
pnpm run dev
pnpm run dev --dedupe
pnpm run dev -- "../ANI][Meijyou_01_EXT.ass"
pnpm run dev --out ./out
```

Prefer the compiled entry point for repeat runs:

```bash
pnpm run build
node dist/src/cli.js --help
```

`pnpm run md` is shorthand for `--dedupe --index --force`, the recipe that produced the
`md/` folder committed to this repository.

### Flags

| Flag | Description |
| :--- | :--- |
| `--out <dir>` | Output directory (default: `<repo>/md`). |
| `--dir <dir>` | Source root to scan when no files are given (default: repo root). |
| `--include-comments` | Also render `Comment:` (typesetting/karaoke) events. |
| `--include-drawings` | Also render vector drawing events (`\p1` paths). |
| `--skip-styles <list>` | Comma-separated style names to drop, e.g. `"Signs,TITL"` (case-insensitive). |
| `--dedupe` | Collapse runs of consecutive identical lines. |
| `--no-timestamps` | Drop the `Start → End` ticks, keep only speaker + text. |
| `--index` | Also write `INDEX.md` describing the generated corpus. |
| `--force` | Rewrite outputs even when they are already up to date. |
| `--dry-run` | Print what would be written without writing anything. |
| `--help` | Show the built-in help. |

Positional arguments are treated as explicit input files; with none, the tool scans
`--dir` (default: the repository root) recursively for `*.ass`, skipping `tools/`, `md/`,
`node_modules/`, `.git/` and build output.

By default an output file is only skipped when it is already at least as new as its
source, so repeat runs are cheap. The check is based on modification time only, so after
changing any rendering flag use `--force` to rewrite the corpus (this is why `pnpm run md`
includes it).

---

## Output format

```markdown
# Adam's Sweet Agony - E02

- **File:** `ANI][Adam-kun_sub_02.ass`
- **Events:** 86 rendered of 4456
- **Excluded:** 88 comment · 576 drawing
- **Deduped:** 3705
- **Styles:** Dialogue, Italics, Show Title, ...

---

**Italics** `00:00:08.24 → 00:00:09.99`
Antes solía ser popular.

**Italics** `00:00:11.99 → 00:00:15.58`
Antes de la pandemia, coqueteaba todo lo que quería.
```

* **Title** — the script's `Title`, or the file name when it is generic (`subtitles`, …).
* **File / Events / Excluded / Deduped / Styles** — traceable provenance for each file.
* **Credits** — `Original Script`, `Original Translation`, `Original Editing`,
  `Original Timing`, `Script Updated By` are surfaced when present.
* **Speaker** — the event's `Name` field, falling back to the style name, then `Dialogue`.
* **Text** — tags removed, `\N` and `\n` become real line breaks, `\h` becomes a space.

### Corpus index

With `--index` the tool also writes `INDEX.md` in the output directory, giving an agent a
single entry point to navigate the corpus:

```markdown
# Markdown Corpus Index

- **Files:** 267
- **Dialogue lines:** 49127
- **Generated with:** ass2md --dedupe

| File | Title | Lines |
| :--- | :--- | ---: |
| `ANI][Adam-kun_sub_01.md` | Adam's Sweet Agony - E01 | 75 |
```

---

## How it works

| Module | Responsibility |
| :--- | :--- |
| `src/ass.ts` | Format-driven ASS parser (`[Script Info]`, `[V4+ Styles]`, `[Events]`). The `Text` column is allowed to contain commas. |
| `src/clean.ts` | `cleanText` strips override blocks and normalizes escapes; `isDrawing` detects `\p1` vector paths. |
| `src/render.ts` | Pure `renderDocument(script, options)` — filtering, metadata, transcript; `renderMarkdown` is the string-only wrapper. |
| `src/index-doc.ts` | Pure `renderIndex(entries)` — the `INDEX.md` table. |
| `src/convert.ts` | File I/O: `convertFile`, `findAssFiles` (recursive scan with ignored dirs). |
| `src/cli.ts` | Argument parsing, up-to-date skipping, dry-run and reporting. |

Only `parseAss`, `cleanText`/`isDrawing`, `renderDocument`/`renderMarkdown` and
`renderIndex` are pure; everything else is a thin shell around them.

---

## Tests

```bash
pnpm test        # tsc + node --test
pnpm typecheck   # tsc --noEmit
```

The suite covers the parser (including `Text` fields with commas), the cleaner
(override blocks, `\N`, `\h`), drawing detection, the renderer (timestamps, speaker
fallback, comment/drawing/style filtering, dedupe), the index renderer and the file
walker.
