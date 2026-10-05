import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import MobileBottomNav from './components/MobileBottomNav';
import CampusRadarWidget from './components/CampusRadarWidget';

// Pages
import LandingPage from './pages/LandingPage';
import BrowsePage from './pages/BrowsePage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReportItemPage from './pages/ReportItemPage';
import MyReportsPage from './pages/MyReportsPage';
import MessagesPage from './pages/MessagesPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AppContent() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [activePage, setActivePage] = useState('landing');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterState, setFilterState] = useState({
    type: 'all',
    category: 'All',
    location: 'All',
    status: 'active',
    q: '',
    dateFrom: '',
    dateTo: '',
    sort: 'newest'
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* God-Mode Creative Holographic Radar Preloader */}
      {showPreloader && (
        <Preloader onComplete={() => setShowPreloader(false)} />
      )}

      {/* Top Desktop & Tablet Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onTriggerPreloader={() => setShowPreloader(true)}
      />

      {/* Main Content Area (with responsive bottom padding on mobile for the bottom bar) */}
      <main className="flex-1 pb-20 md:pb-0">
        {activePage === 'landing' && (
          <LandingPage
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
            setFilterState={setFilterState}
            onTriggerPreloader={() => setShowPreloader(true)}
          />
        )}

        {activePage === 'browse' && (
          <BrowsePage
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
            filterState={filterState}
            setFilterState={setFilterState}
          />
        )}

        {activePage === 'item-detail' && (
          <ItemDetailPage
            itemId={selectedItem?.id}
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
          />
        )}

        {activePage === 'report-lost' && (
          <ReportItemPage
            initialType="lost"
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
          />
        )}

        {activePage === 'report-found' && (
          <ReportItemPage
            initialType="found"
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
          />
        )}

        {activePage === 'my-reports' && (
          <MyReportsPage
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
          />
        )}

        {activePage === 'messages' && (
          <MessagesPage
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboardPage
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
          />
        )}

        {activePage === 'login' && (
          <LoginPage setActivePage={setActivePage} />
        )}

        {activePage === 'register' && (
          <RegisterPage setActivePage={setActivePage} />
        )}
      </main>

      {/* Campus Portal Footer */}
      <Footer 
        setActivePage={setActivePage} 
        onTriggerPreloader={() => setShowPreloader(true)}
      />

      {/* Floating Smart Radar AI Widget */}
      <CampusRadarWidget 
        onTriggerPreloader={() => setShowPreloader(true)}
        setActivePage={setActivePage}
      />

      {/* Native-App Feel Mobile Bottom Navigation (Mobiles & Mini Phones) */}
      <MobileBottomNav 
        activePage={activePage} 
        setActivePage={setActivePage} 
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
