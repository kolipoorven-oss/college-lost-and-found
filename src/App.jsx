import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Navigation */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage
            setActivePage={setActivePage}
            setSelectedItem={setSelectedItem}
            setFilterState={setFilterState}
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
      <Footer setActivePage={setActivePage} />

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
