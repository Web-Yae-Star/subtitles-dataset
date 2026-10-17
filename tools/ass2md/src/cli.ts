#!/usr/bin/env node
import fs from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { convertFile, findAssFiles } from './convert';
import { renderIndex, type CorpusEntry } from './index-doc';
import { createLogger, isLogLevel } from './logger';

interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(args: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }

    const eq = arg.indexOf('=');
    if (eq !== -1) {
      flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }

    const key = arg.slice(2);
    const next = args[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }

  return { positional, flags };
}

const hasFlag = (flags: ParsedArgs['flags'], key: string): boolean =>
  flags[key] === true || flags[key] === 'true';
const stringFlag = (flags: ParsedArgs['flags'], key: string): string | undefined =>
  typeof flags[key] === 'string' ? flags[key] : undefined;
const listFlag = (flags: ParsedArgs['flags'], key: string): string[] =>
  (stringFlag(flags, key) ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');

function findUp(startDir: string, marker: string): string | undefined {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, marker))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

async function isUpToDate(input: string, output: string): Promise<boolean> {
  try {
    const [source, target] = await Promise.all([stat(input), stat(output)]);
    return target.mtimeMs >= source.mtimeMs;
  } catch {
    return false;
  }
}

function printHelp(): void {
  console.log(`ass2md - convert the .ass subtitle corpus into agent-friendly Markdown

Usage:
  ass2md [files...] [options]

Options:
  --out <dir>           Output directory (default: <repo>/md).
  --dir <dir>           Source root to scan when no files are given (default: repo root).
  --include-comments    Also render Comment: (typesetting/karaoke) events.
  --include-drawings    Also render vector drawing events (\\p1 paths).
  --skip-styles <list>  Comma-separated style names to drop (e.g. "Signs,TITL").
  --dedupe              Collapse runs of consecutive identical lines.
  --no-timestamps       Drop the "Start -> End" ticks, keep only speaker + text.
  --index               Also write INDEX.md describing the generated corpus.
  --force               Rewrite outputs even when they are up to date.
  --dry-run             Print what would be written without writing anything.
  --help                Show this message.

Defaults: only Dialogue: events, timestamps on, drawings and comments skipped,
output skipped when up to date.
The original .ass files are never modified.
`);
}

async function main(): Promise<void> {
  const { positional, flags } = parseArgs(process.argv.slice(2));

  const logLevel = process.env.LOG_LEVEL;
  const logger = createLogger(isLogLevel(logLevel) ? logLevel : 'info');

  if (hasFlag(flags, 'help') || positional[0] === 'help') {
    printHelp();
    return;
  }

  const repoRoot = findUp(__dirname, '.git') ?? process.cwd();
  const outDir = path.resolve(stringFlag(flags, 'out') ?? path.join(repoRoot, 'md'));
  const sourceRoot = stringFlag(flags, 'dir') ?? repoRoot;
  const force = hasFlag(flags, 'force');
  const dryRun = hasFlag(flags, 'dry-run');

  const renderOptions = {
    timestamps: !hasFlag(flags, 'no-timestamps'),
    includeComments: hasFlag(flags, 'include-comments'),
    includeDrawings: hasFlag(flags, 'include-drawings'),
    skipStyles: listFlag(flags, 'skip-styles'),
    dedupe: hasFlag(flags, 'dedupe'),
  };

  const inputs = positional.length > 0 ? positional.map((file) => path.resolve(file)) : await findAssFiles(sourceRoot);

  if (inputs.length === 0) {
    logger.warn(`no .ass files found under ${sourceRoot}`);
    return;
  }

  if (!dryRun) await mkdir(outDir, { recursive: true });

  let written = 0;
  let skipped = 0;
  let failed = 0;
  const entries: CorpusEntry[] = [];

  for (const input of inputs) {
    try {
      const converted = await convertFile(input, renderOptions);
      const outputPath = path.join(outDir, converted.outputName);

      entries.push({
        outputName: converted.outputName,
        title: converted.title,
        rendered: converted.rendered,
        total: converted.total,
      });

      if (!dryRun && !force && (await isUpToDate(input, outputPath))) {
        skipped += 1;
        continue;
      }

      if (dryRun) {
        console.log(`would write ${path.relative(repoRoot, outputPath)}`);
        continue;
      }

      await writeFile(outputPath, converted.markdown, 'utf8');
      written += 1;
      logger.debug(`wrote ${path.relative(repoRoot, outputPath)}`);
    } catch (error) {
      failed += 1;
      logger.error(`failed: ${input}`, error);
    }
  }

  if (hasFlag(flags, 'index') && !dryRun && entries.length > 0) {
    const indexPath = path.join(outDir, 'INDEX.md');
    await writeFile(indexPath, renderIndex(entries, { note: describeInvocation(renderOptions) }), 'utf8');
    logger.debug(`wrote ${path.relative(repoRoot, indexPath)}`);
  }

  logger.info(`ass2md: ${written} written, ${skipped} up-to-date, ${failed} failed -> ${outDir}`);
  if (failed > 0) process.exitCode = 1;
}

type RenderFlags = {
  timestamps: boolean;
  includeComments: boolean;
  includeDrawings: boolean;
  skipStyles: string[];
  dedupe: boolean;
};

function describeInvocation(options: RenderFlags): string {
  const flags: string[] = [];
  if (options.dedupe) flags.push('--dedupe');
  if (options.skipStyles.length > 0) flags.push(`--skip-styles "${options.skipStyles.join(',')}"`);
  if (options.includeComments) flags.push('--include-comments');
  if (options.includeDrawings) flags.push('--include-drawings');
  if (!options.timestamps) flags.push('--no-timestamps');

  return `ass2md${flags.length > 0 ? ` ${flags.join(' ')}` : ''}`;
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(`[error] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
