/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './pages/LandingPage';
import { TripPage } from './pages/TripPage';
import { ExplorePage } from './pages/ExplorePage';
import { MapPage } from './pages/MapPage';
import { EVisaPage } from './pages/EVisaPage';
import { AssistantPage } from './pages/AssistantPage';
import { SharedTripPage } from './pages/SharedTripPage';
import { LocalExperiencesPage } from './pages/LocalExperiencesPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { WhatsNewModal } from './components/WhatsNewModal';
import { Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // We can still support these custom events for components that might emit them,
    // translating them into history operations
    const handleNavToTrip = () => navigate('/app');
    const handleNavToExplore = () => navigate('/explore');
    const handleNavToMap = () => navigate('/map');
    const handleNavToAssistant = () => navigate('/assistant');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('navigate-to-trip', handleNavToTrip);
    window.addEventListener('navigate-to-explore', handleNavToExplore);
    window.addEventListener('navigate-to-map', handleNavToMap);
    window.addEventListener('navigate-to-assistant', handleNavToAssistant);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('navigate-to-trip', handleNavToTrip);
      window.removeEventListener('navigate-to-explore', handleNavToExplore);
      window.removeEventListener('navigate-to-map', handleNavToMap);
      window.removeEventListener('navigate-to-assistant', handleNavToAssistant);
    };
  }, [navigate]);

  return (
    <div className={`bg-slate-50 min-h-screen relative w-full h-full flex flex-col ${location.pathname !== '/' ? 'overflow-hidden' : 'overflow-x-hidden'}`}>
       {!isOnline && (
        <div className="bg-red-500 text-white text-xs font-bold py-1 px-4 flex justify-center items-center gap-2 z-[100] relative drop-shadow-md">
          <WifiOff size={14} /> Offline Mode - You can still view saved trips
        </div>
       )}
       {/* Use a mobile wrapper for desktop view to simulate a mobile app layout */}
       <Routes>
         <Route path="/" element={<LandingPage />} />
         <Route path="/trip" element={<Navigate to="/" replace />} />
         <Route path="/app" element={<TripPage />} />
         <Route path="/explore" element={<ExplorePage />} />
         <Route path="/map" element={<MapPage />} />
         <Route path="/evisa" element={<EVisaPage />} />
         <Route path="/assistant" element={<AssistantPage />} />
         <Route path="/shared-trip" element={<SharedTripPage />} />
         <Route path="/local-experiences" element={<LocalExperiencesPage />} />
         <Route path="/profile" element={<ProfileSettingsPage />} />
       </Routes>
       {location.pathname !== '/' && (
         <React.Fragment>
           <WhatsNewModal />
           <BottomNav />
         </React.Fragment>
       )}
    </div>
  );
}
