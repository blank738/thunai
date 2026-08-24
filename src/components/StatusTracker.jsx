import React from 'react';
import { Package, Truck, Home, CheckCircle2, MapPin } from 'lucide-react';
import { getDistance, getData } from '../services/db';

export default function StatusTracker({ match, delivery, donation, request }) {
  if (!match || !delivery || !donation || !request) return null;

  const statusSteps = [
    { key: 'NGO Accepted', label: 'Accepted' },
    { key: 'Pickup Scheduled', label: 'Scheduled' },
    { key: 'Picked Up', label: 'Picked Up' },
    { key: 'Out for Delivery', label: 'In Transit' },
    { key: 'Delivered', label: 'Delivered' },
    { key: 'Confirmed', label: 'Completed' }
  ];

  const currentStatus = delivery.status;
  const activeIndex = statusSteps.findIndex(s => s.key === currentStatus);
  const completedWidth = activeIndex >= 0 ? (activeIndex / (statusSteps.length - 1)) * 100 : 0;

  // Retrieve NGO details
  const ngos = getData('thunai_ngos');
  const ngo = ngos.find(n => n.id === delivery.NGO_id) || { name: 'Assigned NGO', transport_type: 'Van' };

  // Retrieve Orphanage details
  const orphanages = getData('thunai_orphanages');
  const orphanage = orphanages.find(o => o.id === match.orphanage_id) || { name: 'Recipient Orphanage' };

  // Custody Logic
  let custodyHolder = 'Donor';
  let custodyEmoji = '👤';
  if (currentStatus === 'Picked Up' || currentStatus === 'Out for Delivery') {
    custodyHolder = 'NGO (In Transit)';
    custodyEmoji = '🚐';
  } else if (currentStatus === 'Delivered' || currentStatus === 'Confirmed') {
    custodyHolder = 'Orphanage';
    custodyEmoji = '🏠';
  }

  // Distance calculations
  const distDonorToNgo = getDistance(donation.location.lat, donation.location.lng, ngo.location.lat, ngo.location.lng);
  const distNgoToOrph = getDistance(ngo.location.lat, ngo.location.lng, orphanage.location.lat, orphanage.location.lng);
  const distDonorToOrph = getDistance(donation.location.lat, donation.location.lng, orphanage.location.lat, orphanage.location.lng);

  return (
    <div className="tracker-container animate-slide-up" style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--card-border)' }}>
      {/* Header details */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TRACKING ID</span>
          <h4 style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>#THN{match.id.substring(match.id.length - 6).toUpperCase()}</h4>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Custody Flow Card */}
      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div className="custody-flow">
          <div className={`custody-node ${custodyHolder === 'Donor' ? 'active' : ''}`}>
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <span style={{ fontWeight: 700 }}>Donor</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{donation.contact_info.split('(')[0].trim()}</span>
          </div>

          <div className={`custody-arrow ${custodyHolder === 'NGO (In Transit)' ? 'active text-primary' : ''}`}>➔</div>

          <div className={`custody-node ${custodyHolder === 'NGO (In Transit)' ? 'active' : ''}`}>
            <span style={{ fontSize: '1.5rem' }}>🚐</span>
            <span style={{ fontWeight: 700 }}>NGO</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{ngo.name}</span>
          </div>

          <div className={`custody-arrow ${custodyHolder === 'Orphanage' ? 'active text-primary' : ''}`}>➔</div>

          <div className={`custody-node ${custodyHolder === 'Orphanage' ? 'active' : ''}`}>
            <span style={{ fontSize: '1.5rem' }}>🏠</span>
            <span style={{ fontWeight: 700 }}>Orphanage</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{orphanage.name}</span>
          </div>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600 }}>
            Custody Holder: <span className="text-primary">{custodyEmoji} {custodyHolder}</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <span>📍 Donor ➔ NGO: <strong>{distDonorToNgo} km</strong></span>
            <span>📍 NGO ➔ Orphanage: <strong>{distNgoToOrph} km</strong></span>
          </div>
        </div>
      </div>

      {/* Visual Tracking Progress Bar */}
      <div style={{ position: 'relative', padding: '1rem 0', margin: '0.5rem 0' }}>
        <div className="tracker-steps">
          <div className="tracker-progress-bar" style={{ width: `${completedWidth}%` }} />
          {statusSteps.map((step, idx) => {
            const isCompleted = idx < activeIndex || currentStatus === 'Confirmed';
            const isActive = idx === activeIndex && currentStatus !== 'Confirmed';
            return (
              <div 
                key={step.key} 
                className={`tracker-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="tracker-dot">
                  {isCompleted ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                </div>
                <span className="tracker-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary metadata */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <div>
          <strong>Allocated Item:</strong>
          <div>{match.quantity} x {donation.item_name} ({donation.category})</div>
        </div>
        <div>
          <strong>Urgency Priority:</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: donation.priority === 'Urgent' ? 'var(--danger)' : donation.priority === 'High' ? 'var(--warning)' : 'var(--success)' 
            }} />
            {donation.priority}
          </div>
        </div>
        <div>
          <strong>Pickup From:</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <MapPin size={10} /> Lat: {donation.location.lat}, Lng: {donation.location.lng}
          </div>
        </div>
        <div>
          <strong>Delivery To:</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <MapPin size={10} /> Lat: {delivery.delivery_location.lat}, Lng: {delivery.delivery_location.lng}
          </div>
        </div>
      </div>
    </div>
  );
}
