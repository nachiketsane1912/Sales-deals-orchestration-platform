import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen, Onboarding } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { DealRoomView } from './components/DealRoom';
import { Layout } from './components/Layout';

const AppContent: React.FC = () => {
  const { isAuthenticated, isOnboarded } = useApp();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // AE Onboarding Flow
  if (!isOnboarded && window.location.hash !== '#/onboarding') {
      // Force onboarding for new AEs if not onboarded (User story 3)
      // Note: Stakeholder logic handled in Login via invite hack, but for simplicity we rely on 'isOnboarded' state
      // Real app would have per-user onboarding flags
      return <Onboarding />;
  }

  // Routing
  const getPage = () => {
      if (currentRoute.startsWith('#/room/')) {
          const roomId = currentRoute.split('#/room/')[1];
          return <DealRoomView roomId={roomId} />;
      }
      return <Dashboard />; // Default
  };

  return (
    <Layout>
      {getPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
