import React, { useState } from 'react';
import { MapPin, Compass, Search, Filter, ShieldAlert, Award, Info, InfoIcon } from 'lucide-react';
import { getData, getDistance, coordToPercent, MAP_CENTER } from '../services/db';

export default function MapPage() {
  const [distanceFilter, setDistanceFilter] = useState(10); // Default 10km radius
  const [typeFilters, setTypeFilters] = useState({
    donor: true,
    ngo: true,
    orphanage: true,
    urgent: true
  });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all entities
  const donors = getData('thunai_donations');
  const ngos = getData('thunai_ngos');
  const orphanages = getData('thunai_orphanages');
  const users = getData('thunai_users');

  // Format entities for unified map rendering
  const mapEntities = [];

  // 1. Add Donors
  donors.forEach(don => {
    const donorUser = users.find(u => u.id === don.donor_id);
    const name = donorUser ? donorUser.name : 'Individual Donor';
    const dist = getDistance(MAP_CENTER.lat, MAP_CENTER.lng, don.location.lat, don.location.lng);
    const isUrgent = don.priority === 'Urgent';

    mapEntities.push({
      id: don.id,
      name: name,
      type: 'donor',
      category: don.category,
      item: don.item_name,
      quantity: don.quantity,
      priority: don.priority,
      lat: don.location.lat,
      lng: don.location.lng,
      distance: dist,
      details: don.description,
      status: don.status,
      isUrgent: isUrgent
    });
  });

  // 2. Add NGOs
  ngos.forEach(ngo => {
    const dist = getDistance(MAP_CENTER.lat, MAP_CENTER.lng, ngo.location.lat, ngo.location.lng);
    mapEntities.push({
      id: ngo.id,
      name: ngo.name,
      type: 'ngo',
      lat: ngo.location.lat,
      lng: ngo.location.lng,
      distance: dist,
      details: ngo.description,
      serviceRadius: ngo.service_radius,
      transport: ngo.transport_type,
      status: ngo.verification_status,
      isUrgent: false
    });
  });

  // 3. Add Orphanages
  orphanages.forEach(orph => {
    const dist = getDistance(MAP_CENTER.lat, MAP_CENTER.lng, orph.location.lat, orph.location.lng);
    
    // Check if orphanage has any urgent pending request
    const requests = getData('thunai_requests');
    const orphRequests = requests.filter(r => r.orphanage_id === orph.id && r.status !== 'Fulfilled');
    const hasUrgent = orphRequests.some(r => r.priority === 'Urgent');

    mapEntities.push({
      id: orph.id,
      name: orph.name,
      type: 'orphanage',
      lat: orph.location.lat,
      lng: orph.location.lng,
      distance: dist,
      details: orph.description,
      childrenCount: orph.children_count,
      status: orph.verification_status,
      isUrgent: hasUrgent,
      requestsCount: orphRequests.length
    });
  });

  // Filter map entities based on search, distance, and types
  const filteredEntities = mapEntities.filter(entity => {
    // 1. Search Query filter
    if (searchQuery && !entity.name.toLowerCase().includes(searchQuery.toLowerCase()) && !entity.details.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Distance filter
    if (entity.distance > distanceFilter) {
      return false;
    }

    // 3. Type filters
    if (entity.isUrgent && typeFilters.urgent) {
      return true; // Keep if urgent is checked
    }
    return typeFilters[entity.type];
  });

  const handleToggleFilter = (key) => {
    setTypeFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Search and Filters Header */}
      <div className="card-glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search NGOs, Orphanages, or resources..." 
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Distance Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Distance:</span>
            <select 
              className="form-select" 
              style={{ width: '130px', padding: '0.5rem' }}
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(parseInt(e.target.value))}
            >
              <option value={2}>Within 2 km</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
            </select>
          </div>

          {/* Type Checkboxes */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={typeFilters.donor} onChange={() => handleToggleFilter('donor')} className="form-checkbox" />
              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>🔵 Donors</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={typeFilters.ngo} onChange={() => handleToggleFilter('ngo')} className="form-checkbox" />
              <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>🟢 NGOs</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={typeFilters.orphanage} onChange={() => handleToggleFilter('orphanage')} className="form-checkbox" />
              <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>🟠 Orphanages</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={typeFilters.urgent} onChange={() => handleToggleFilter('urgent')} className="form-checkbox" />
              <span className="badge badge-danger" style={{ textTransform: 'capitalize' }}>🔴 Urgent Needs</span>
            </label>
          </div>

        </div>
      </div>

      {/* Main Map Split Screen */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', minHeight: 0 }}>
        
        {/* Sidebar Nearest Entities list */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} /> Nearby Locations ({filteredEntities.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {filteredEntities.map((entity) => (
              <div 
                key={entity.id} 
                className="card" 
                style={{ 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer',
                  border: selectedEntity?.id === entity.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: selectedEntity?.id === entity.id ? 'var(--primary-light)' : 'var(--bg-secondary)'
                }}
                onClick={() => setSelectedEntity(entity)}
              >
                <div className="flex-between">
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: '0.85rem',
                    color: entity.isUrgent ? 'var(--danger)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px'
                  }}>
                    {entity.name}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                    📍 {entity.distance} km
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                  {entity.isUrgent && <span className="badge badge-danger" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>Urgent</span>}
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    color: entity.type === 'donor' ? 'var(--info)' : entity.type === 'ngo' ? 'var(--accent)' : 'var(--secondary)' 
                  }}>
                    {entity.type}
                  </span>
                </div>
              </div>
            ))}

            {filteredEntities.length === 0 && (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                <MapPin size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8rem' }}>No results match filters within {distanceFilter} km.</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Display area */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          <div className="map-canvas" style={{ flex: 1, minHeight: '400px' }}>
            
            {/* Custom SVG Map Background Drawing */}
            <svg 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none" 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
            >
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--border-color)" strokeWidth="0.15" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Kaveri River flowing through top (approx y=20) */}
              <path 
                d="M 0,22 Q 25,25 50,18 T 100,20" 
                fill="none" 
                stroke="#93c5fd" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                style={{ opacity: 0.8 }}
              />
              
              {/* River Kollidam branching off */}
              <path 
                d="M 45,19 Q 70,14 100,10" 
                fill="none" 
                stroke="#bfdbfe" 
                strokeWidth="1.8" 
                style={{ opacity: 0.6 }}
              />

              {/* Main highways crossing */}
              <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="1,1" /> {/* National Highway */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="1,1" />

              {/* Transit Bypass Loop Road (circular layout approximation) */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="var(--border-color)" strokeWidth="0.3" strokeDasharray="2,2" />

              {/* Geographic labels */}
              <text x="35" y="16" fill="var(--text-muted)" fontSize="2" fontWeight="700">KAVERI RIVER</text>
              <text x="52" y="47" fill="var(--text-muted)" fontSize="2" fontWeight="700">ROCKFORT HILL</text>
              <text x="43" y="78" fill="var(--text-muted)" fontSize="2" fontWeight="700">TRICHY JUNCTION</text>
            </svg>

            {/* Map Center Marker */}
            <div 
              style={{ 
                position: 'absolute', 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                textAlign: 'center'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid white', boxShadow: '0 0 10px var(--primary)' }} />
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, marginTop: '2px', backgroundColor: 'var(--bg-secondary)', padding: '1px 3px', borderRadius: '3px', border: '1px solid var(--border-color)' }}>
                Trichy Center
              </div>
            </div>

            {/* Entity Pin Markers */}
            {filteredEntities.map((entity) => {
              const pos = coordToPercent(entity.lat, entity.lng);
              const isSelected = selectedEntity?.id === entity.id;

              return (
                <div 
                  key={entity.id} 
                  className={`map-marker ${entity.isUrgent ? 'urgent' : entity.type}`}
                  style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.y}%`, 
                    zIndex: isSelected ? 30 : 10
                  }}
                  onClick={() => setSelectedEntity(entity)}
                >
                  {/* Pin Dot */}
                  <div className="map-marker-pin" style={{
                    transform: isSelected ? 'rotate(-45deg) scale(1.2)' : 'rotate(-45deg)',
                    boxShadow: isSelected ? '0 0 15px currentColor' : '0 4px 6px rgba(0,0,0,0.15)'
                  }} />
                  
                  {/* Small Label underneath */}
                  <div style={{ 
                    fontSize: '0.55rem', 
                    fontWeight: 700, 
                    backgroundColor: 'var(--bg-secondary)', 
                    color: 'var(--text-primary)',
                    padding: '1px 4px', 
                    borderRadius: '4px', 
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    whiteSpace: 'nowrap',
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    {entity.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}

            {/* Floating Detail Card Popover */}
            {selectedEntity && (
              <div 
                className="card animate-slide-up" 
                style={{ 
                  position: 'absolute', 
                  bottom: '16px', 
                  left: '16px', 
                  right: '16px', 
                  zIndex: 40,
                  margin: 0,
                  boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                  borderLeft: `5px solid ${selectedEntity.isUrgent ? 'var(--danger)' : selectedEntity.type === 'donor' ? 'var(--info)' : selectedEntity.type === 'ngo' ? 'var(--accent)' : 'var(--secondary)'}`
                }}
              >
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem', marginBottom: '0.25rem', marginRight: '0.5rem' }}>
                      {selectedEntity.type.toUpperCase()}
                    </span>
                    {selectedEntity.isUrgent && <span className="badge badge-danger" style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>Urgent</span>}
                    <h4 style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{selectedEntity.name}</h4>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedEntity(null)} style={{ padding: '0.25rem' }}>
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                  {selectedEntity.details}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div>
                    <strong>Distance from Center:</strong>
                    <div>{selectedEntity.distance} km away</div>
                  </div>
                  {selectedEntity.type === 'donor' && (
                    <>
                      <div>
                        <strong>Resource Available:</strong>
                        <div>{selectedEntity.quantity} x {selectedEntity.item}</div>
                      </div>
                      <div>
                        <strong>Custody Status:</strong>
                        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{selectedEntity.status}</div>
                      </div>
                    </>
                  )}
                  {selectedEntity.type === 'ngo' && (
                    <>
                      <div>
                        <strong>Service Area Radius:</strong>
                        <div>{selectedEntity.serviceRadius} km max</div>
                      </div>
                      <div>
                        <strong>Transport Fleet:</strong>
                        <div>🚐 {selectedEntity.transport}</div>
                      </div>
                    </>
                  )}
                  {selectedEntity.type === 'orphanage' && (
                    <>
                      <div>
                        <strong>Children Sheltered:</strong>
                        <div>{selectedEntity.childrenCount} children</div>
                      </div>
                      <div>
                        <strong>Active Requests:</strong>
                        <div style={{ color: 'var(--secondary)', fontWeight: 600 }}>{selectedEntity.requestsCount} Needs pending</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
