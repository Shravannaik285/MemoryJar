import { useState, useEffect, useCallback } from 'react';
import { registerServiceWorker, applyServiceWorkerUpdate } from './registerSW';

export function usePWA() {
  // 1. Connectivity State
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);

  // 2. Installability State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  });
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
  });

  // 3. Service Worker Update State
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingRegistration, setWaitingRegistration] = useState(null);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  // Initialize Service Worker and Listeners
  useEffect(() => {
    // Online / Offline Listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnlineToast(true);
      setTimeout(() => setShowBackOnlineToast(false), 3800);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnlineToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for beforeinstallprompt event (Chromium, Edge, Android Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
      console.log('[PWA] Application successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register Service Worker
    registerServiceWorker({
      onNeedRefresh: (reg) => {
        setIsUpdateAvailable(true);
        setWaitingRegistration(reg);
      },
      onOfflineReady: () => {
        setIsOfflineReady(true);
        setTimeout(() => setIsOfflineReady(false), 4500);
      },
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger Native Install Prompt
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      return { outcome: 'unavailable' };
    }

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
      return choice;
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
      return { outcome: 'dismissed' };
    }
  }, [deferredPrompt]);

  // Apply Service Worker Update
  const updateApp = useCallback(() => {
    if (waitingRegistration) {
      applyServiceWorkerUpdate(waitingRegistration);
    } else {
      window.location.reload();
    }
  }, [waitingRegistration]);

  const dismissUpdate = useCallback(() => {
    setIsUpdateAvailable(false);
  }, []);

  return {
    isOnline,
    showBackOnlineToast,
    canInstall,
    isInstalled,
    isIOS,
    installApp,
    isUpdateAvailable,
    updateApp,
    dismissUpdate,
    isOfflineReady,
  };
}
