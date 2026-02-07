import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type { BlockDefinition } from './registry.js';

interface RawRuleEntry {
  id: string;
  severity?: string;
  content: string;
  tags?: string[];
  enabled?: boolean;
  sourceBlock?: string;
}

interface RawRuleFile {
  scope: string;
  rules: RawRuleEntry[];
}

async function readRuleFile(filePath: string): Promise<RawRuleFile | null> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    const parsed: unknown = parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const doc = parsed as Record<string, unknown>;
    return {
      scope: typeof doc['scope'] === 'string' ? doc['scope'] : '',
      rules: Array.isArray(doc['rules']) ? (doc['rules'] as RawRuleEntry[]) : [],
    };
  } catch {
    return null;
  }
}

function writeRuleFile(doc: RawRuleFile): string {
  return stringify(doc, { lineWidth: 0 });
}

export async function installBlock(cwd: string, block: BlockDefinition): Promise<number> {
  const rulesDir = join(cwd, '.dwf', 'rules');
  await mkdir(rulesDir, { recursive: true });

  // Group block rules by scope
  const byScope = new Map<string, BlockDefinition['rules']>();
  for (const rule of block.rules) {
    const existing = byScope.get(rule.scope);
    if (existing) {
      existing.push(rule);
    } else {
      byScope.set(rule.scope, [rule]);
    }
  }

  let rulesAdded = 0;

  for (const [scope, blockRules] of byScope) {
    const filePath = join(rulesDir, `${scope}.yml`);
    let doc = await readRuleFile(filePath);

    if (!doc) {
      doc = { scope, rules: [] };
    }

    // Remove any existing rules from this block to avoid duplicates on re-add
    doc.rules = doc.rules.filter((r) => r.sourceBlock !== block.id);

    // Append new rules
    for (const rule of blockRules) {
      doc.rules.push({
        id: rule.id,
        severity: rule.severity,
        content: rule.content,
        sourceBlock: block.id,
      });
      rulesAdded++;
    }

    await writeFile(filePath, writeRuleFile(doc), 'utf-8');
  }

  // Update config.yml blocks array
  await addBlockToConfig(cwd, block.id);

  return rulesAdded;
}

export async function uninstallBlock(cwd: string, blockId: string): Promise<number> {
  const rulesDir = join(cwd, '.dwf', 'rules');
  let entries: string[];
  try {
    const { readdir } = await import('node:fs/promises');
    entries = await readdir(rulesDir);
  } catch {
    return 0;
  }

  const ymlFiles = entries.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  let rulesRemoved = 0;

  for (const file of ymlFiles) {
    const filePath = join(rulesDir, file);
    const doc = await readRuleFile(filePath);
    if (!doc) continue;

    const before = doc.rules.length;
    doc.rules = doc.rules.filter((r) => r.sourceBlock !== blockId);
    const removed = before - doc.rules.length;

    if (removed > 0) {
      rulesRemoved += removed;
      await writeFile(filePath, writeRuleFile(doc), 'utf-8');
    }
  }

  // Update config.yml blocks array
  await removeBlockFromConfig(cwd, blockId);

  return rulesRemoved;
}

async function readRawConfig(cwd: string): Promise<Record<string, unknown>> {
  const configPath = join(cwd, '.dwf', 'config.yml');
  const raw = await readFile(configPath, 'utf-8');
  const parsed: unknown = parse(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid config.yml');
  }
  return parsed as Record<string, unknown>;
}

async function writeRawConfig(cwd: string, doc: Record<string, unknown>): Promise<void> {
  const configPath = join(cwd, '.dwf', 'config.yml');
  await writeFile(configPath, stringify(doc, { lineWidth: 0 }), 'utf-8');
}

async function addBlockToConfig(cwd: string, blockId: string): Promise<void> {
  const doc = await readRawConfig(cwd);
  const blocks = Array.isArray(doc['blocks']) ? (doc['blocks'] as string[]) : [];

  if (!blocks.includes(blockId)) {
    blocks.push(blockId);
  }
  doc['blocks'] = blocks;

  await writeRawConfig(cwd, doc);
}

async function removeBlockFromConfig(cwd: string, blockId: string): Promise<void> {
  const doc = await readRawConfig(cwd);
  const blocks = Array.isArray(doc['blocks']) ? (doc['blocks'] as string[]) : [];

  doc['blocks'] = blocks.filter((b) => b !== blockId);

  await writeRawConfig(cwd, doc);
}
