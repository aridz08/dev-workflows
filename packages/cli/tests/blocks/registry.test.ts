import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadAllBlocks, loadBlock, blockRulesToRules } from '../../src/blocks/registry.js';

const SAMPLE_BLOCK = `id: test-block
name: "Test Block"
description: "A test block"
version: "1.0.0"

rules:
  - id: test-rule-a
    scope: conventions
    severity: error
    content: |
      Rule A content.

  - id: test-rule-b
    scope: security
    severity: warning
    content: |
      Rule B content.
`;

const ANOTHER_BLOCK = `id: another-block
name: "Another Block"
description: "Another test block"
version: "0.2.0"

rules:
  - id: another-rule
    scope: testing
    severity: info
    content: Some content.
`;

describe('registry', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'devw-registry-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('loadAllBlocks', () => {
    it('loads all block files from a directory', async () => {
      await writeFile(join(tmpDir, 'test-block.yml'), SAMPLE_BLOCK);
      await writeFile(join(tmpDir, 'another-block.yml'), ANOTHER_BLOCK);

      const blocks = await loadAllBlocks(tmpDir);
      assert.equal(blocks.length, 2);

      const ids = blocks.map((b) => b.id).sort();
      assert.deepEqual(ids, ['another-block', 'test-block']);
    });

    it('returns empty array for missing directory', async () => {
      const blocks = await loadAllBlocks(join(tmpDir, 'nonexistent'));
      assert.equal(blocks.length, 0);
    });

    it('skips invalid YAML files', async () => {
      await writeFile(join(tmpDir, 'good.yml'), SAMPLE_BLOCK);
      await writeFile(join(tmpDir, 'bad.yml'), ':\n invalid: [broken');

      const blocks = await loadAllBlocks(tmpDir);
      assert.equal(blocks.length, 1);
      assert.equal(blocks[0]?.id, 'test-block');
    });

    it('parses block metadata correctly', async () => {
      await writeFile(join(tmpDir, 'test.yml'), SAMPLE_BLOCK);

      const blocks = await loadAllBlocks(tmpDir);
      const block = blocks[0]!;

      assert.equal(block.id, 'test-block');
      assert.equal(block.name, 'Test Block');
      assert.equal(block.description, 'A test block');
      assert.equal(block.version, '1.0.0');
      assert.equal(block.rules.length, 2);
    });

    it('parses block rules with correct fields', async () => {
      await writeFile(join(tmpDir, 'test.yml'), SAMPLE_BLOCK);

      const blocks = await loadAllBlocks(tmpDir);
      const rule = blocks[0]!.rules[0]!;

      assert.equal(rule.id, 'test-rule-a');
      assert.equal(rule.scope, 'conventions');
      assert.equal(rule.severity, 'error');
      assert.ok(rule.content.includes('Rule A'));
    });
  });

  describe('loadBlock', () => {
    it('loads a specific block by ID', async () => {
      await writeFile(join(tmpDir, 'test-block.yml'), SAMPLE_BLOCK);
      await writeFile(join(tmpDir, 'another-block.yml'), ANOTHER_BLOCK);

      const block = await loadBlock('test-block', tmpDir);
      assert.ok(block);
      assert.equal(block.id, 'test-block');
    });

    it('returns null for non-existent block', async () => {
      await writeFile(join(tmpDir, 'test-block.yml'), SAMPLE_BLOCK);

      const block = await loadBlock('nonexistent', tmpDir);
      assert.equal(block, null);
    });
  });

  describe('blockRulesToRules', () => {
    it('converts block rules to Rule objects with sourceBlock', async () => {
      await writeFile(join(tmpDir, 'test.yml'), SAMPLE_BLOCK);

      const blocks = await loadAllBlocks(tmpDir);
      const block = blocks[0]!;
      const rules = blockRulesToRules(block);

      assert.equal(rules.length, 2);
      assert.equal(rules[0]?.sourceBlock, 'test-block');
      assert.equal(rules[0]?.enabled, true);
      assert.equal(rules[0]?.id, 'test-rule-a');
    });
  });
});
