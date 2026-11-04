import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateBackupJson } from '../src/services/backupService.js';

describe('Backup & Restore Service Tests', () => {
  test('validateBackupJson accepts valid JSON backup schema', () => {
    const validPayload = JSON.stringify({
      app: 'MemoryJar',
      version: 1,
      exportedAt: new Date().toISOString(),
      memoryCount: 2,
      memories: [
        {
          id: 'mem-1',
          description: 'Sunset at the beach with friends',
          date: '2026-06-15',
          chitColor: '#FFB3C6',
          colorId: 'pink',
          photo: null,
          createdAt: 1718400000000,
        },
        {
          id: 'mem-2',
          description: 'Baked warm sourdough bread',
          date: '2026-07-20',
          chitColor: '#FFE5B4',
          colorId: 'peach',
          photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          createdAt: 1721400000000,
        },
      ],
    });

    const result = validateBackupJson(validPayload);
    assert.equal(result.valid, true);
    assert.ok(result.payload);
    assert.equal(result.payload.app, 'MemoryJar');
    assert.equal(result.payload.memoryCount, 2);
    assert.equal(result.payload.memories.length, 2);
    assert.equal(result.payload.memories[0].id, 'mem-1');
  });

  test('validateBackupJson handles valid backup with empty memories array', () => {
    const emptyPayload = JSON.stringify({
      app: 'MemoryJar',
      version: 1,
      exportedAt: new Date().toISOString(),
      memoryCount: 0,
      memories: [],
    });

    const result = validateBackupJson(emptyPayload);
    assert.equal(result.valid, true);
    assert.equal(result.payload.memoryCount, 0);
    assert.deepEqual(result.payload.memories, []);
  });

  test('validateBackupJson rejects malformed non-JSON strings', () => {
    const invalidJson = 'Not valid json at all {[]';
    const result = validateBackupJson(invalidJson);
    assert.equal(result.valid, false);
    assert.match(result.error, /valid \.json file/i);
  });

  test('validateBackupJson rejects null or primitive JSON values', () => {
    assert.equal(validateBackupJson('null').valid, false);
    assert.equal(validateBackupJson('"just a string"').valid, false);
    assert.equal(validateBackupJson('42').valid, false);
  });

  test('validateBackupJson rejects payloads missing memories array', () => {
    const missingMemories = JSON.stringify({
      app: 'MemoryJar',
      version: 1,
      data: 'invalid schema',
    });

    const result = validateBackupJson(missingMemories);
    assert.equal(result.valid, false);
    assert.match(result.error, /No memory records found/i);
  });

  test('validateBackupJson rejects payloads with unrecognizable items', () => {
    const garbageItems = JSON.stringify({
      app: 'MemoryJar',
      version: 1,
      memories: [
        { foo: 'bar' },
        { baz: 123 },
      ],
    });

    const result = validateBackupJson(garbageItems);
    assert.equal(result.valid, false);
    assert.match(result.error, /unrecognizable memory formats/i);
  });
});

