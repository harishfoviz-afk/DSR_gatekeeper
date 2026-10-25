import React, { useState, useEffect } from 'react';
import Header from './components/Shared/Header';
import FirebaseSettingsModal from './components/Shared/FirebaseSettingsModal';
import VoiceSettingsModal from './components/Shared/VoiceSettingsModal';
import VisitorKiosk from './components/Kiosk/VisitorKiosk';
import ResidentPortal from './components/Resident/ResidentPortal';
import AdminPanel from './components/Admin/AdminPanel';
import QuickApproveView from './components/Resident/QuickApproveView';
import { subscribeToVisitors, subscribeToSocietyConfig, resetSeedData } from './services/db';

export default function App() {
  const getRouteFromHash = () => {
    const raw = window.location.hash.replace('#/', '').replace('#', '');
    const route = raw.split('?')[0].toLowerCase();
    if (['kiosk', 'resident', 'admin', 'quick-approve'].includes(route)) {
      return route;
    }
    return 'kiosk';
  };

  const [activeView, setActiveView] = useState(getRouteFromHash);
  const [visitors, setVisitors] = useState([]);
  const [societyConfig, setSocietyConfig] = useState({});
  const [syncMode, setSyncMode] = useState('local');
  const [language, setLanguage] = useState('bilingual-te');
  const [autoAnnounce, setAutoAnnounce] = useState(true);

  // Modals
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Sync active view with window hash (preserve query if quick-approve)
  useEffect(() => {
    const currentHashRoute = window.location.hash.replace('#/', '').replace('#', '').split('?')[0].toLowerCase();
    if (currentHashRoute !== activeView) {
      if (activeView === 'quick-approve') {
        const query = window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '';
        window.location.hash = `#/quick-approve${query}`;
      } else {
        window.location.hash = `#/${activeView}`;
      }
    }
  }, [activeView]);

  // Listen to hash changes (back/forward button or external WhatsApp link clicks)
  useEffect(() => {
    const handleHashChange = () => {
      const route = getRouteFromHash();
      setActiveView(route);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Real-time visitors and society config subscription
  useEffect(() => {
    const unsubscribeVisitors = subscribeToVisitors((data, meta) => {
      setVisitors(data || []);
      if (meta?.source) {
        setSyncMode(meta.source);
      }
    });

    const unsubscribeSociety = subscribeToSocietyConfig((conf) => {
      if (conf) setSocietyConfig(conf);
    });

    return () => {
      if (typeof unsubscribeVisitors === 'function') unsubscribeVisitors();
      if (typeof unsubscribeSociety === 'function') unsubscribeSociety();
    };
  }, []);

  const handleResetData = () => {
    if (confirm("Reset demo visitor activity logs? (Your custom apartment name and flats directory will be preserved)")) {
      resetSeedData(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Outfit',sans-serif]">
      {/* Top Navigation Bar with View Switcher */}
      {activeView !== 'quick-approve' && (
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          visitors={visitors}
          societyConfig={societyConfig}
          syncMode={syncMode}
          language={language}
          setLanguage={setLanguage}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onResetData={handleResetData}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeView === 'kiosk' && (
          <VisitorKiosk
            visitors={visitors}
            societyConfig={societyConfig}
            language={language}
          />
        )}

        {activeView === 'resident' && (
          <ResidentPortal
            visitors={visitors}
            societyConfig={societyConfig}
          />
        )}

        {activeView === 'admin' && (
          <AdminPanel
            societyConfig={societyConfig}
            visitors={visitors}
            onUpdateConfig={(updated) => setSocietyConfig(updated)}
          />
        )}

        {activeView === 'quick-approve' && (
          <QuickApproveView
            visitors={visitors}
            onNavigateToApp={(view) => setActiveView(view)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (Kiosk, Resident, Admin) */}
      {activeView !== 'quick-approve' && (
        <div className="fixed bottom-3 inset-x-0 sm:hidden z-30 px-3">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-2xl flex items-center justify-between text-xs font-bold">
            <button
              onClick={() => setActiveView('kiosk')}
              className={`flex-1 py-2 rounded-xl transition ${
                activeView === 'kiosk' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'
              }`}
            >
              Kiosk & Pass
            </button>
            <button
              onClick={() => setActiveView('resident')}
              className={`flex-1 py-2 rounded-xl transition ${
                activeView === 'resident' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'
              }`}
            >
              Resident
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`flex-1 py-2 rounded-xl transition ${
                activeView === 'admin' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <FirebaseSettingsModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        currentSyncMode={syncMode}
      />

      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={language}
        setLanguage={setLanguage}
        autoAnnounce={autoAnnounce}
        setAutoAnnounce={setAutoAnnounce}
      />
    </div>
  );
}
