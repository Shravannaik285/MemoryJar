import { db } from './db.js';

/**
 * Helper: Convert a Data URL / Base64 string to a Blob
 * @param {string} dataUrl
 * @returns {Promise<Blob>}
 */
export async function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  if (!dataUrl.startsWith('data:')) return null;

  try {
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch (err) {
    console.warn('[memoryService] Failed to convert dataUrl to Blob:', err);
    return null;
  }
}

/**
 * Helper: Convert a Blob to a Base64 Data URL (used for portable JSON export)
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    if (!blob || !(blob instanceof Blob)) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Cache map of active Blob object URLs: id -> { blob: Blob, url: string }
// Prevents memory leaks by reusing URLs and revoking when deleted
const photoUrlCache = new Map();

/**
 * Revokes a cached object URL for a given memory ID
 * @param {string} id
 */
export function revokePhotoUrl(id) {
  if (photoUrlCache.has(id)) {
    const entry = photoUrlCache.get(id);
    if (entry && entry.url && entry.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(entry.url);
      } catch {
        // ignore
      }
    }
    photoUrlCache.delete(id);
  }
}

/**
 * Revokes all cached photo object URLs
 */
export function revokeAllPhotoUrls() {
  for (const [id] of photoUrlCache) {
    revokePhotoUrl(id);
  }
}

/**
 * Normalizes a raw IndexedDB memory record for React components.
 * Creates an object URL for photo Blobs and aliases properties.
 *
 * @param {Object} record
 * @returns {Object}
 */
export function normalizeMemory(record) {
  if (!record) return null;

  let photoUrl = null;
  let photoBlob = null;

  if (record.photo instanceof Blob) {
    photoBlob = record.photo;
    const cached = photoUrlCache.get(record.id);
    if (cached && cached.blob === record.photo) {
      photoUrl = cached.url;
    } else {
      if (cached) revokePhotoUrl(record.id);
      try {
        photoUrl = URL.createObjectURL(record.photo);
        photoUrlCache.set(record.id, { blob: record.photo, url: photoUrl });
      } catch (err) {
        console.warn('[memoryService] Failed to create object URL:', err);
      }
    }
  } else if (typeof record.photo === 'string' && record.photo.length > 0) {
    photoUrl = record.photo;
  }

  const text = record.description || record.text || '';
  const chitColor = record.chitColor || record.color || '#FFB3C6';

  return {
    ...record,
    id: record.id,
    description: text,
    text: text,
    date: record.date || new Date().toISOString().split('T')[0],
    chitColor: chitColor,
    color: chitColor,
    colorId: record.colorId || 'pink',
    photoBlob: photoBlob,
    photoUrl: photoUrl,
    photo: photoUrl, // Backwards-compatible for <img src={chit.photo} />
    createdAt: record.createdAt || Date.now(),
    updatedAt: record.updatedAt || record.createdAt || Date.now(),
  };
}

/**
 * Initializes the database.
 * If the database is empty, seeds it with initial memories.
 *
 * @param {Array} seedMemories
 * @returns {Promise<Array>}
 */
export async function initDatabase(seedMemories = []) {
  try {
    const count = await db.memories.count();
    if (count === 0 && seedMemories && seedMemories.length > 0) {
      console.log(`[memoryService] Seeding database with ${seedMemories.length} initial memories...`);

      const initialRecords = await Promise.all(
        seedMemories.map(async (m) => {
          let blob = null;
          if (m.photo instanceof Blob) {
            blob = m.photo;
          } else if (typeof m.photo === 'string' && m.photo.startsWith('data:')) {
            blob = await dataUrlToBlob(m.photo);
          }

          const desc = m.description || m.text || '';
          const col = m.chitColor || m.color || '#FFB3C6';

          return {
            id: m.id,
            description: desc,
            date: m.date,
            photo: blob,
            chitColor: col,
            colorId: m.colorId || 'pink',
            createdAt: m.createdAt || Date.now(),
            updatedAt: m.updatedAt || m.createdAt || Date.now(),
          };
        })
      );

      await db.memories.bulkPut(initialRecords);
    }

    return await getAllMemories();
  } catch (err) {
    console.error('[memoryService] Database initialization error:', err);
    throw err;
  }
}

/**
 * Retrieves all memories from IndexedDB sorted chronologically.
 *
 * @param {'desc'|'asc'} sortOrder
 * @returns {Promise<Array>}
 */
