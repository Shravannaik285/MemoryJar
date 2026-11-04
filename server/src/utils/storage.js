import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'subscriptions.json');
const BACKUP_FILE = path.join(DATA_DIR, 'subscriptions.backup.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Loads all subscriptions from persistent storage.
 * Recovers from backup if the primary file is missing or corrupted.
 * @returns {Array<Object>}
 */
export function loadSubscriptions() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      if (fs.existsSync(BACKUP_FILE)) {
        const backupData = fs.readFileSync(BACKUP_FILE, 'utf8');
        return JSON.parse(backupData);
      }
      return [];
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[Storage] Error reading subscriptions.json, attempting backup recovery:', err);
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const backupData = fs.readFileSync(BACKUP_FILE, 'utf8');
        const recovered = JSON.parse(backupData);
        console.log('[Storage] Successfully recovered subscriptions from backup.');
        return Array.isArray(recovered) ? recovered : [];
      }
    } catch (bErr) {
      console.error('[Storage] Backup recovery failed:', bErr);
    }
    return [];
  }
}

/**
 * Saves subscriptions with atomic write and automated backup.
 * @param {Array<Object>} subscriptions
 */
export function saveSubscriptions(subscriptions) {
  const jsonContent = JSON.stringify(subscriptions, null, 2);
  const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;

  try {
    // 1. Write to temporary file first
    fs.writeFileSync(tempFile, jsonContent, 'utf8');

    // 2. If primary file already exists, create/update backup
    if (fs.existsSync(DATA_FILE)) {
      try {
        fs.copyFileSync(DATA_FILE, BACKUP_FILE);
      } catch (copyErr) {
        console.warn('[Storage] Warning: Failed to update backup file:', copyErr);
      }
    }

    // 3. Atomically rename temp file to primary file
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('[Storage] Failed to atomically save subscriptions:', err);
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // ignore
      }
    }
    throw err;
  }
}

/**
 * Finds a subscription by its unique push endpoint
 * @param {string} endpoint
 * @returns {Object|null}
 */
export function findSubscription(endpoint) {
  if (!endpoint) return null;
  const list = loadSubscriptions();
  return list.find((sub) => sub.endpoint === endpoint) || null;
}

/**
 * Inserts or updates a subscription with birthday preferences
 * @param {Object} subData
 * @returns {Object}
 */
export function upsertSubscription(subData) {
  if (!subData || !subData.endpoint) {
    throw new Error('Subscription requires an endpoint.');
  }

  const list = loadSubscriptions();
  const existingIdx = list.findIndex((s) => s.endpoint === subData.endpoint);
  const now = new Date().toISOString();

  let savedRecord;

  if (existingIdx >= 0) {
    // Update existing subscription record
    savedRecord = {
      ...list[existingIdx],
      ...subData,
      updatedAt: now,
    };
    list[existingIdx] = savedRecord;
  } else {
    // Create new record
    savedRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      endpoint: subData.endpoint,
      keys: subData.keys || {},
      birthday: subData.birthday || null,
      notificationTime: subData.notificationTime || '09:00',
      timezone: subData.timezone || 'UTC',
      enabled: subData.enabled !== false,
      lastNotifiedYear: null,
      lastNotifiedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    list.push(savedRecord);
  }

  saveSubscriptions(list);
  return savedRecord;
}

/**
 * Removes a subscription by endpoint
 * @param {string} endpoint
 * @returns {boolean}
 */
export function removeSubscription(endpoint) {
  if (!endpoint) return false;
  const list = loadSubscriptions();
  const filtered = list.filter((s) => s.endpoint !== endpoint);

  if (filtered.length !== list.length) {
    saveSubscriptions(filtered);
    return true;
  }
  return false;
}

