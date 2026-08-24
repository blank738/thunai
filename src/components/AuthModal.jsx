import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldCheck, Home, Gift, Truck, Shield, CheckCircle, ArrowRight, MapPin, Phone, Mail, Lock, Building, Users } from 'lucide-react';
import { getData, saveData, playNotificationSound } from '../services/db';

export default function AuthModal({ isOpen, onClose, currentRole, setRole, setPage, currentUserId, setCurrentUserId, refreshState }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [selectedRoleType, setSelectedRoleType] = useState('orphanage'); // 'orphanage', 'donor', 'ngo', 'admin'
  
  // Login fields
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regContactPerson, setRegContactPerson] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regZone, setRegZone] = useState('center'); // center, east, west, south
  const [regChildrenCount, setRegChildrenCount] = useState('45'); // for orphanage
  const [regTransportType, setRegTransportType] = useState('Van, Car'); // for NGO
  const [regRadius, setRegRadius] = useState(15); // for NGO
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const locationPresets = {
    center: { lat: 10.7920, lng: 78.6980, name: 'Cantonment Central, Trichy' },
    west: { lat: 10.7990, lng: 78.6850, name: 'Thillai Nagar, Trichy' },
    south: { lat: 10.7800, lng: 78.7050, name: 'K K Nagar, Trichy' },
    east: { lat: 10.8120, lng: 78.7150, name: 'Kailasapuram / BHEL, Trichy' }
  };

  // Predefined Demo Accounts
  const demoAccounts = {
    orphanage: [
      { id: 'usr_orphanage2', name: 'Hope Children Home', details: 'Sheltering 45 Children • KK Nagar, Trichy', badge: 'Verified Home' },
      { id: 'usr_orphanage1', name: 'Little Stars Children Home', details: 'Sheltering 35 Children • Cantonment, Trichy', badge: 'Verified Home' },
      { id: 'usr_orphanage3', name: 'Bright Future Home', details: 'Sheltering 60 Children • Thillai Nagar, Trichy', badge: 'Verified Home' }
    ],
    donor: [
      { id: 'usr_donor1', name: 'Trichy Grand Palace Banquet Hall', details: 'Wedding & Event Catering • Cantonment', badge: 'Verified Donor' },
      { id: 'usr_donor2', name: 'Apex Stationery & Books Mart', details: 'Educational Wholesale • Thillai Nagar', badge: 'Verified Donor' },
      { id: 'usr_donor3', name: 'Ananya Krishnan (Individual)', details: 'Community Contributor • KK Nagar', badge: 'Verified Donor' }
    ],
    ngo: [
      { id: 'usr_ngo1', name: 'CareConnect Foundation', details: 'Fleet: Van, Car • 15 km Radius • Trichy', badge: 'Verified Logistics NGO' },
      { id: 'usr_ngo2', name: 'HopeBridge NGO Trichy', details: 'Fleet: 2 Vans, 3 Two-Wheelers • 20 km Radius', badge: 'Verified Logistics NGO' }
    ],
    admin: [
      { id: 'usr_admin', name: 'THUNAI Central Platform Admin', details: 'System Audit, Verification & Ledger', badge: 'System Administrator' }
    ]
  };

  // Handle Quick Demo Login
  const handleQuickLogin = (accId, roleType) => {
    setRole(roleType);
    if (setCurrentUserId) setCurrentUserId(accId);
    setPage('profile');
    playNotificationSound('success');
    onClose();
  };

  // Handle Standard Login Form
  const handleLoginFormSubmit = (e) => {
    e.preventDefault();
    // For demo purposes, pick the first user matching role or credentials
    const users = getData('thunai_users');
    const matched = users.find(u => u.role === selectedRoleType) || users[0];
    
    setRole(selectedRoleType);
    if (setCurrentUserId && matched) setCurrentUserId(matched.id);
    setPage('profile');
    playNotificationSound('success');
    alert(`✅ Logged in successfully as ${matched?.name || selectedRoleType.toUpperCase()}!`);
    onClose();
  };

  // Handle New Organization / User Registration
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regPhone) {
      alert('Please fill in your organization / user name and phone number.');
      return;
    }

    const loc = locationPresets[regZone];
    const newUserId = `usr_${selectedRoleType}_${Date.now()}`;

    // 1. Create User in thunai_users
    const users = getData('thunai_users');
    const newUser = {
      id: newUserId,
      name: regName,
      role: selectedRoleType,
      phone: regPhone,
      email: regEmail || `${regName.toLowerCase().replace(/\s+/g, '')}@thunai.org`,
      location: { lat: loc.lat, lng: loc.lng }
    };
    users.push(newUser);
    saveData('thunai_users', users);

    // 2. If Orphanage, create in thunai_orphanages
    if (selectedRoleType === 'orphanage') {
      const orphanages = getData('thunai_orphanages');
      orphanages.push({
        id: `orph_${Date.now()}`,
        user_id: newUserId,
        name: regName,
        children_count: parseInt(regChildrenCount || '45'),
        location: { lat: loc.lat, lng: loc.lng },
        contact: `${regContactPerson || 'Superintendent'} (${regPhone})`,
        address: `${loc.name}`,
        description: `Shelter caring for ${regChildrenCount || '45'} children with educational and dietary support.`,
        verification_status: 'verified' // Pre-verified for seamless testing
      });
      saveData('thunai_orphanages', orphanages);
    }

    // 3. If NGO, create in thunai_ngos
    if (selectedRoleType === 'ngo') {
      const ngos = getData('thunai_ngos');
      ngos.push({
        id: `ngo_${Date.now()}`,
        user_id: newUserId,
        name: regName,
        location: { lat: loc.lat, lng: loc.lng },
        service_radius: parseInt(regRadius || '15'),
        transport_type: regTransportType || 'Van, Car',
        contact: `${regContactPerson || 'Fleet Coordinator'} (${regPhone})`,
        description: `Verified NGO transport partner operating in ${loc.name}.`,
        verification_status: 'verified',
        completed_deliveries_count: 0
      });
      saveData('thunai_ngos', ngos);
    }

    // Trigger state refresh
    if (refreshState) refreshState();
    setRole(selectedRoleType);
    if (setCurrentUserId) setCurrentUserId(newUserId);
    setPage('profile');
    playNotificationSound('success');
    alert(`🎉 Registration complete! Welcome ${regName} to THUNAI.`);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      overflowY: 'auto'
    }}>
      <div className="card animate-slide-up" style={{ 
        maxWidth: '680px', 
        width: '100%', 
        padding: '2rem', 
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-secondary)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        
        {/* Close Button */}
        <button 
          className="btn btn-ghost btn-sm" 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', padding: '0.4rem', borderRadius: '50%' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: 'var(--radius-md)', 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '0.5rem',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            🤝
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif' }}>
            {authMode === 'login' ? 'Sign In to THUNAI' : 'Create a Free Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {authMode === 'login' ? 'Select your role to access your dedicated portal or use 1-Click fast login.' : 'Join the Trichy social logistics network as an Orphanage, Donor, or NGO.'}
          </p>
        </div>

        {/* Auth Mode Toggle (Login vs Register) */}
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.25rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-tertiary)' }}>
          <button 
            type="button"
            className="btn btn-sm"
            style={{ 
              flex: 1, 
              backgroundColor: authMode === 'login' ? 'var(--primary)' : 'transparent', 
              color: authMode === 'login' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700 
            }}
            onClick={() => setAuthMode('login')}
          >
            <LogIn size={15} /> 1. Sign In (Existing Accounts)
          </button>
          <button 
            type="button"
            className="btn btn-sm"
            style={{ 
              flex: 1, 
              backgroundColor: authMode === 'register' ? 'var(--secondary)' : 'transparent', 
              color: authMode === 'register' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700 
            }}
            onClick={() => setAuthMode('register')}
          >
            <UserPlus size={15} /> 2. Register (New User / Home / NGO)
          </button>
        </div>

        {/* Role Type Selector Pills */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
            Select Account Role:
          </span>
          <div className="grid-4" style={{ gap: '0.5rem' }}>
            
            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: selectedRoleType === 'orphanage' ? 'var(--secondary)' : 'var(--bg-tertiary)',
                color: selectedRoleType === 'orphanage' ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                flexDirection: 'column',
                padding: '0.65rem 0.25rem',
                height: 'auto',
                fontWeight: 700
              }}
              onClick={() => setSelectedRoleType('orphanage')}
            >
              <Home size={18} />
              <span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Orphanage</span>
            </button>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: selectedRoleType === 'donor' ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: selectedRoleType === 'donor' ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                flexDirection: 'column',
                padding: '0.65rem 0.25rem',
                height: 'auto',
                fontWeight: 700
              }}
              onClick={() => setSelectedRoleType('donor')}
            >
              <Gift size={18} />
              <span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Donor</span>
            </button>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: selectedRoleType === 'ngo' ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: selectedRoleType === 'ngo' ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                flexDirection: 'column',
                padding: '0.65rem 0.25rem',
                height: 'auto',
                fontWeight: 700
              }}
              onClick={() => setSelectedRoleType('ngo')}
            >
              <Truck size={18} />
              <span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>NGO Fleet</span>
            </button>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: selectedRoleType === 'admin' ? '#475569' : 'var(--bg-tertiary)',
                color: selectedRoleType === 'admin' ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                flexDirection: 'column',
                padding: '0.65rem 0.25rem',
                height: 'auto',
                fontWeight: 700
              }}
              onClick={() => setSelectedRoleType('admin')}
            >
              <Shield size={18} />
              <span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Admin</span>
            </button>

          </div>
        </div>

        {/* TAB 1: LOGIN CONTENT */}
        {authMode === 'login' && (
          <div>
            
            {/* Quick 1-Click Demo Logins Banner */}
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  ⚡ Instant 1-Click Demo Accounts ({selectedRoleType.toUpperCase()}):
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Click to access</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {demoAccounts[selectedRoleType]?.map(acc => (
                  <div 
                    key={acc.id}
                    className="card"
                    style={{ 
                      padding: '0.75rem 1rem', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => handleQuickLogin(acc.id, selectedRoleType)}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{acc.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{acc.details}</div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                      {acc.badge} ➔
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traditional Login Form */}
            <form onSubmit={handleLoginFormSubmit}>
              <div className="form-group">
                <label className="form-label">Phone Number or Registered Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder={`e.g. contact@${selectedRoleType}.org or +91 98765 43210`} 
                    className="form-input" 
                    style={{ paddingLeft: '32px' }}
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password / Security PIN</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="form-input" 
                    style={{ paddingLeft: '32px' }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.5rem' }}
              >
                Log In to {selectedRoleType.toUpperCase()} Portal
              </button>
            </form>

          </div>
        )}

        {/* TAB 2: NEW USER / ORG REGISTRATION CONTENT */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--primary-border)', fontSize: '0.8rem', color: 'var(--primary)' }}>
              <strong>Registering as: {selectedRoleType.toUpperCase()}</strong> — Fill in your details to immediately begin posting or claiming donations in Trichy.
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  {selectedRoleType === 'orphanage' ? 'Orphanage / Shelter Name' : selectedRoleType === 'ngo' ? 'NGO / Trust Name' : 'Donor / Business / Name'}
                </label>
                <input 
                  type="text" 
                  placeholder={selectedRoleType === 'orphanage' ? 'e.g. St. Joseph Children Home' : selectedRoleType === 'ngo' ? 'e.g. Trichy Seva Foundation' : 'e.g. Hotel Sangam / Rajesh K.'}
                  className="form-input" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sister Maria (Superintendent)" 
                  className="form-input" 
                  value={regContactPerson}
                  onChange={(e) => setRegContactPerson(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Mobile Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 98424 12345" 
                  className="form-input" 
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input 
                  type="email" 
                  placeholder="e.g. info@organization.org" 
                  className="form-input" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Trichy Geographical Zone</label>
                <select className="form-select" value={regZone} onChange={(e) => setRegZone(e.target.value)}>
                  <option value="center">Trichy City Center (Cantonment)</option>
                  <option value="west">West Trichy (Thillai Nagar)</option>
                  <option value="south">South Trichy (K K Nagar)</option>
                  <option value="east">East Trichy (Kailasapuram / BHEL)</option>
                </select>
              </div>

              {selectedRoleType === 'orphanage' && (
                <div className="form-group">
                  <label className="form-label">Resident Children Sheltered</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 45" 
                    className="form-input" 
                    value={regChildrenCount}
                    onChange={(e) => setRegChildrenCount(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              )}

              {selectedRoleType === 'ngo' && (
                <div className="form-group">
                  <label className="form-label">Available Transport Fleet</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1 Van, 2 Two-Wheelers" 
                    className="form-input" 
                    value={regTransportType}
                    onChange={(e) => setRegTransportType(e.target.value)}
                    required
                  />
                </div>
              )}

              {selectedRoleType === 'donor' && (
                <div className="form-group">
                  <label className="form-label">Primary Donation Type</label>
                  <select className="form-select">
                    <option value="food">🍱 Surplus Food / Catering</option>
                    <option value="stationery">📚 Books & School Stationery</option>
                    <option value="clothes">👕 Clothes & Blankets</option>
                    <option value="all">🌟 All Essential Resources</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Set Account Password</label>
              <input 
                type="password" 
                placeholder="Create a secure password" 
                className="form-input" 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.5rem' }}
            >
              Complete Registration & Access Dashboard
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
