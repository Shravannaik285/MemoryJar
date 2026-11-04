import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import AmbientDecorations from './components/AmbientDecorations';
import JarStage from './components/JarStage';
import ActionButtons from './components/ActionButtons';
import BirthdayReminder from './components/BirthdayReminder';
import Footer from './components/Footer';
import OfflineIndicator from './components/PWA/OfflineIndicator';
import InstallPrompt from './components/PWA/InstallPrompt';
import UpdateNotification from './components/PWA/UpdateNotification';
import { useChits } from './hooks/useChits';
import { usePWA } from './pwa/usePWA';
import { triggerJarLandedReaction } from './animations/jarReactionTimeline';
import './App.css';

// Lazy-loaded modal chunks for bundle optimization & instant initial load
const AddChitModal = lazy(() => import('./components/AddChit/AddChitModal'));
const ViewChitsModal = lazy(() => import('./components/ViewChits/ViewChitsModal'));
const BackupModal = lazy(() => import('./components/Backup/BackupModal'));
const BirthdayRevealOverlay = lazy(() => import('./components/BirthdayReveal/BirthdayRevealOverlay'));
const LegalModal = lazy(() => import('./components/Legal/LegalModal'));

export default function App() {
  const {
    chits,
    chitCount,
    addChit,
    editChit,
    deleteChit,
    droppingChit,
    setDroppingChit,
    dbError,
    refreshMemories,
  } = useChits();

  const {
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
  } = usePWA();

  const [birthdayDate, setBirthdayDate] = useState('2026-12-15');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal & Interaction States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isBirthdayRevealOpen, setIsBirthdayRevealOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState('privacy');
  const [isLidOpen, setIsLidOpen] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    if (dbError) {
      showToast(`⚠️ Storage note: ${dbError}`);
    }
  }, [dbError]);

  useEffect(() => {
    if (isOfflineReady) {
      showToast('📦 Memory Jar is cached and ready for offline use!');
    }
  }, [isOfflineReady]);

  // Phase 7 & 8: Detect ?reveal=true URL query parameter from push notification click
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reveal') === 'true') {
        // Clean URL without triggering page reload
        window.history.replaceState({}, document.title, window.location.pathname);
        // Launch Phase 8 Birthday Reveal Experience
        setIsBirthdayRevealOpen(true);
      }
    }
  }, []);

  // Preload lazy modal chunks in the background during idle time so they are cached for offline use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const preloadModals = () => {
        import('./components/AddChit/AddChitModal');
        import('./components/ViewChits/ViewChitsModal');
        import('./components/Backup/BackupModal');
        import('./components/BirthdayReveal/BirthdayRevealOverlay');
        import('./components/Legal/LegalModal');
      };

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadModals);
      } else {
        setTimeout(preloadModals, 1500);
      }
    }
  }, []);

  const handleAddChitClick = () => {
    setIsAddModalOpen(true);
  };

  const handleViewChitsClick = () => {
    setIsViewModalOpen(true);
  };

  const handleJarClick = () => {
    showToast('🫙 The 3D jar shakes happily! Your memories are safe inside.');
  };

  const handleSimulateBirthday = () => {
    setIsBirthdayRevealOpen(true);
  };

  // Called when the 2D folding paper reaches the 3D jar opening
  const handleChitEnterJar = (chitData) => {
    setDroppingChit(chitData);
  };

  // Called when the 3D falling chit touches down on the resting pile inside Three.js
  const handleChitLanded = (landedChit) => {
    // 1. Commit the memory to state
    addChit(landedChit);

    // 2. Clear dropping state and close lid
    setDroppingChit(null);
    setIsLidOpen(false);

    // 3. Celebratory confetti burst & feedback reaction
    triggerJarLandedReaction({
      onComplete: () => {
        showToast('✨ Memory folded and safely tucked into your jar!');
      },
    });
  };

  const handleEditChit = (id, updatedFields) => {
    editChit(id, updatedFields);
    showToast('🌸 Memory updated successfully!');
  };

  const handleDeleteChit = (id) => {
    deleteChit(id);
    showToast('🗑️ Memory removed from your jar.');
  };

  return (
    <div className="app-container">
      {/* Ambient Room Atmosphere (Leaves, Bokeh Glows) */}
      <AmbientDecorations />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Section 1: Header (Logo, Title, Tagline) */}
        <Header />

        {/* Section 2: Realistic Interactive 3D Jar Showcase Stage */}
        <JarStage
          chits={chits}
          chitCount={chitCount}
          onJarClick={handleJarClick}
          isLidOpen={isLidOpen}
          droppingChit={droppingChit}
          onChitLanded={handleChitLanded}
        />

        {/* Section 3: Action Cards (Add Chit & View Chits) */}
        <ActionButtons
          onAddChit={handleAddChitClick}
          onViewChits={handleViewChitsClick}
          chitCount={chitCount}
        />

        {/* Section 4: Birthday Date Selector & Live Countdown */}
        <BirthdayReminder
          birthdayDate={birthdayDate}
          onDateChange={(newDate) => setBirthdayDate(newDate)}
          onOpenJarToday={handleSimulateBirthday}
          onShowToast={showToast}
        />

        {/* Section 5: Cozy Scrapbook Footer */}
        <Footer
          onSimulateBirthday={handleSimulateBirthday}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          canInstallApp={canInstall}
          onInstallApp={installApp}
          onOpenPrivacy={() => {
            setLegalInitialTab('privacy');
            setIsLegalModalOpen(true);
          }}
          onOpenContact={() => {
            setLegalInitialTab('contact');
            setIsLegalModalOpen(true);
          }}
        />
      </main>

      {/* Phase 6 PWA Feature 1: Offline Connectivity Status Indicator */}
      <OfflineIndicator
        isOnline={isOnline}
        showBackOnlineToast={showBackOnlineToast}
      />

      {/* Phase 6 PWA Feature 2: Service Worker Update Notification */}
      <UpdateNotification
        isUpdateAvailable={isUpdateAvailable}
        onUpdate={updateApp}
        onDismiss={dismissUpdate}
      />

      {/* Phase 6 PWA Feature 3: Install Memory Jar Prompt Banner */}
      <InstallPrompt
        canInstall={canInstall}
        onInstall={installApp}
        isInstalled={isInstalled}
        isIOS={isIOS}
      />

      {/* Lazy-Loaded Modals with Suspense fallback */}
      <Suspense fallback={null}>
        {/* Phase 3 Feature 1: Add Chit Paper Editor Modal */}
        {isAddModalOpen && (
          <AddChitModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onOpenJarLid={() => setIsLidOpen(true)}
            onChitEnterJar={handleChitEnterJar}
          />
        )}

        {/* Phase 3 Feature 2: View Chits Scrapbook Gallery Modal */}
        {isViewModalOpen && (
          <ViewChitsModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            chits={chits}
            onEditChit={handleEditChit}
            onDeleteChit={handleDeleteChit}
            onAddNewChit={() => setIsAddModalOpen(true)}
            onRefreshMemories={refreshMemories}
          />
        )}

        {/* Phase 5 Feature: Offline IndexedDB Backup & Restore Modal */}
        {isBackupModalOpen && (
          <BackupModal
            isOpen={isBackupModalOpen}
            onClose={() => setIsBackupModalOpen(false)}
            chits={chits}
            onImportSuccess={() => {
              refreshMemories();
              showToast('✨ Memories restored successfully!');
            }}
          />
        )}

        {/* Phase 8 Feature: The Birthday Reveal Cinematic Experience */}
        {isBirthdayRevealOpen && (
          <BirthdayRevealOverlay
            isOpen={isBirthdayRevealOpen}
            onClose={() => setIsBirthdayRevealOpen(false)}
            chits={chits}
            onSetLidOpen={(open) => setIsLidOpen(open)}
            onOpenScrapbook={() => setIsViewModalOpen(true)}
            onWriteMemory={() => setIsAddModalOpen(true)}
          />
        )}

        {/* Phase 10 Feature: Legal, Privacy, Storage Notice & Terms Modal */}
        {isLegalModalOpen && (
          <LegalModal
            isOpen={isLegalModalOpen}
            initialTab={legalInitialTab}
            onClose={() => setIsLegalModalOpen(false)}
          />
        )}
      </Suspense>

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="cozy-toast" role="status">
          <span className="toast-sparkle">🌸</span>
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
