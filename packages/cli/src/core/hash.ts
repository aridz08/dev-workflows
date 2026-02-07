import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { Rule } from '../bridges/types.js';

const HASH_FILE = '.dwf/.cache/rules.hash';

export function computeRulesHash(rules: Rule[]): string {
  const sorted = [...rules].sort((a, b) => a.id.localeCompare(b.id));
  const payload = sorted.map((r) =>
    `${r.id}|${r.scope}|${r.severity}|${r.content}|${String(r.enabled)}`
  ).join('\n');
  return createHash('sha256').update(payload).digest('hex');
}

export async function readStoredHash(cwd: string): Promise<string | null> {
  try {
    const content = await readFile(join(cwd, HASH_FILE), 'utf-8');
    return content.trim();
  } catch {
    return null;
  }
}

export async function writeHash(cwd: string, hash: string): Promise<void> {
  const filePath = join(cwd, HASH_FILE);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, hash, 'utf-8');
}
