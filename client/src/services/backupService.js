import { db } from '../database/db.js';
import { blobToDataUrl, dataUrlToBlob, getAllMemories, clearAllMemories } from '../database/memoryService.js';

/**
 * Exports all memories and attached photos to a portable, downloadable JSON backup file.
 *
 * @param {Array<Object>} memoriesList - Optional memories array (otherwise fetches from DB)
 * @returns {Promise<Object>} Metadata of the export
 */
export async function exportMemoriesBackup(memoriesList = null) {
  try {
    const list = memoriesList || (await getAllMemories());

    // Convert all photo Blobs to Base64 Data URLs so JSON is completely self-contained
    const serializedMemories = await Promise.all(
      list.map(async (m) => {
        let photoDataUrl = null;

        if (m.photoBlob instanceof Blob) {
          photoDataUrl = await blobToDataUrl(m.photoBlob);
        } else if (m.photo instanceof Blob) {
          photoDataUrl = await blobToDataUrl(m.photo);
        } else if (typeof m.photo === 'string' && m.photo.startsWith('data:')) {
          photoDataUrl = m.photo;
        }

        return {
          id: m.id,
          description: m.description || m.text || '',
          date: m.date,
          chitColor: m.chitColor || m.color || '#FFB3C6',
          colorId: m.colorId || 'pink',
          photo: photoDataUrl,
          createdAt: m.createdAt || Date.now(),
          updatedAt: m.updatedAt || Date.now(),
        };
      })
    );

    const backupPayload = {
      app: 'MemoryJar',
      version: 1,
      exportedAt: new Date().toISOString(),
      memoryCount: serializedMemories.length,
      memories: serializedMemories,
    };

    // Create JSON blob and trigger download
    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const todayStr = new Date().toISOString().split('T')[0];
    const fileName = `MemoryJar-Backup-${todayStr}.json`;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = fileName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return {
      success: true,
      fileName,
      memoryCount: serializedMemories.length,
    };
  } catch (err) {
    console.error('[backupService] Failed to export backup:', err);
    throw new Error('Failed to create memory backup: ' + err.message);
  }
}

/**
 * Validates a JSON backup file content.
 *
 * @param {string} jsonString
 * @returns {Object} { valid: boolean, payload?: Object, error?: string }
 */
export function validateBackupJson(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid file format. The file is empty or corrupted.' };
    }

    if (!Array.isArray(data.memories)) {
      return { valid: false, error: 'Incompatible backup file. No memory records found.' };
    }

    // Check memory items validity
    const validItems = data.memories.filter((m) => m && (m.description || m.text));
    if (validItems.length === 0 && data.memories.length > 0) {
      return { valid: false, error: 'Backup file contains unrecognizable memory formats.' };
    }

    return {
      valid: true,
      payload: {
        app: data.app || 'MemoryJar',
        version: data.version || 1,
        exportedAt: data.exportedAt || null,
        memoryCount: data.memories.length,
        memories: data.memories,
      },
    };
  } catch {
    return { valid: false, error: 'Failed to read file. Please ensure it is a valid .json file.' };
  }
}

/**
 * Restores memories from a validated backup payload into IndexedDB.
 *
 * @param {Object} backupPayload
 * @param {Object} options
 * @param {'merge'|'replace'} options.mode - 'merge' keeps existing memories, 'replace' clears first
 * @returns {Promise<{ restoredCount: number }>}
 */
export async function restoreMemoriesBackup(backupPayload, { mode = 'merge' } = {}) {
  try {
    if (!backupPayload || !Array.isArray(backupPayload.memories)) {
      throw new Error('Invalid backup data payload.');
    }

    if (mode === 'replace') {
      await clearAllMemories();
    }

    // Convert Base64 photos back into binary Blobs for permanent IndexedDB storage
    const recordsToStore = await Promise.all(
      backupPayload.memories.map(async (m) => {
        let photoBlob = null;
        if (typeof m.photo === 'string' && m.photo.startsWith('data:')) {
          photoBlob = await dataUrlToBlob(m.photo);
        } else if (m.photo instanceof Blob) {
          photoBlob = m.photo;
        }

        const id = m.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const text = m.description || m.text || '';
        const date = m.date || new Date().toISOString().split('T')[0];
        const chitColor = m.chitColor || m.color || '#FFB3C6';
        const colorId = m.colorId || 'pink';

        return {
          id,
          description: text.trim(),
          date,
          photo: photoBlob,
          chitColor,
          colorId,
          createdAt: m.createdAt || Date.now(),
          updatedAt: m.updatedAt || Date.now(),
        };
      })
    );

    // Save to IndexedDB via bulkPut (prevents duplicate collisions, updates existing IDs)
    await db.memories.bulkPut(recordsToStore);

    return {
      restoredCount: recordsToStore.length,
    };
  } catch (err) {
    console.error('[backupService] Failed to restore backup:', err);
    throw new Error('Failed to restore memories from backup: ' + err.message);
  }
}

