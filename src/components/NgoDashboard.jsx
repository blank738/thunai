import React, { useState, useEffect } from 'react';
import { Truck, Compass, CheckCircle, Navigation, Award, Settings, MapPin, ListPlus, ShieldCheck, XCircle } from 'lucide-react';
import { getData, saveData, findMatchesForDonation, acceptMatch, updateDeliveryStatus, getDistance } from '../services/db';
import StatusTracker from './StatusTracker';

export default function NgoDashboard({ currentUserId, donations, setDonations, notifications, setNotifications, stats, setStats }) {
  const [activeTab, setActiveTab] = useState('jobs'); // jobs, active, completed, profile
  const [radius, setRadius] = useState(12);
  const [vehicles, setVehicles] = useState({
    van: true,
    car: false,
    twowheeler: false,
    volunteer: true
  });
  
  // Find current NGO data
  const ngos = getData('thunai_ngos');
  const currentNgo = ngos.find(n => n.user_id === currentUserId) || ngos[0];
  const isVerified = currentNgo?.verification_status === 'verified';

  // Read local state for NGO settings
  useEffect(() => {
    if (currentNgo) {
      setRadius(currentNgo.service_radius);
      setVehicles({
        van: currentNgo.transport_type.includes('Van') || currentNgo.transport_type.includes('Multiple'),
        car: currentNgo.transport_type.includes('Car') || currentNgo.transport_type.includes('Multiple'),
        twowheeler: currentNgo.transport_type.includes('Two-wheeler'),
        volunteer: currentNgo.transport_type.includes('Volunteer')
      });
    }
  }, [currentUserId]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updatedNgos = ngos.map(n => {
      if (n.id === currentNgo.id) {
        // Construct transport string
        const selected = [];
        if (vehicles.van) selected.push('Van');
        if (vehicles.car) selected.push('Car');
        if (vehicles.twowheeler) selected.push('Two-wheeler');
        if (vehicles.volunteer) selected.push('Volunteer vehicle');
        
        return {
          ...n,
          service_radius: radius,
          transport_type: selected.length > 0 ? selected.join(', ') : 'No transport'
        };
      }
      return n;
    });
    saveData('thunai_ngos', updatedNgos);
    alert('NGO Transport Settings Updated successfully!');
  };

  // Find matches compatible with this NGO
  const getJobMatches = () => {
    if (!isVerified) return [];

    const jobs = [];
    const activeDonations = donations.filter(d => d.status === 'Available' || d.status === 'Partially Allocated');

    activeDonations.forEach(don => {
      const donationMatches = findMatchesForDonation(don.id);
      
      // Filter matches designated for this specific NGO
      const ngoMatches = donationMatches.filter(m => m.NGO_id === currentNgo.id);
      
      ngoMatches.forEach(m => {
        // Ensure this specific match hasn't already been accepted or declined
        const matches = getData('thunai_matches');
        const matchExists = matches.some(matchRecord => 
          matchRecord.donation_id === m.donation_id && 
          matchRecord.request_id === m.request_id && 
          matchRecord.status !== 'Declined'
        );
        
        if (!matchExists) {
          jobs.push(m);
        }
      });
    });

    return jobs.sort((a, b) => b.match_score - a.match_score);
  };

  const handleAcceptJob = (job) => {
    try {
      acceptMatch(job);
      
      // Refresh state
      setDonations(getData('thunai_donations'));
      setNotifications(getData('thunai_notifications'));
      setStats(getData('thunai_stats'));

      setActiveTab('active');
    } catch (e) {
      alert(e.message);
    }
  };

  // Fetch Deliveries
  const deliveries = getData('thunai_deliveries');
  const activeDeliveries = deliveries.filter(d => d.NGO_id === currentNgo.id && d.status !== 'Confirmed');
  const completedDeliveries = deliveries.filter(d => d.NGO_id === currentNgo.id && d.status === 'Confirmed');

  // Trigger Delivery Status Updates
  const handleTransitStatusChange = (delId, status) => {
    const extra = {};
    if (status === 'Pickup Scheduled') {
      extra.pickup_time = '30 minutes';
    } else if (status === 'Delivered') {
      extra.proof_image = 'signature_upload_confirmed.png';
    }

    updateDeliveryStatus(delId, status, extra);
    
    // Refresh states
    setDonations(getData('thunai_donations'));
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));
  };

  // Fetch full details helper for active list
  const getDeliveryDetails = (del) => {
    const matches = getData('thunai_matches');
    const donationsList = getData('thunai_donations');
    const requests = getData('thunai_requests');

    const match = matches.find(m => m.id === del.match_id);
    if (!match) return null;

    const donation = donationsList.find(d => d.id === match.donation_id);
    const request = requests.find(r => r.id === match.request_id);

    return { match, donation, request };
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Profile Banner */}
      <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderLeft: '5px solid var(--accent)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>NGO Partner Dashboard</span>
            {isVerified ? (
              <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <ShieldCheck size={10} /> Verified
              </span>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                Pending Verification
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{currentNgo.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            📍 Base Coordinates: Lat: {currentNgo.location.lat}, Lng: {currentNgo.location.lng} | Service Radius: {radius} km
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{getJobMatches().length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nearby Matches</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>{activeDeliveries.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Deliveries</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button className={`btn btn-sm ${activeTab === 'jobs' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('jobs')}>
          <Compass size={16} /> Matching Jobs ({getJobMatches().length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'active' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('active')}>
          <Truck size={16} /> Active Deliveries ({activeDeliveries.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'completed' ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setActiveTab('completed')}>
          <CheckCircle size={16} /> Completed Jobs ({completedDeliveries.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'profile' ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setActiveTab('profile')}>
          <Settings size={16} /> Transport Profile
        </button>
      </div>

      {/* TAB 1: MATCHING JOBS */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isVerified && (
            <div className="card" style={{ borderLeft: '4px solid var(--danger)', backgroundColor: '#fef2f2', padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Verification Required
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Your NGO profile is currently pending administrator verification. In compliance with safety regulations, you will receive full platform access to accept donations and view recipient addresses once your verification status is updated to "verified" in the Admin Dashboard.
              </p>
            </div>
          )}

          {isVerified && getJobMatches().length > 0 ? (
            getJobMatches().map((job, idx) => {
              const donation = donations.find(d => d.id === job.donation_id);
              const requests = getData('thunai_requests');
              const request = requests.find(r => r.id === job.request_id);
              const orphanages = getData('thunai_orphanages');
              const orphanage = orphanages.find(o => o.id === job.orphanage_id);

              return (
                <div key={idx} className="card animate-slide-up" style={{ padding: '1.5rem' }}>
                  <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <span className="badge badge-success animate-pulse-slow">🎯 MATCH SCORE: {job.match_score}%</span>
                      <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>
                        🍱 Match: {job.quantity} x {donation?.item_name || 'Items'}
                      </h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {donation?.priority === 'Urgent' && <span className="badge badge-danger">🔴 Urgent</span>}
                      {donation?.category === 'Food' && donation.expiry_time && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 700, marginTop: '0.25rem' }}>
                          Expires: {new Date(donation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Flow */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 1fr', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>📍 PICKUP (DONOR)</span>
                      <h4 style={{ fontSize: '0.9rem', marginTop: '0.1rem' }}>
                        {donation?.contact_info?.split('(')[0] || 'Surplus Supplier'}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distance: {job.donor_distance} km</div>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--text-muted)' }}>➔</div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>📍 DESTINATION (ORPHANAGE)</span>
                      <h4 style={{ fontSize: '0.9rem', marginTop: '0.1rem' }}>{orphanage?.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distance: {job.orphanage_distance} km</div>
                    </div>
                  </div>

                  <div className="flex-between">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Total Route Transit: {job.total_distance} km
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline btn-sm">Decline</button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAcceptJob(job)}>
                        Accept Donation Pickup
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            isVerified && (
              <div className="flex-center" style={{ flexDirection: 'column', height: '240px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                <Compass size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h3>No Matches Found</h3>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', textAlign: 'center', maxWidth: '400px' }}>
                  There are no pending nearby matching requests. We will notify you once donors within your {radius} km service radius post resources.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE DELIVERIES */}
      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {activeDeliveries.length > 0 ? (
            activeDeliveries.map((del) => {
              const details = getDeliveryDetails(del);
              if (!details) return null;

              const { match, donation, request } = details;

              return (
                <div key={del.id} className="card" style={{ padding: '1.5rem' }}>
                  
                  {/* Status Visual Tracker */}
                  <StatusTracker 
                    match={match} 
                    delivery={del} 
                    donation={donation} 
                    request={request} 
                  />

                  {/* Transit Control Panel */}
                  <div style={{ 
                    marginTop: '1.5rem', 
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-color)', 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Active Transit Status:</strong> {del.status === 'NGO Accepted' ? 'Awaiting pickup scheduling.' : del.status === 'Pickup Scheduled' ? 'Awaiting collection.' : del.status === 'Picked Up' ? 'In transit.' : del.status === 'Out for Delivery' ? 'Arriving at destination.' : 'Delivered. Awaiting recipient confirmation.'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {del.status === 'NGO Accepted' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleTransitStatusChange(del.id, 'Pickup Scheduled')}>
                          Schedule Pickup
                        </button>
                      )}
                      
                      {del.status === 'Pickup Scheduled' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleTransitStatusChange(del.id, 'Picked Up')}>
                          Mark Picked Up
                        </button>
                      )}

                      {del.status === 'Picked Up' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleTransitStatusChange(del.id, 'Out for Delivery')}>
                          Start Delivery (Transit)
                        </button>
                      )}

                      {del.status === 'Out for Delivery' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleTransitStatusChange(del.id, 'Delivered')}>
                          Mark Delivered (Upload Proof)
                        </button>
                      )}

                      {del.status === 'Delivered' && (
                        <span style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: 700 }}>
                          ⏳ Pending Orphanage Receipt Confirmation
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '240px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <Truck size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No Active Deliveries</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>You don't have any accepted shipments in progress.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED JOBS */}
      {activeTab === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {completedDeliveries.length > 0 ? (
            completedDeliveries.map((del) => {
              const details = getDeliveryDetails(del);
              if (!details) return null;
              const { match, donation } = details;

              return (
                <div key={del.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)', padding: '1rem 1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem' }}>{match.quantity} x {donation?.item_name || 'Resources'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Recipient: {getData('thunai_orphanages').find(o => o.id === match.orphanage_id)?.name} | Completed: {new Date(del.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <ShieldCheck size={18} /> Receipt Confirmed
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '200px', color: 'var(--text-muted)' }}>
              <CheckCircle size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No completed shipments yet.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} className="text-primary" /> Configure NGO Transport Profile
          </h3>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">
                Maximum Pickup Service Radius: <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{radius} km</strong>
              </label>
              <input 
                type="range" 
                min="3" 
                max="30" 
                className="form-input" 
                style={{ padding: 0 }}
                value={radius} 
                onChange={(e) => setRadius(parseInt(e.target.value))}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                This is the maximum distance our algorithm uses to filter compatible donor locations.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Available Vehicles Fleet</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={vehicles.van} onChange={(e) => setVehicles({ ...vehicles, van: e.target.checked })} className="form-checkbox" />
                  <span>🚐 Van (Required for large volume food & furniture)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={vehicles.car} onChange={(e) => setVehicles({ ...vehicles, car: e.target.checked })} className="form-checkbox" />
                  <span>🚗 Car (Suitable for grocery sacks & medium item crates)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={vehicles.twowheeler} onChange={(e) => setVehicles({ ...vehicles, twowheeler: e.target.checked })} className="form-checkbox" />
                  <span>🛵 Two-wheeler (Suitable for books, stationary & small clothes batches)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={vehicles.volunteer} onChange={(e) => setVehicles({ ...vehicles, volunteer: e.target.checked })} className="form-checkbox" />
                  <span>👤 Volunteer personal vehicles</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Save Transport Configuration
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
