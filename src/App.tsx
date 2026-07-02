import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewReport from './pages/NewReport';
import ReportsList from './pages/ReportsList';
import SettingsPage from './pages/SettingsPage';
import { dbManager } from './db/dbManager';

// Inner component to access router location hooks safely
function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('lab_current_user'));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine current header title based on location pathname
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Diagnostic Workspace Dashboard';
    if (path.startsWith('/new-report')) return 'Clinical Intake Wizard';
    if (path.startsWith('/reports')) return 'Electronic Patient Registry';
    if (path.startsWith('/settings')) return 'Laboratory Profile Config';
    return 'LIMS Workspace';
  };

  const handleLogout = () => {
    dbManager.logout();
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // If not authenticated, render Login independently (with full viewport screen)
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dynamic header */}
        <Header 
          title={getHeaderTitle()} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />

        {/* Workspace views */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-report" element={<NewReport />} />
            <Route path="/reports" element={<ReportsList />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
