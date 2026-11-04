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

export const INITIAL_MEMORIES = [
  {
    id: 'mem-1',
    description: 'Watched the golden sunrise over the misty hills with Maya. We brought a thermos of hot cocoa and wrapped in our oversized flannel blankets. One of the quietest, most peaceful mornings of my life.',
    text: 'Watched the golden sunrise over the misty hills with Maya. We brought a thermos of hot cocoa and wrapped in our oversized flannel blankets. One of the quietest, most peaceful mornings of my life.',
    date: '2026-01-14',
    chitColor: '#FFB3C6',
    color: '#FFB3C6',
    colorId: 'pink',
    photo: null,
    createdAt: 1736841600000,
  },
  {
    id: 'mem-2',
    description: 'Adopted Barnaby today from the shelter! He is a sleepy golden retriever puppy with paws way too big for his body. He fell asleep right on my shoes on the car ride home.',
    text: 'Adopted Barnaby today from the shelter! He is a sleepy golden retriever puppy with paws way too big for his body. He fell asleep right on my shoes on the car ride home.',
    date: '2026-02-02',
    chitColor: '#FFD7BA',
    color: '#FFD7BA',
    colorId: 'peach',
    photo: null,
    createdAt: 1738483200000,
  },
  {
    id: 'mem-3',
    description: 'Finished reading The Midnight Library on the back porch while listening to soft rain tapping on the tin awning. Felt completely content with where I am right now.',
    text: 'Finished reading The Midnight Library on the back porch while listening to soft rain tapping on the tin awning. Felt completely content with where I am right now.',
    date: '2026-02-18',
    chitColor: '#D0BCFE',
    color: '#D0BCFE',
    colorId: 'lavender',
    photo: null,
    createdAt: 1739865600000,
  },
  {
    id: 'mem-4',
    description: 'Baked three batches of chocolate chip cookies with Mom. Flour got everywhere—including Barnaby\'s nose. Best Sunday laughter in months.',
    text: 'Baked three batches of chocolate chip cookies with Mom. Flour got everywhere—including Barnaby\'s nose. Best Sunday laughter in months.',
    date: '2026-03-01',
    chitColor: '#FFE66D',
    color: '#FFE66D',
    colorId: 'yellow',
    photo: null,
    createdAt: 1740816000000,
  },
  {
    id: 'mem-5',
    description: 'Received the official acceptance email for my dream design internship! Burst into happy tears and called Grandma immediately.',
    text: 'Received the official acceptance email for my dream design internship! Burst into happy tears and called Grandma immediately.',
    date: '2026-03-12',
    chitColor: '#D8F3DC',
    color: '#D8F3DC',
    colorId: 'mint',
    photo: null,
    createdAt: 1741766400000,
  },
  {
    id: 'mem-6',
    description: 'Late night spontaneous road trip to the scenic overlook. We sat on the car hood counting shooting stars with our favorite indie folk playlist on repeat.',
    text: 'Late night spontaneous road trip to the scenic overlook. We sat on the car hood counting shooting stars with our favorite indie folk playlist on repeat.',
    date: '2026-03-25',
    chitColor: '#A9DEF9',
    color: '#A9DEF9',
    colorId: 'blue',
    photo: null,
    createdAt: 1742889600000,
  },
  {
    id: 'mem-7',
    description: 'Planted our little balcony herb garden today: sweet basil, rosemary, and cherry tomatoes. Looking forward to watching them grow.',
    text: 'Planted our little balcony herb garden today: sweet basil, rosemary, and cherry tomatoes. Looking forward to watching them grow.',
    date: '2026-04-05',
    chitColor: '#D8F3DC',
    color: '#D8F3DC',
    colorId: 'mint',
    photo: null,
    createdAt: 1743840000000,
  },
  {
    id: 'mem-8',
    description: 'Surprise birthday picnic organized by all my closest friends under the giant weeping willow in the botanical garden. Beautiful hand-painted cards and strawberry shortcake.',
    text: 'Surprise birthday picnic organized by all my closest friends under the giant weeping willow in the botanical garden. Beautiful hand-painted cards and strawberry shortcake.',
    date: '2026-04-18',
    chitColor: '#FFB3C6',
    color: '#FFB3C6',
    colorId: 'pink',
    photo: null,
    createdAt: 1744963200000,
  },
  {
    id: 'mem-9',
    description: 'Spent the entire afternoon browsing dusty old bookshops in the historic district. Found a vintage 1974 poetry collection with dried pressed wildflowers inside the pages.',
    text: 'Spent the entire afternoon browsing dusty old bookshops in the historic district. Found a vintage 1974 poetry collection with dried pressed wildflowers inside the pages.',
    date: '2026-05-02',
    chitColor: '#FFD7BA',
    color: '#FFD7BA',
    colorId: 'peach',
    photo: null,
    createdAt: 1746172800000,
  },
  {
    id: 'mem-10',
    description: 'Learned how to make authentic handmade gnocchi from scratch. The dough was so soft and fluffy, like little pillowy clouds.',
    text: 'Learned how to make authentic handmade gnocchi from scratch. The dough was so soft and fluffy, like little pillowy clouds.',
    date: '2026-05-15',
    chitColor: '#FFE66D',
    color: '#FFE66D',
    colorId: 'yellow',
    photo: null,
    createdAt: 1747296000000,
  },
  {
    id: 'mem-11',
    description: 'Walked through the night flower market under fairy lanterns. The scent of blooming jasmine and wet pavement felt magical.',
    text: 'Walked through the night flower market under fairy lanterns. The scent of blooming jasmine and wet pavement felt magical.',
    date: '2026-05-28',
    chitColor: '#D0BCFE',
    color: '#D0BCFE',
    colorId: 'lavender',
    photo: null,
    createdAt: 1748419200000,
  },
  {
    id: 'mem-12',
    description: 'First swim in the freshwater lake of the season. Cold at first, then pure exhilaration. Summer is officially here.',
    text: 'First swim in the freshwater lake of the season. Cold at first, then pure exhilaration. Summer is officially here.',
    date: '2026-06-10',
    chitColor: '#A9DEF9',
    color: '#A9DEF9',
    colorId: 'blue',
    photo: null,
    createdAt: 1749542400000,
  },
  {
    id: 'mem-13',
    description: 'Made homemade peach jam from farmer\'s market baskets. Sealed 8 cozy glass jars with checked gingham fabric tops.',
    text: 'Made homemade peach jam from farmer\'s market baskets. Sealed 8 cozy glass jars with checked gingham fabric tops.',
    date: '2026-06-22',
    chitColor: '#FFD7BA',
    color: '#FFD7BA',
    colorId: 'peach',
    photo: null,
    createdAt: 1750579200000,
  },
  {
    id: 'mem-14',
    description: 'Grandma shared her secret stories from when she traveled across Europe with just a backpack and a film camera in the 60s.',
    text: 'Grandma shared her secret stories from when she traveled across Europe with just a backpack and a film camera in the 60s.',
    date: '2026-07-04',
    chitColor: '#FFB3C6',
    color: '#FFB3C6',
    colorId: 'pink',
    photo: null,
    createdAt: 1751616000000,
  },
  {
    id: 'mem-15',
    description: 'Conquered the 8-mile ridge trail hike! The view from the peak looking over the cloud canopy took my breath away.',
    text: 'Conquered the 8-mile ridge trail hike! The view from the peak looking over the cloud canopy took my breath away.',
    date: '2026-07-19',
    chitColor: '#D8F3DC',
    color: '#D8F3DC',
    colorId: 'mint',
    photo: null,
    createdAt: 1752912000000,
  },
  {
    id: 'mem-16',
    description: 'Watched our favorite childhood animated movies in a cozy living room blanket fort with fairy lights and microwave kettle corn.',
    text: 'Watched our favorite childhood animated movies in a cozy living room blanket fort with fairy lights and microwave kettle corn.',
    date: '2026-08-03',
    chitColor: '#FFE66D',
    color: '#FFE66D',
    colorId: 'yellow',
    photo: null,
    createdAt: 1754208000000,
  },
  {
    id: 'mem-17',
    description: 'Found a stray kitten near the porch, nursed him with warm milk, and watched him purr himself to sleep in a shoebox blanket.',
    text: 'Found a stray kitten near the porch, nursed him with warm milk, and watched him purr himself to sleep in a shoebox blanket.',
    date: '2026-08-16',
    chitColor: '#D0BCFE',
    color: '#D0BCFE',
    colorId: 'lavender',
    photo: null,
    createdAt: 1755331200000,
  },
  {
    id: 'mem-18',
    description: 'Paddle-boarding at sunset while the entire sky turned pastel violet and dusty rose. Perfect stillness.',
    text: 'Paddle-boarding at sunset while the entire sky turned pastel violet and dusty rose. Perfect stillness.',
    date: '2026-08-29',
    chitColor: '#A9DEF9',
    color: '#A9DEF9',
    colorId: 'blue',
    photo: null,
    createdAt: 1756454400000,
  },
  {
    id: 'mem-19',
    description: 'First sip of cinnamon spiced apple cider at the orchard. The leaves are just beginning to turn orange and crimson.',
    text: 'First sip of cinnamon spiced apple cider at the orchard. The leaves are just beginning to turn orange and crimson.',
    date: '2026-09-12',
    chitColor: '#FFD7BA',
    color: '#FFD7BA',
    colorId: 'peach',
    photo: null,
    createdAt: 1757664000000,
  },
  {
    id: 'mem-20',
    description: 'Got an impromptu postcard from Leo sent from Tokyo with a vintage cherry blossom stamp. Made me smile the whole day.',
    text: 'Got an impromptu postcard from Leo sent from Tokyo with a vintage cherry blossom stamp. Made me smile the whole day.',
    date: '2026-09-24',
    chitColor: '#FFB3C6',
    color: '#FFB3C6',
    colorId: 'pink',
    photo: null,
    createdAt: 1758700800000,
  },
  {
    id: 'mem-21',
    description: 'Completed my 1000-piece watercolor garden puzzle after two weeks on the dining table. Placed the final piece together!',
    text: 'Completed my 1000-piece watercolor garden puzzle after two weeks on the dining table. Placed the final piece together!',
    date: '2026-10-06',
    chitColor: '#D8F3DC',
    color: '#D8F3DC',
    colorId: 'mint',
    photo: null,
    createdAt: 1759737600000,
  },
  {
    id: 'mem-22',
    description: 'Carved whimsical grinning pumpkins with the neighborhood kids on the porch steps while drinking hot cocoa.',
    text: 'Carved whimsical grinning pumpkins with the neighborhood kids on the porch steps while drinking hot cocoa.',
    date: '2026-10-20',
    chitColor: '#FFE66D',
    color: '#FFE66D',
    colorId: 'yellow',
    photo: null,
    createdAt: 1760947200000,
  },
  {
    id: 'mem-23',
    description: 'Wore my thick woolen knit sweater for the first crisp chilly morning walk with Barnaby. Crunchy leaves underfoot.',
    text: 'Wore my thick woolen knit sweater for the first crisp chilly morning walk with Barnaby. Crunchy leaves underfoot.',
    date: '2026-10-28',
    chitColor: '#D0BCFE',
    color: '#D0BCFE',
    colorId: 'lavender',
    photo: null,
    createdAt: 1761638400000,
  },
  {
    id: 'mem-24',
    description: 'Sat by the wood fireplace with warm herbal tea, writing down everything I am grateful for in this wonderful little Memory Jar.',
    text: 'Sat by the wood fireplace with warm herbal tea, writing down everything I am grateful for in this wonderful little Memory Jar.',
    date: '2026-11-02',
    chitColor: '#FFD7BA',
    color: '#FFD7BA',
    colorId: 'peach',
    photo: null,
    createdAt: 1762070400000,
  },
];

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
