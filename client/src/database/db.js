import Dexie from 'dexie';

/**
 * MemoryJarDB — IndexedDB instance configured via Dexie.js
 * Stores user memories and photos locally and privately on the browser device.
 */
export const db = new Dexie('MemoryJarDB');

// Database schema definition
db.version(1).stores({
  memories: 'id, date, chitColor, createdAt, updatedAt',
});

