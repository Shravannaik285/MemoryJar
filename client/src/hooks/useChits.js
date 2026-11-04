import { useState, useCallback, useEffect, useRef } from 'react';
import {
  initDatabase,
  addMemory,
  updateMemory,
  deleteMemory,
} from '../database/memoryService';

// Pastel palette configuration matching design system
export const CHIT_PALETTE = [
  { id: 'pink', name: 'Pink', bg: '#FFB3C6', light: '#FFF0F3', border: '#FFA3B8', text: '#8B2C43' },
  { id: 'lavender', name: 'Lavender', bg: '#D0BCFE', light: '#F5F0FF', border: '#C0A8FD', text: '#553C9A' },
  { id: 'peach', name: 'Peach', bg: '#FFD7BA', light: '#FFF4EC', border: '#FEC5A6', text: '#8A421D' },
  { id: 'yellow', name: 'Pastel Yellow', bg: '#FFE66D', light: '#FFFBEA', border: '#FAD850', text: '#745B00' },
  { id: 'mint', name: 'Mint Green', bg: '#D8F3DC', light: '#F0FDF4', border: '#B7E4C7', text: '#205E3B' },
  { id: 'blue', name: 'Light Blue', bg: '#A9DEF9', light: '#F0F9FF', border: '#90D3F7', text: '#1E5373' },
];

export const INITIAL_MEMORIES = [];

/**
 * Custom hook to manage persistent memory chits backed by IndexedDB (Dexie.js).
 */
export function useChits() {
  const [chits, setChits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [droppingChit, setDroppingChit] = useState(null);

  const isSavingRef = useRef(false);

  // Load memories from IndexedDB on initial mount
  const refreshMemories = useCallback(async () => {
    try {
      setDbError(null);
      const loaded = await initDatabase(INITIAL_MEMORIES);
      setChits(loaded);
    } catch (err) {
      console.error('[useChits] Failed to load memories from IndexedDB:', err);
      setDbError('Could not access local storage database.');
      // Fallback in-memory
      setChits(INITIAL_MEMORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMemories();
  }, [refreshMemories]);

  // Add a newly created chit permanently into IndexedDB
  const addChit = useCallback(async (newChitData) => {
    if (isSavingRef.current) return null;
    isSavingRef.current = true;

    try {
      const savedMemory = await addMemory(newChitData);
      setChits((prev) => [savedMemory, ...prev.filter((m) => m.id !== savedMemory.id)]);
      return savedMemory;
    } catch (err) {
      console.error('[useChits] Error adding memory to IndexedDB:', err);
      setDbError('Failed to save memory to local database.');
      throw err;
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  // Update an existing chit in IndexedDB
  const editChit = useCallback(async (id, updatedFields) => {
    try {
      const updatedMemory = await updateMemory(id, updatedFields);
      setChits((prev) =>
        prev.map((c) => (c.id === id ? updatedMemory : c))
      );
      return updatedMemory;
    } catch (err) {
      console.error(`[useChits] Error updating memory "${id}":`, err);
      setDbError('Failed to update memory in local database.');
      throw err;
    }
  }, []);

  // Delete a chit from IndexedDB
  const deleteChit = useCallback(async (id) => {
    try {
      await deleteMemory(id);
      setChits((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(`[useChits] Error deleting memory "${id}":`, err);
      setDbError('Failed to delete memory from local database.');
      throw err;
    }
  }, []);

  // Get a single chit by ID
  const getChit = useCallback(
    (id) => chits.find((c) => c.id === id) || null,
    [chits]
  );

  return {
    chits,
    chitCount: chits.length,
    isLoading,
    dbError,
    addChit,
    editChit,
    deleteChit,
    getChit,
    refreshMemories,
    droppingChit,
    setDroppingChit,
  };
}
