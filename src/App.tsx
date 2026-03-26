import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { CurrentClusterProvider } from './context/CurrentClusterContext';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import ClusterPage from './components/attitudes/ClusterPage';
import MobilityPage from './components/mobility/MobilityPage';
import AVPage from './components/av/AVPage';
import Home from './components/Home/Home';
import About from './components/About/About';
import './App.css';

// Adds/removes `is-dashboard` on body so overflow-y:hidden applies only on chart pages
function BodyClassManager() {
  const loc = useLocation();
  useEffect(() => {
    if (loc.pathname.startsWith('/attitudes') || loc.pathname.startsWith('/mobility') || loc.pathname.startsWith('/av')) {
      document.body.classList.add('is-dashboard');
    } else {
      document.body.classList.remove('is-dashboard');
    }
    return () => { document.body.classList.remove('is-dashboard'); };
  }, [loc.pathname]);
  return null;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <div className="main-area">
          {children}
        </div>
      </div>
    </div>
  );
}

function SimplePage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="simple-page-content">
        {children}
      </div>
    </>
  );
}

function AppRoutes() {
  return (
    <>
      <BodyClassManager />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<SimplePage><Home /></SimplePage>} />
        <Route path="/about" element={<SimplePage><About /></SimplePage>} />
        <Route
          path="/attitudes/:cluster"
          element={<DashboardLayout><ClusterPage /></DashboardLayout>}
        />
        <Route
          path="/mobility/:section"
          element={<DashboardLayout><MobilityPage /></DashboardLayout>}
        />
        <Route
          path="/av/:section"
          element={<DashboardLayout><AVPage /></DashboardLayout>}
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

const App: React.FC = () => (
  <HashRouter>
    <FilterProvider>
      <CurrentClusterProvider>
        <AppRoutes />
      </CurrentClusterProvider>
    </FilterProvider>
  </HashRouter>
);

export default App;
