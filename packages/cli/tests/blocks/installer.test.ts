import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import { installBlock, uninstallBlock } from '../../src/blocks/installer.js';
import type { BlockDefinition } from '../../src/blocks/registry.js';

const VALID_CONFIG = `version: "0.1"
project:
  name: "test-project"
tools:
  - claude
mode: copy
blocks: []
`;

function makeBlock(overrides: Partial<BlockDefinition> = {}): BlockDefinition {
  return {
    id: 'test-block',
    name: 'Test Block',
    description: 'A test block',
    version: '1.0.0',
    rules: [
      { id: 'rule-a', scope: 'conventions', severity: 'error', content: 'Rule A.' },
      { id: 'rule-b', scope: 'security', severity: 'warning', content: 'Rule B.' },
    ],
    ...overrides,
  };
}

describe('installer', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'devw-installer-'));
    await mkdir(join(tmpDir, '.dwf', 'rules'), { recursive: true });
    await writeFile(join(tmpDir, '.dwf', 'config.yml'), VALID_CONFIG);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('installBlock', () => {
    it('creates scope files and adds rules', async () => {
      const block = makeBlock();
      const count = await installBlock(tmpDir, block);

      assert.equal(count, 2);

      const convRaw = await readFile(join(tmpDir, '.dwf', 'rules', 'conventions.yml'), 'utf-8');
      const convDoc = parse(convRaw) as Record<string, unknown>;
      const convRules = convDoc['rules'] as Array<Record<string, unknown>>;

      assert.equal(convRules.length, 1);
      assert.equal(convRules[0]?.['id'], 'rule-a');
      assert.equal(convRules[0]?.['sourceBlock'], 'test-block');

      const secRaw = await readFile(join(tmpDir, '.dwf', 'rules', 'security.yml'), 'utf-8');
      const secDoc = parse(secRaw) as Record<string, unknown>;
      const secRules = secDoc['rules'] as Array<Record<string, unknown>>;

      assert.equal(secRules.length, 1);
      assert.equal(secRules[0]?.['id'], 'rule-b');
    });

    it('appends to existing scope files without duplicating', async () => {
      const existingContent = `scope: conventions
rules:
  - id: existing-rule
    severity: error
    content: Existing rule.
`;
      await writeFile(join(tmpDir, '.dwf', 'rules', 'conventions.yml'), existingContent);

      const block = makeBlock({
        rules: [{ id: 'new-rule', scope: 'conventions', severity: 'warning', content: 'New rule.' }],
      });
      await installBlock(tmpDir, block);

      const raw = await readFile(join(tmpDir, '.dwf', 'rules', 'conventions.yml'), 'utf-8');
      const doc = parse(raw) as Record<string, unknown>;
      const rules = doc['rules'] as Array<Record<string, unknown>>;

      assert.equal(rules.length, 2);
      assert.equal(rules[0]?.['id'], 'existing-rule');
      assert.equal(rules[1]?.['id'], 'new-rule');
    });

    it('replaces existing block rules on re-add', async () => {
      const block = makeBlock({
        rules: [{ id: 'rule-a', scope: 'conventions', severity: 'error', content: 'Original.' }],
      });
      await installBlock(tmpDir, block);

      const updatedBlock = makeBlock({
        rules: [{ id: 'rule-a', scope: 'conventions', severity: 'error', content: 'Updated.' }],
      });
      await installBlock(tmpDir, updatedBlock);

      const raw = await readFile(join(tmpDir, '.dwf', 'rules', 'conventions.yml'), 'utf-8');
      const doc = parse(raw) as Record<string, unknown>;
      const rules = doc['rules'] as Array<Record<string, unknown>>;

      assert.equal(rules.length, 1);
      assert.equal(rules[0]?.['content'], 'Updated.');
    });

    it('adds block ID to config.yml blocks array', async () => {
      const block = makeBlock();
      await installBlock(tmpDir, block);

      const raw = await readFile(join(tmpDir, '.dwf', 'config.yml'), 'utf-8');
      const doc = parse(raw) as Record<string, unknown>;
      const blocks = doc['blocks'] as string[];

      assert.ok(blocks.includes('test-block'));
    });

    it('does not duplicate block ID in config on re-add', async () => {
      const block = makeBlock();
      await installBlock(tmpDir, block);
      await installBlock(tmpDir, block);

      const raw = await readFile(join(tmpDir, '.dwf', 'config.yml'), 'utf-8');
      const doc = parse(raw) as Record<string, unknown>;
      const blocks = doc['blocks'] as string[];

      assert.equal(blocks.filter((b) => b === 'test-block').length, 1);
    });
  });

  describe('uninstallBlock', () => {
    it('removes rules with matching sourceBlock', async () => {
      const block = makeBlock({
        rules: [{ id: 'rule-a', scope: 'conventions', severity: 'error', content: 'Block rule.' }],
      });
      await installBlock(tmpDir, block);

      const removed = await uninstallBlock(tmpDir, 'test-block');
      assert.equal(removed, 1);

      const raw = await readFile(join(tmpDir, '.dwf', 'rules', 'conventions.yml'), 'utf-8');
      const doc = parse(raw) as Record<string, unknown>;
      const rules = doc['rules'] as Array<Record<string, unknown>>;

      assert.equal(rules.length, 0);
    });

    it('preserves rules from other blocks', async () => {
      const blockA = makeBlock({
        id: 'block-a',
        rules: [{ id: 'rule-a', scope: 'conventions', severity: 'error', content: 'From A.' }],
      });
      const blockB = makeBlock({
        id: 'block-b',
        rules: [{ id: 'rule-b', scope: 'conventions', severity: 'error', content: 'From B.' }],
      });
      await installBlock(tmpDir, blockA);
      await installBlock(tmpDir, blockB);

      await uninstallBlock(tmpDir, 'block-a');

      const raw = await readFile(join(tmpDir, '.dwf', 'rules', 'conventions.yml'), 'utf-8');
      const doc = parse(raw) as Record<string, unknown>;
      const rules = doc['rules'] as Array<Record<string, unknown>>;

      assert.equal(rules.length, 1);
      assert.equal(rules[0]?.['id'], 'rule-b');
    });

    it('removes block ID from config.yml', async () => {
      const block = makeBlock();
      await installBlock(tmpDir, block);
      await uninstallBlock(tmpDir, 'test-block');

      const raw = await readFile(join(tmpDir, '.dwf', 'config.yml'), 'utf-8');
      const doc = parse(raw) as Record<string, unknown>;
      const blocks = doc['blocks'] as string[];

      assert.ok(!blocks.includes('test-block'));
    });

    it('returns 0 when no rules match', async () => {
      const removed = await uninstallBlock(tmpDir, 'nonexistent');
      assert.equal(removed, 0);
    });
  });
});
