import React, { useState, useEffect } from 'react';
import { AppScreen } from './types';
import { useTrial } from './hooks/useTrial';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import DiscoverScreen from './components/screens/DiscoverScreen';
import ChatScreen from './components/screens/ChatScreen';
import MatchesScreen from './components/screens/MatchesScreen';
import LoginScreen from './components/screens/LoginScreen';
import BottomNav from './components/BottomNav';
import PremiumButton from './components/PremiumButton';
import PremiumModal from './components/PremiumModal';
import TrialReminder from './components/TrialReminder';
import { UserCircleIcon } from './components/icons';

const PlaceholderScreen = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
        <div className="text-pink-400 mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p>Esta funcionalidade está em desenvolvimento.</p>
    </div>
);

const AppContent = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.Discover);
  const { isTrialActive, daysRemaining, showReminder } = useTrial();
  const [showReminderUI, setShowReminderUI] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
     setShowReminderUI(showReminder);
  }, [showReminder]);
  
  // Request geolocation for Crush Radar feature
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Geolocation acquired:", position.coords);
      },
      (error) => {
        console.warn("Geolocation permission denied:", error.message);
      }
    );
  }, []);
  
  // If no user is logged in, show the Login screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Main application content for logged-in users
  const renderScreen = () => {
    switch (activeScreen) {
      case AppScreen.Discover:
        return <DiscoverScreen />;
      case AppScreen.Chat:
        return <ChatScreen />;
      case AppScreen.Matches:
          return <MatchesScreen />;
      case AppScreen.Profile:
          return <PlaceholderScreen title="Perfil" icon={<UserCircleIcon className="w-16 h-16"/>} />;
      default:
        return <DiscoverScreen />;
    }
  };

  return (
    <>
        {!isTrialActive && <PremiumModal />}
        {showReminderUI && <TrialReminder daysRemaining={daysRemaining} onDismiss={() => setShowReminderUI(false)} />}
        
        <div className="h-full w-full">
            {renderScreen()}
        </div>

        <PremiumButton />
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </>
  );
}


export default function App() {
  return (
    <main className="bg-slate-900 text-white h-screen w-screen overflow-hidden font-sans">
        <div className="max-w-md mx-auto h-full relative bg-slate-800/50">
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </div>
    </main>
  );
}