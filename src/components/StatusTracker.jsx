import React from 'react';
import { Package, Truck, Home, CheckCircle2, MapPin, ArrowRight, ShieldCheck, Clock, Navigation } from 'lucide-react';
import { getDistance, getData } from '../services/db';

export default function StatusTracker({ match, delivery, donation, request }) {
  if (!match || !delivery || !donation || !request) return null;

  const statusSteps = [
    { key: 'Donation Posted', label: 'Posted', color: 'var(--info)' },
    { key: 'NGO Accepted', label: 'NGO Matched & Accepted', color: 'var(--primary)' },
    { key: 'Pickup Scheduled', label: 'Pickup Scheduled', color: 'var(--primary)' },
    { key: 'Picked Up', label: 'Picked Up (In Transit)', color: 'var(--accent)' },
    { key: 'Out for Delivery', label: 'Out for Delivery', color: 'var(--accent)' },
    { key: 'Delivered', label: 'Arrived at Orphanage', color: 'var(--secondary)' },
    { key: 'Confirmed', label: 'Receipt Confirmed', color: 'var(--success)' }
  ];

  const currentStatus = delivery.status;
  // Map delivery status to stepper index
  let activeIndex = 1;
  if (currentStatus === 'NGO Accepted') activeIndex = 1;
  else if (currentStatus === 'Pickup Scheduled') activeIndex = 2;
  else if (currentStatus === 'Picked Up') activeIndex = 3;
  else if (currentStatus === 'Out for Delivery') activeIndex = 4;
  else if (currentStatus === 'Delivered') activeIndex = 5;
  else if (currentStatus === 'Confirmed') activeIndex = 6;

  const completedWidth = (activeIndex / (statusSteps.length - 1)) * 100;

  // Retrieve NGO details
  const ngos = getData('thunai_ngos');
  const ngo = ngos.find(n => n.id === delivery.NGO_id) || { name: 'CareConnect NGO', transport_type: 'Van' };

  // Retrieve Orphanage details
  const orphanages = getData('thunai_orphanages');
  const orphanage = orphanages.find(o => o.id === match.orphanage_id) || { name: 'Hope Children Home', address: 'Trichy' };

  // Custody Logic (Who has the resource right now?)
  let custodyHolder = 'Donor';
  let custodyEmoji = '👤';
  let custodyDesc = 'Resource is with the donor awaiting scheduled pickup.';
  if (currentStatus === 'Picked Up' || currentStatus === 'Out for Delivery') {
    custodyHolder = `${ngo.name} (In Transit)`;
    custodyEmoji = '🚐';
    custodyDesc = 'Resource is currently in vehicle transit under NGO custody.';
  } else if (currentStatus === 'Delivered' || currentStatus === 'Confirmed') {
    custodyHolder = `${orphanage.name} (Delivered)`;
    custodyEmoji = '🏠';
    custodyDesc = 'Resource has been handed over and received by the orphanage.';
  }

  // Distance calculations
  const distDonorToNgo = getDistance(donation.location.lat, donation.location.lng, ngo.location.lat, ngo.location.lng);
  const distNgoToOrph = getDistance(ngo.location.lat, ngo.location.lng, orphanage.location.lat, orphanage.location.lng);
  const totalRouteDist = distDonorToNgo + distNgoToOrph;

  // Tracking ID formatting
  const trackingId = `THN${match.id.replace(/\D/g, '').slice(-4) || '1024'}`;

  return (
    <div className="tracker-container animate-slide-up" style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--card-border)', borderRadius: 'var(--radius-lg)' }}>
      
      {/* 1. Header Details */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TRACKING ID
          </span>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>
            #{trackingId}
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
            🟢 {currentStatus}
          </span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Match Score: <strong>{match.match_score || 94}%</strong>
          </div>
        </div>
      </div>

      {/* 2. Core 5 Questions Breakdown Card */}
      <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>1. Who Has Resource?</span>
            <div style={{ fontWeight: 700, marginTop: '0.15rem', color: 'var(--primary)' }}>
              {custodyEmoji} {custodyHolder}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>2. Who Is Collecting It?</span>
            <div style={{ fontWeight: 700, marginTop: '0.15rem' }}>
              🚐 {ngo.name}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Fleet: {ngo.transport_type || 'Van'}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>3. Who Needs It?</span>
            <div style={{ fontWeight: 700, marginTop: '0.15rem' }}>
              🏠 {orphanage.name}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Need: {request.required_quantity} {request.item_name}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>4. How Far Are They?</span>
            <div style={{ fontWeight: 700, marginTop: '0.15rem' }}>
              📍 {totalRouteDist} km Total Route
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Donor ➔ NGO: {distDonorToNgo} km | NGO ➔ Home: {distNgoToOrph} km
            </span>
          </div>
        </div>
      </div>

      {/* 3. Custody Chain Visual: Donor ➔ NGO ➔ Orphanage */}
      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div className="custody-flow">
          <div className={`custody-node ${custodyHolder.includes('Donor') ? 'active' : ''}`}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--info)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              👤
            </div>
            <span style={{ fontWeight: 700, marginTop: '0.25rem' }}>Donor</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {donation.contact_info?.split('(')[0]?.trim() || 'Donor Facility'}
            </span>
          </div>

          <div className={`custody-arrow ${currentStatus !== 'Donation Posted' ? 'active text-primary' : ''}`}>➔</div>

          <div className={`custody-node ${custodyHolder.includes('NGO') ? 'active' : ''}`}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: custodyHolder.includes('NGO') ? '0 0 15px var(--primary-glow)' : 'none' }}>
              🚐
            </div>
            <span style={{ fontWeight: 700, marginTop: '0.25rem' }}>NGO Bridge</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {ngo.name} ({distDonorToNgo} km away)
            </span>
          </div>

          <div className={`custody-arrow ${currentStatus === 'Delivered' || currentStatus === 'Confirmed' ? 'active text-secondary' : ''}`}>➔</div>

          <div className={`custody-node ${custodyHolder.includes('Orphanage') ? 'active' : ''}`}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              🏠
            </div>
            <span style={{ fontWeight: 700, marginTop: '0.25rem' }}>Orphanage</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {orphanage.name}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <strong>Status Note:</strong> {custodyDesc}
        </div>
      </div>

      {/* 4. Visual 7-Step Progress Stepper */}
      <div style={{ position: 'relative', padding: '1rem 0 0.5rem 0' }}>
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

      {/* 5. Quantity Allocation Badge Summary */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '0.75rem', 
        backgroundColor: 'var(--bg-tertiary)', 
        padding: '0.75rem 1rem', 
        borderRadius: 'var(--radius-md)',
        fontSize: '0.8rem'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Resource Allocated: </span>
          <strong>{match.quantity} x {donation.item_name}</strong>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
            📦 {donation.quantity} Total Offered
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
            ✅ {match.quantity} Allocated
          </span>
          {donation.available_quantity > 0 && (
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              🔄 {donation.available_quantity} Remaining
            </span>
          )}
        </div>
      </div>

    </div>
  );
}

