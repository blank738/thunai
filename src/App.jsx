import React, { useState, useEffect } from 'react';
import { Compass, Bell, Sun, Moon, Users, LogIn, Heart, MapPin, Gift, HandHelping, HomeIcon } from 'lucide-react';
import { initDB, getData } from './services/db';
import Home from './components/Home';
import MapPage from './components/MapPage';
import DonorDashboard from './components/DonorDashboard';
import NgoDashboard from './components/NgoDashboard';
import OrphanageDashboard from './components/OrphanageDashboard';
import AdminDashboard from './components/AdminDashboard';
import NotificationDrawer from './components/NotificationDrawer';

export default function App() {
  // Initialize Database on startup
  useEffect(() => {
    initDB();
  }, []);

  // Application routing and simulation states
  const [role, setRole] = useState('donor'); // donor, ngo, orphanage, admin
  const [page, setPage] = useState('home'); // home, map, profile
  const [theme, setTheme] = useState('light');
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Synchronized state pools
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    verifiedNgos: 0,
    orphanages: 0,
    activeDonations: 0,
    activeDeliveries: 0,
    completedDonations: 0,
    foodSavedKg: 0,
    itemsDistributed: 0
  });

  // Pull database updates when tab or DB changes
  const refreshStatePools = () => {
    setDonations(getData('thunai_donations'));
    setRequests(getData('thunai_requests'));
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));
  };

  useEffect(() => {
    refreshStatePools();
  }, [role, page]);

  // Set HTML theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Get current active user ID based on chosen role for simulated dashboards
  const getCurrentUserId = () => {
    switch (role) {
      case 'donor': return 'usr_donor1';       // Trichy Grand Palace Hall
      case 'ngo': return 'usr_ngo1';           // CareConnect Foundation
      case 'orphanage': return 'usr_orphanage2'; // Hope Children Home
      case 'admin': return 'usr_admin';         // Thunai Admin
      default: return 'usr_donor1';
    }
  };

  const getUnreadNotifCount = () => {
    const userId = getCurrentUserId();
    return notifications.filter(n => n.user_id === userId && n.status === 'unread').length;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER / NAVIGATION BAR */}
      <header>
        <div className="container flex-between" style={{ height: '70px' }}>
          
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => setPage('home')}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: 'var(--radius-md)', 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px var(--primary-glow)',
              fontWeight: 800,
              fontSize: '1.25rem'
            }}>
              🤝
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>THUNAI</h2>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginTop: '-0.15rem' }}>
                BY HOPECIRCLE
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-links-desktop" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className={`nav-link btn-ghost btn-sm ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>
              Home
            </button>
            <button className={`nav-link btn-ghost btn-sm ${page === 'map' ? 'active' : ''}`} onClick={() => setPage('map')}>
              Explore Map
            </button>
            <button className={`nav-link btn-ghost btn-sm ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')}>
              My Dashboard
            </button>
          </nav>

          {/* Controls & Sim Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {/* Acting As Simulation Switcher */}
            <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTING AS:</span>
              <select 
                className="form-select" 
                style={{ padding: '0.15rem 1.5rem 0.15rem 0.5rem', fontSize: '0.75rem', width: '120px', border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--primary)' }}
                value={role}
                onChange={(e) => { setRole(e.target.value); setPage('profile'); }}
              >
                <option value="donor">👤 Donor</option>
                <option value="ngo">🚐 NGO Bridge</option>
                <option value="orphanage">🏠 Orphanage</option>
                <option value="admin">🔑 Admin</option>
              </select>
            </div>

            {/* Notification Bell */}
            <div className="notification-bell" onClick={() => setNotifDrawerOpen(true)}>
              <Bell size={20} className="text-secondary" />
              {getUnreadNotifCount() > 0 && <span className="notification-badge" />}
            </div>

            {/* Theme Toggle */}
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ padding: '0.4rem', borderRadius: '50%' }}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT DISPLAY */}
      <main style={{ flex: 1 }}>
        {page === 'home' && (
          <Home 
            setRole={setRole} 
            setPage={setPage} 
            stats={stats} 
            setStats={setStats} 
            notifications={notifications} 
            setNotifications={setNotifications} 
          />
        )}
        
        {page === 'map' && <MapPage />}

        {page === 'profile' && (
          <>
            {role === 'donor' && (
              <DonorDashboard 
                currentUserId={getCurrentUserId()} 
                donations={donations} 
                setDonations={setDonations} 
                setNotifications={setNotifications}
                setStats={setStats}
              />
            )}
            {role === 'ngo' && (
              <NgoDashboard 
                currentUserId={getCurrentUserId()} 
                donations={donations} 
                setDonations={setDonations} 
                notifications={notifications}
                setNotifications={setNotifications}
                stats={stats}
                setStats={setStats}
              />
            )}
            {role === 'orphanage' && (
              <OrphanageDashboard 
                currentUserId={getCurrentUserId()} 
                requests={requests} 
                setRequests={setRequests} 
                setNotifications={setNotifications}
                setStats={setStats}
              />
            )}
            {role === 'admin' && (
              <AdminDashboard 
                stats={stats} 
                setStats={setStats} 
                setNotifications={setNotifications}
                setRequests={setRequests}
                setDonations={setDonations}
              />
            )}
          </>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="mobile-nav">
        <button className={`mobile-nav-item btn-ghost ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>
          <HomeIcon size={20} />
          <span>Home</span>
        </button>
        <button className={`mobile-nav-item btn-ghost ${page === 'map' ? 'active' : ''}`} onClick={() => setPage('map')}>
          <Compass size={20} />
          <span>Nearby</span>
        </button>
        <button className="mobile-nav-item btn-ghost" onClick={() => { setRole('donor'); setPage('profile'); }}>
          <Gift size={20} />
          <span>Donate</span>
        </button>
        <button className="mobile-nav-item btn-ghost" onClick={() => { setRole('orphanage'); setPage('profile'); }}>
          <HandHelping size={20} />
          <span>Requests</span>
        </button>
        <button className={`mobile-nav-item btn-ghost ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')}>
          <Users size={20} />
          <span>Profile</span>
        </button>
      </div>

      {/* SLIDING NOTIFICATION DRAWER */}
      <NotificationDrawer 
        isOpen={notifDrawerOpen} 
        onClose={() => setNotifDrawerOpen(false)} 
        currentUserId={getCurrentUserId()} 
        notifications={notifications} 
        setNotifications={setNotifications}
      />

    </div>
  );
}
