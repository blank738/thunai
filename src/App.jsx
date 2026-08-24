import React, { useState, useEffect } from 'react';
import { Compass, Bell, Sun, Moon, Users, LogIn, UserPlus, Heart, MapPin, Gift, HandHelping, HomeIcon, Truck, ShieldCheck, ChevronDown, CheckCircle2, Shield, LogOut } from 'lucide-react';
import { initDB, getData } from './services/db';
import Home from './components/Home';
import MapPage from './components/MapPage';
import DonorDashboard from './components/DonorDashboard';
import NgoDashboard from './components/NgoDashboard';
import OrphanageDashboard from './components/OrphanageDashboard';
import AdminDashboard from './components/AdminDashboard';
import NotificationDrawer from './components/NotificationDrawer';
import AuthModal from './components/AuthModal';

export default function App() {
  // Initialize Database on startup
  useEffect(() => {
    initDB();
  }, []);

  // Application routing and auth states
  const [role, setRole] = useState('donor'); // donor, ngo, orphanage, admin
  const [currentUserId, setCurrentUserId] = useState('usr_donor1');
  const [page, setPage] = useState('home'); // home, map, profile
  const [theme, setTheme] = useState('light');

  // Modals & Drawers
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
  }, [role, page, currentUserId]);

  // Set HTML theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Keep currentUserId in sync when role changes
  useEffect(() => {
    const users = getData('thunai_users');
    const matched = users.find(u => u.role === role);
    if (matched) {
      setCurrentUserId(matched.id);
    }
  }, [role]);

  // Active User Info Helper
  const getActiveUserInfo = () => {
    const users = getData('thunai_users');
    const user = users.find(u => u.id === currentUserId) || users.find(u => u.role === role) || { name: 'Community Member' };

    let roleLabel = 'Donor';
    let roleIcon = '🍱';
    let badgeColor = 'var(--primary)';

    if (role === 'orphanage') {
      roleLabel = 'Orphanage Home';
      roleIcon = '🏠';
      badgeColor = 'var(--secondary)';
    } else if (role === 'ngo') {
      roleLabel = 'NGO Transport Bridge';
      roleIcon = '🚐';
      badgeColor = 'var(--accent)';
    } else if (role === 'admin') {
      roleLabel = 'System Administrator';
      roleIcon = '🛡️';
      badgeColor = '#475569';
    }

    return { user, roleLabel, roleIcon, badgeColor };
  };

  const activeInfo = getActiveUserInfo();

  const getUnreadNotifCount = () => {
    return notifications.filter(n => n.user_id === currentUserId && n.status === 'unread').length;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 2. MAIN HEADER / NAVIGATION BAR (LANDING PAGE ONLY) */}
      {page === 'home' ? (
        <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container flex-between" style={{ height: '72px' }}>

            {/* Logo Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setPage('home')}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: '#0D9488',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--primary-glow)',
                fontWeight: 800,
                fontSize: '1.35rem'
              }}>
                🤝
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h2 style={{ fontSize: '1.35rem', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>THUNAI</h2>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>துணை</span>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginTop: '-0.15rem' }}>
                  Connect. Collect. Deliver. Hope.
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="nav-links-desktop" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className={`nav-link btn-ghost btn-sm ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>
                Home
              </button>
              <button className={`nav-link btn-ghost btn-sm ${page === 'map' ? 'active' : ''}`} onClick={() => setPage('map')}>
                <MapPin size={15} /> Explore Map
              </button>
            </nav>

            {/* Controls, Auth & Notifications */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

              {/* Prominent Login / Sign In Button */}
              <button
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                onClick={() => setAuthModalOpen(true)}
              >
                <LogIn size={15} /> Sign In / Sign Up
              </button>

              {/* Notification Bell */}
              <div className="notification-bell" onClick={() => setNotifDrawerOpen(true)} title="View Notifications">
                <Bell size={20} className="text-secondary" />
                {getUnreadNotifCount() > 0 && (
                  <span className="notification-badge">{getUnreadNotifCount()}</span>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                title="Toggle Dark/Light Mode"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

            </div>

          </div>
        </header>
      ) : (
        /* DEDICATED APP HEADER FOR DASHBOARDS & MAP (NOT THE LANDING PAGE NAVBAR) */
        <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="container flex-between" style={{ height: '62px' }}>

            {/* Left: Back to Home & App Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, padding: '0.4rem 0.75rem', backgroundColor: 'var(--bg-tertiary)' }}
                onClick={() => setPage('home')}
              >
                <HomeIcon size={16} /> <span>← Back to Home</span>
              </button>

              <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setPage('home')}>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  🤝
                </div>
                <strong style={{ fontSize: '1.05rem', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>
                  THUNAI {page === 'map' ? '• Live Map' : `• ${activeInfo.roleLabel}`}
                </strong>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

              {/* Map / Dashboard Toggle Link */}
              {page === 'map' ? (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                  onClick={() => setPage('profile')}
                >
                  <span>{activeInfo.roleIcon}</span> Open Dashboard
                </button>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, border: '1px solid var(--border-color)' }}
                  onClick={() => setPage('map')}
                >
                  <MapPin size={15} /> Live Map
                </button>
              )}

              {/* Switch Role Button */}
              <button
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                onClick={() => setAuthModalOpen(true)}
              >
                <span>{activeInfo.roleIcon}</span> Switch Role
              </button>

              {/* Notification Bell */}
              <div className="notification-bell" onClick={() => setNotifDrawerOpen(true)} title="View Notifications">
                <Bell size={18} className="text-secondary" />
                {getUnreadNotifCount() > 0 && (
                  <span className="notification-badge">{getUnreadNotifCount()}</span>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                title="Toggle Dark/Light Mode"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

            </div>

          </div>
        </header>
      )}

      {/* 3. ACTIVE DASHBOARD PERSONA BANNER (DASHBOARD ONLY) */}
      {page === 'profile' && (
        <div style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 0' }}>
          <div className="container flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: activeInfo.badgeColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem' }}>
                {activeInfo.roleIcon}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Active Persona: {activeInfo.user.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Portal: <strong>{activeInfo.roleLabel}</strong> • Base: Trichy, Tamil Nadu
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
                onClick={() => setAuthModalOpen(true)}
              >
                Switch Account / Role
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                onClick={() => setPage('home')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 4. MAIN CONTENT DISPLAY */}
      <main style={{ flex: 1 }}>
        {page === 'home' && (
          <Home
            setRole={setRole}
            setPage={setPage}
            stats={stats}
            setStats={setStats}
            notifications={notifications}
            setNotifications={setNotifications}
            setAuthModalOpen={setAuthModalOpen}
          />
        )}

        {page === 'map' && <MapPage />}

        {page === 'profile' && (
          <>
            {role === 'donor' && (
              <DonorDashboard
                currentUserId={currentUserId}
                donations={donations}
                setDonations={setDonations}
                setNotifications={setNotifications}
                setStats={setStats}
              />
            )}
            {role === 'ngo' && (
              <NgoDashboard
                currentUserId={currentUserId}
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
                currentUserId={currentUserId}
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

      {/* 5. MOBILE BOTTOM NAVIGATION BAR */}
      <div className="mobile-nav">
        <button className={`mobile-nav-item btn-ghost ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>
          <HomeIcon size={20} />
          <span>Home</span>
        </button>
        <button className={`mobile-nav-item btn-ghost ${page === 'map' ? 'active' : ''}`} onClick={() => setPage('map')}>
          <Compass size={20} />
          <span>Nearby Map</span>
        </button>
        <button className={`mobile-nav-item btn-ghost ${page === 'profile' && role === 'donor' ? 'active' : ''}`} onClick={() => { setRole('donor'); setPage('profile'); }}>
          <Gift size={20} />
          <span>Donor</span>
        </button>
        <button className={`mobile-nav-item btn-ghost ${page === 'profile' && role === 'orphanage' ? 'active' : ''}`} onClick={() => { setRole('orphanage'); setPage('profile'); }}>
          <HandHelping size={20} />
          <span>Orphanage</span>
        </button>
        <button className={`mobile-nav-item btn-ghost ${page === 'profile' && role === 'ngo' ? 'active' : ''}`} onClick={() => { setRole('ngo'); setPage('profile'); }}>
          <Truck size={20} />
          <span>NGO</span>
        </button>
      </div>

      {/* 6. SLIDING NOTIFICATION DRAWER */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        currentUserId={currentUserId}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* 7. AUTHENTICATION & REGISTRATION MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentRole={role}
        setRole={setRole}
        setPage={setPage}
        currentUserId={currentUserId}
        setCurrentUserId={setCurrentUserId}
        refreshState={refreshStatePools}
      />

    </div>
  );
}