export async function getAllMemories(sortOrder = 'desc') {
  try {
    const records = await db.memories.toArray();

    // Sort chronologically by date, falling back to createdAt
    records.sort((a, b) => {
      const timeA = new Date(a.date).getTime() || a.createdAt || 0;
      const timeB = new Date(b.date).getTime() || b.createdAt || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return records.map(normalizeMemory);
  } catch (err) {
    console.error('[memoryService] Failed to retrieve memories from IndexedDB:', err);
    throw err;
  }
}

/**
 * Retrieves the total count of memories stored in IndexedDB.
 *
 * @returns {Promise<number>}
 */
export async function getMemoryCount() {
  try {
    return await db.memories.count();
  } catch (err) {
    console.error('[memoryService] Failed to get memory count:', err);
    return 0;
  }
}

/**
 * Adds a new memory to IndexedDB.
 * Ensures photos are stored as Blobs.
 *
 * @param {Object} memoryData
 * @returns {Promise<Object>} The stored normalized memory
 */
export async function addMemory(memoryData) {
  try {
    const id = memoryData.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const text = memoryData.description || memoryData.text || '';
    const date = memoryData.date || new Date().toISOString().split('T')[0];
    const chitColor = memoryData.chitColor || memoryData.color || '#FFB3C6';
    const colorId = memoryData.colorId || 'pink';
    const now = Date.now();

    // Convert photo to Blob
    let photoBlob = null;
    if (memoryData.photoBlob instanceof Blob) {
      photoBlob = memoryData.photoBlob;
    } else if (memoryData.photo instanceof Blob) {
      photoBlob = memoryData.photo;
    } else if (typeof memoryData.photo === 'string' && memoryData.photo.startsWith('data:')) {
      photoBlob = await dataUrlToBlob(memoryData.photo);
    }

    const record = {
      id,
      description: text.trim(),
      date,
      photo: photoBlob,
      chitColor,
      colorId,
      createdAt: memoryData.createdAt || now,
      updatedAt: now,
    };

    await db.memories.put(record);

    return normalizeMemory(record);
  } catch (err) {
    console.error('[memoryService] Failed to add memory:', err);
    throw err;
  }
}

/**
 * Updates an existing memory in IndexedDB.
 *
 * @param {string} id
 * @param {Object} updatedFields
 * @returns {Promise<Object>}
 */
export async function updateMemory(id, updatedFields) {
  try {
    const existing = await db.memories.get(id);
    if (!existing) {
      throw new Error(`Memory with ID "${id}" not found.`);
    }

    let photoBlob = existing.photo;

    // Handle photo updates
    if (updatedFields.photoBlob instanceof Blob) {
      photoBlob = updatedFields.photoBlob;
    } else if (updatedFields.photo instanceof Blob) {
      photoBlob = updatedFields.photo;
    } else if (typeof updatedFields.photo === 'string') {
      if (updatedFields.photo.startsWith('data:')) {
        photoBlob = await dataUrlToBlob(updatedFields.photo);
      } else if (updatedFields.photo.startsWith('blob:')) {
        // Kept existing object URL, preserve existing blob
        photoBlob = existing.photo;
      }
    } else if (updatedFields.photo === null) {
      photoBlob = null;
    }

    const updates = {
      ...existing,
      description: updatedFields.description ?? updatedFields.text ?? existing.description,
      date: updatedFields.date ?? existing.date,
      photo: photoBlob,
      chitColor: updatedFields.chitColor ?? updatedFields.color ?? existing.chitColor,
      colorId: updatedFields.colorId ?? existing.colorId,
      updatedAt: Date.now(),
    };

    await db.memories.put(updates);

    return normalizeMemory(updates);
  } catch (err) {
    console.error(`[memoryService] Failed to update memory "${id}":`, err);
    throw err;
  }
}

/**
 * Deletes a memory from IndexedDB.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteMemory(id) {
  try {
    await db.memories.delete(id);
    revokePhotoUrl(id);
  } catch (err) {
    console.error(`[memoryService] Failed to delete memory "${id}":`, err);
    throw err;
  }
}

/**
 * Clears all memories from IndexedDB.
 *
 * @returns {Promise<void>}
 */
export async function clearAllMemories() {
  try {
    await db.memories.clear();
    revokeAllPhotoUrls();
  } catch (err) {
    console.error('[memoryService] Failed to clear memories:', err);
    throw err;
  }
}

/**
 * Bulk adds or updates an array of memory records.
 *
 * @param {Array<Object>} records
 * @returns {Promise<void>}
 */
export async function bulkPutMemories(records) {
  try {
    await db.memories.bulkPut(records);
  } catch (err) {
    console.error('[memoryService] Failed to bulk save memories:', err);
    throw err;
  }
}

