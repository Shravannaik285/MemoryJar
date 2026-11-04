import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

const AUTOPLAY_STEP_MS = 6000;

export function useBirthdayReveal({
  chits = [],
  isOpen = false,
  onClose,
}) {
  const [currentStage, setCurrentStage] = useState('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sort memories strictly chronologically (Oldest first, Newest last)
  const sortedMemories = useMemo(() => {
    if (!chits || !Array.isArray(chits)) return [];
    return [...chits].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || a.createdAt || 0;
      const timeB = new Date(b.date).getTime() || b.createdAt || 0;
      return timeA - timeB;
    });
  }, [chits]);

  // Reset stage when reveal modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStage('welcome');
      setCurrentIndex(0);
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isOpen]);

  // Next Memory Navigation
  const nextMemory = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= sortedMemories.length - 1) {
        // Reached end of memories, transition to finale screen
        setIsPlaying(false);
        setCurrentStage('finale');
        return prev;
      }
      return prev + 1;
    });
  }, [sortedMemories.length]);

  // Previous Memory Navigation
  const prevMemory = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  // Jump to specific index
  const goToIndex = useCallback((idx) => {
    setCurrentIndex(idx);
  }, []);

  // Toggle Auto-play
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Skip straight to the finale screen
  const skipToFinale = useCallback(() => {
    setIsPlaying(false);
    setCurrentStage('finale');
  }, []);

  // Replay the reveal experience from the start
  const replay = useCallback(() => {
    setCurrentIndex(0);
    setProgress(0);
    setIsPlaying(false);
    setCurrentStage('opening');
  }, []);

  // Timer only active when user explicitly clicks the Play button
  useEffect(() => {
    if (currentStage !== 'slideshow' || !isPlaying || sortedMemories.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev < sortedMemories.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          setCurrentStage('finale');
          return prev;
        }
      });
    }, AUTOPLAY_STEP_MS);

    return () => clearTimeout(timer);
  }, [currentStage, isPlaying, currentIndex, sortedMemories.length]);

  return {
    currentStage,
    setCurrentStage,
    sortedMemories,
    currentIndex,
    currentMemory: sortedMemories[currentIndex] || null,
    totalMemories: sortedMemories.length,
    isPlaying,
    progress,
    nextMemory,
    prevMemory,
    goToIndex,
    togglePlay,
    skipToFinale,
    replay,
    closeReveal: () => {
      setIsPlaying(false);
      if (onClose) onClose();
    },
  };
}

