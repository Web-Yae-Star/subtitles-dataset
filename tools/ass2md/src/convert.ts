import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { parseAss } from './ass';
import { renderDocument, type RenderOptions } from './render';

/** Directories never descended into while scanning for the corpus. */
export const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'tools', 'md', '.github', '.vscode']);

export interface ConvertedFile {
  markdown: string;
  outputName: string;
  title: string;
  rendered: number;
  total: number;
}

export async function convertFile(inputPath: string, options: RenderOptions = {}): Promise<ConvertedFile> {
  const content = await readFile(inputPath, 'utf8');
  const script = parseAss(content);
  const sourceName = path.basename(inputPath);
  const document = renderDocument(script, { ...options, sourceName });

  return {
    markdown: document.markdown,
    outputName: sourceName.replace(/\.ass$/i, '.md'),
    title: document.title,
    rendered: document.rendered,
    total: document.total,
  };
}

/** Recursively collect `.ass` files, skipping tooling/output directories. */
export async function findAssFiles(root: string, ignored: Set<string> = IGNORED_DIRS): Promise<string[]> {
  const files: string[] = [];
  await walk(path.resolve(root), ignored, files);
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

async function walk(dir: string, ignored: Set<string>, files: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (ignored.has(entry.name)) continue;
      await walk(fullPath, ignored, files);
      continue;
    }

    if (entry.isFile() && !entry.name.startsWith('.') && entry.name.toLowerCase().endsWith('.ass')) {
      files.push(fullPath);
    }
  }
}
