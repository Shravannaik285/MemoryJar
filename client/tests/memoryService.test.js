import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeMemory,
  revokePhotoUrl,
  revokeAllPhotoUrls,
} from '../src/database/memoryService.js';

describe('Memory Normalization & Cache Service Tests', () => {
  test('normalizeMemory returns null for empty or null records', () => {
    assert.equal(normalizeMemory(null), null);
    assert.equal(normalizeMemory(undefined), null);
  });

  test('normalizeMemory populates aliases and defaults correctly', () => {
    const rawRecord = {
      id: 'test-mem-101',
      description: 'Watching stars by the lakeside campfire',
      date: '2026-08-12',
      chitColor: '#E6E6FA',
      colorId: 'lavender',
      photo: null,
      createdAt: 1723450000000,
    };

    const normalized = normalizeMemory(rawRecord);

    assert.equal(normalized.id, 'test-mem-101');
    assert.equal(normalized.text, 'Watching stars by the lakeside campfire');
    assert.equal(normalized.description, 'Watching stars by the lakeside campfire');
    assert.equal(normalized.date, '2026-08-12');
    assert.equal(normalized.chitColor, '#E6E6FA');
    assert.equal(normalized.color, '#E6E6FA');
    assert.equal(normalized.colorId, 'lavender');
    assert.equal(normalized.photo, null);
    assert.equal(normalized.photoUrl, null);
    assert.equal(normalized.createdAt, 1723450000000);
  });

  test('normalizeMemory preserves string photo URLs', () => {
    const rawRecord = {
      id: 'test-mem-102',
      description: 'First coffee in the new home',
      date: '2026-09-01',
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      chitColor: '#FFB3C6',
      createdAt: 1725150000000,
    };

    const normalized = normalizeMemory(rawRecord);
    assert.equal(normalized.photoUrl, 'data:image/jpeg;base64,/9j/4AAQSkZJRg...');
    assert.equal(normalized.photo, 'data:image/jpeg;base64,/9j/4AAQSkZJRg...');
  });

  test('normalizeMemory fallbacks to pink and empty text gracefully', () => {
    const sparseRecord = {
      id: 'test-mem-103',
    };

    const normalized = normalizeMemory(sparseRecord);
    assert.equal(normalized.id, 'test-mem-103');
    assert.equal(normalized.text, '');
    assert.equal(normalized.color, '#FFB3C6');
    assert.equal(normalized.colorId, 'pink');
  });

  test('revokePhotoUrl handles non-existent IDs without throwing', () => {
    assert.doesNotThrow(() => {
      revokePhotoUrl('non-existent-id-999');
    });
  });

  test('revokeAllPhotoUrls executes safely', () => {
    assert.doesNotThrow(() => {
      revokeAllPhotoUrls();
    });
  });
});

