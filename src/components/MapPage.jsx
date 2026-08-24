import React, { useState } from 'react';
import { MapPin, Navigation, Search, Filter, ShieldCheck, Heart, Truck, Home, AlertCircle, Info, Compass, Layers, CheckCircle } from 'lucide-react';
import { getData, MAP_CENTER, getDistance } from '../services/db';

export default function MapPage() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [filterRadius, setFilterRadius] = useState(25); // km
  const [searchQuery, setSearchQuery] = useState('');
  const [showDonors, setShowDonors] = useState(true);
  const [showNgos, setShowNgos] = useState(true);
  const [showOrphanages, setShowOrphanages] = useState(true);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [selectedMatchRoute, setSelectedMatchRoute] = useState(null);

  // Fetch all entities
  const users = getData('thunai_users');
  const ngos = getData('thunai_ngos');
  const orphanages = getData('thunai_orphanages');
  const donations = getData('thunai_donations');
  const requests = getData('thunai_requests');
  const matches = getData('thunai_matches');

  // Map Bounds for SVG coordinates translation (Trichy scope)
  const MAP_BOUNDS = {
    minLat: 10.7500,
    maxLat: 10.8400,
    minLng: 78.6500,
    maxLng: 78.7400
  };

  // Convert geo-coordinates to SVG coordinate space (800x600)
  const projectCoordinates = (lat, lng) => {
    const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 800;
    const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 600;
    return { x: Math.max(40, Math.min(760, x)), y: Math.max(40, Math.min(560, y)) };
  };

  // Build entity markers
  const markers = [];

  // Donors
  if (showDonors) {
    users.filter(u => u.role === 'donor').forEach(donor => {
      const activeDonations = donations.filter(d => d.donor_id === donor.id && d.status !== 'Confirmed');
      const isUrgent = activeDonations.some(d => d.priority === 'Urgent');
      if (showUrgentOnly && !isUrgent) return;

      const dist = getDistance(MAP_CENTER.lat, MAP_CENTER.lng, donor.location.lat, donor.location.lng);
      if (dist <= filterRadius) {
        markers.push({
          id: `donor-${donor.id}`,
          type: 'donor',
          name: donor.name,
          roleTitle: 'Surplus Donor',
          location: donor.location,
          distance: dist,
          isUrgent,
          phone: donor.phone,
          details: activeDonations.length > 0 ? `${activeDonations.length} Active Donation Offers` : 'Registered Community Donor',
          activeItems: activeDonations,
          color: isUrgent ? '#ef4444' : '#0284c7'
        });
      }
    });
  }

  // NGOs
  if (showNgos && !showUrgentOnly) {
    ngos.forEach(ngo => {
      const dist = getDistance(MAP_CENTER.lat, MAP_CENTER.lng, ngo.location.lat, ngo.location.lng);
      if (dist <= filterRadius) {
        markers.push({
          id: `ngo-${ngo.id}`,
          type: 'ngo',
          name: ngo.name,
          roleTitle: 'Verified NGO Coordination Bridge',
          location: ngo.location,
          distance: dist,
          phone: ngo.contact,
          details: `Fleet: ${ngo.transport_type} | Range: ${ngo.service_radius} km`,
          verified: ngo.verification_status === 'verified',
          color: '#10b981'
        });
      }
    });
  }

  // Orphanages
  if (showOrphanages) {
    orphanages.forEach(orph => {
      const activeReqs = requests.filter(r => r.orphanage_id === orph.id && r.status !== 'Fulfilled');
      const isUrgent = activeReqs.some(r => r.priority === 'Urgent');
      if (showUrgentOnly && !isUrgent) return;

      const dist = getDistance(MAP_CENTER.lat, MAP_CENTER.lng, orph.location.lat, orph.location.lng);
      if (dist <= filterRadius) {
        markers.push({
          id: `orph-${orph.id}`,
          type: 'orphanage',
          name: orph.name,
          roleTitle: 'Children Orphanage Home',
          location: orph.location,
          distance: dist,
          isUrgent,
          phone: orph.contact,
          details: `Sheltering ${orph.children_count} Children | ${activeReqs.length} Active Needs`,
          activeItems: activeReqs,
          verified: orph.verification_status === 'verified',
          color: isUrgent ? '#ef4444' : '#f97316'
        });
      }
    });
  }

  // Filter markers by search query
  const filteredMarkers = markers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Route Line generation for active matches
  const activeMatches = matches.filter(m => m.status !== 'Declined' && m.status !== 'Confirmed');

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderLeft: '5px solid var(--primary)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Geospatial Network
          </span>
          <h2 style={{ fontSize: '1.85rem', marginTop: '0.25rem', fontFamily: 'Outfit, sans-serif' }}>Trichy Smart Resource Map</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Real-time visual routing across Donors, NGOs, and Orphanages in Tiruchirappalli, Tamil Nadu.
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#0284c7' }} />
            <span>Donors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>NGO Bridges</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#f97316' }} />
            <span>Orphanages</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span>🔴 Urgent SOS</span>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search donor, NGO, or orphanage name..." 
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Distance Range Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '220px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Distance Radius:</span>
          <select className="form-select" value={filterRadius} onChange={(e) => setFilterRadius(parseInt(e.target.value))} style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>
            <option value="2">Within 2 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Entire Trichy (25 km)</option>
          </select>
        </div>

        {/* Type Toggles */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showDonors} onChange={(e) => setShowDonors(e.target.checked)} className="form-checkbox" />
            <span>Donors</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showNgos} onChange={(e) => setShowNgos(e.target.checked)} className="form-checkbox" />
            <span>NGOs</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showOrphanages} onChange={(e) => setShowOrphanages(e.target.checked)} className="form-checkbox" />
            <span>Orphanages</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}>
            <input type="checkbox" checked={showUrgentOnly} onChange={(e) => setShowUrgentOnly(e.target.checked)} className="form-checkbox" />
            <span>Urgent Only</span>
          </label>
        </div>
      </div>

      {/* Main Map View Container */}
      <div style={{ position: 'relative', width: '100%', height: '580px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
        
        {/* SVG Interactive Map */}
        <svg 
          viewBox="0 0 800 600" 
          style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(13,148,136,0.08) 0%, rgba(15,23,42,0.03) 100%)' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-color)" strokeWidth="0.75" opacity="0.6" />
            </pattern>
            {/* Animated Pulse Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="800" height="600" fill="url(#grid)" />

          {/* Kaveri River Ribbon Landmark */}
          <path 
            d="M 0,160 Q 200,190 400,170 T 800,140" 
            fill="none" 
            stroke="rgba(56, 189, 248, 0.45)" 
            strokeWidth="28" 
            strokeLinecap="round"
          />
          <text x="320" y="165" fill="#0284c7" fontSize="11" fontWeight="700" letterSpacing="2" opacity="0.8">
            KAVERI RIVER (TRICHY)
          </text>

          {/* Landmark Labels */}
          <g opacity="0.6" fontSize="11" fontWeight="600" fill="var(--text-muted)">
            <text x="440" y="240">🏛️ Rockfort Hill</text>
            <text x="210" y="320">📍 Thillai Nagar</text>
            <text x="380" y="380">🏢 Cantonment Central</text>
            <text x="590" y="360">🏭 Kailasapuram / BHEL</text>
            <text x="430" y="490">🌳 K K Nagar</text>
          </g>

          {/* Active Delivery Route Lines */}
          {activeMatches.map((m, idx) => {
            const don = donations.find(d => d.id === m.donation_id);
            const ngo = ngos.find(n => n.id === m.NGO_id);
            const orph = orphanages.find(o => o.id === m.orphanage_id);

            if (!don || !ngo || !orph) return null;

            const pDon = projectCoordinates(don.location.lat, don.location.lng);
            const pNgo = projectCoordinates(ngo.location.lat, ngo.location.lng);
            const pOrph = projectCoordinates(orph.location.lat, orph.location.lng);

            return (
              <g key={m.id || idx}>
                {/* Donor to NGO line */}
                <line 
                  x1={pDon.x} 
                  y1={pDon.y} 
                  x2={pNgo.x} 
                  y2={pNgo.y} 
                  stroke="#0284c7" 
                  strokeWidth="2" 
                  strokeDasharray="4,4"
                  opacity="0.75"
                />
                {/* NGO to Orphanage line */}
                <line 
                  x1={pNgo.x} 
                  y1={pNgo.y} 
                  x2={pOrph.x} 
                  y2={pOrph.y} 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeDasharray="5,5"
                  opacity="0.85"
                />
              </g>
            );
          })}

          {/* Interactive Entity Markers */}
          {filteredMarkers.map((m) => {
            const { x, y } = projectCoordinates(m.location.lat, m.location.lng);
            const isSelected = selectedEntity?.id === m.id;

            return (
              <g 
                key={m.id} 
                transform={`translate(${x}, ${y})`} 
                onClick={() => setSelectedEntity(m)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                {/* Outer Glow / Halo */}
                {m.isUrgent ? (
                  <circle r="22" fill="#ef4444" opacity="0.25" className="animate-pulse-slow" />
                ) : isSelected ? (
                  <circle r="20" fill={m.color} opacity="0.3" />
                ) : null}

                {/* Main Pin Circle */}
                <circle 
                  r={isSelected ? "14" : "11"} 
                  fill={m.color} 
                  stroke="#ffffff" 
                  strokeWidth="2.5"
                  filter={m.isUrgent ? "url(#glow)" : undefined}
                />

                {/* Icon Glyph */}
                <text 
                  x="0" 
                  y="4" 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  fontSize="9" 
                  fontWeight="bold" 
                  pointerEvents="none"
                >
                  {m.type === 'donor' ? 'D' : m.type === 'ngo' ? 'N' : 'O'}
                </text>

                {/* Quick Title Label */}
                <text 
                  x="0" 
                  y="26" 
                  textAnchor="middle" 
                  fill="var(--text-primary)" 
                  fontSize="11" 
                  fontWeight="700" 
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                >
                  {m.name.length > 18 ? m.name.substring(0, 18) + '...' : m.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Entity Details Popover Card */}
        {selectedEntity && (
          <div 
            className="card animate-slide-up" 
            style={{ 
              position: 'absolute', 
              bottom: '20px', 
              right: '20px', 
              maxWidth: '360px', 
              width: '100%',
              padding: '1.5rem', 
              boxShadow: 'var(--shadow-xl)',
              borderLeft: `5px solid ${selectedEntity.color}`,
              zIndex: 100
            }}
          >
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: selectedEntity.color, color: 'white', fontSize: '0.65rem' }}>
                {selectedEntity.roleTitle}
              </span>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ padding: '0 0.4rem', fontSize: '1rem' }}
                onClick={() => setSelectedEntity(null)}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', marginTop: '0.25rem' }}>
              {selectedEntity.name}
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {selectedEntity.details}
            </p>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div>📍 Coordinates: Lat: {selectedEntity.location.lat}, Lng: {selectedEntity.location.lng}</div>
              <div>📏 Distance from Trichy Center: <strong>{selectedEntity.distance} km</strong></div>
              <div>📞 Contact: <strong>{selectedEntity.phone}</strong></div>
            </div>

            {selectedEntity.activeItems && selectedEntity.activeItems.length > 0 && (
              <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Active Listings:</span>
                <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                  {selectedEntity.activeItems.slice(0, 3).map((item, idx) => (
                    <li key={idx}>
                      {item.quantity || item.required_quantity} x {item.item_name} ({item.priority})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
