import React, { useState, useEffect } from 'react';
import { Truck, Compass, CheckCircle, Navigation, Award, Settings, MapPin, ListPlus, ShieldCheck, XCircle, Clock, ArrowRight, Eye, Upload, AlertCircle, Phone, Calendar } from 'lucide-react';
import { getData, saveData, findMatchesForDonation, acceptMatch, updateDeliveryStatus, getDistance, MAP_CENTER } from '../services/db';
import StatusTracker from './StatusTracker';

export default function NgoDashboard({ currentUserId, donations, setDonations, notifications, setNotifications, stats, setStats }) {
  const [activeTab, setActiveTab] = useState('jobs'); // jobs, requests, active, completed, profile
  const [radius, setRadius] = useState(15);
  const [vehicles, setVehicles] = useState({
    van: true,
    car: true,
    twowheeler: false,
    volunteer: true
  });
  
  // Modal states
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [proofUploadModal, setProofUploadModal] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  // Find current NGO data
  const ngos = getData('thunai_ngos');
  const currentNgo = ngos.find(n => n.user_id === currentUserId) || ngos[0];
  const isVerified = currentNgo?.verification_status === 'verified';

  // Read state for NGO settings
  useEffect(() => {
    if (currentNgo) {
      setRadius(currentNgo.service_radius || 15);
      const transportStr = currentNgo.transport_type || '';
      setVehicles({
        van: transportStr.includes('Van') || transportStr.includes('Multiple'),
        car: transportStr.includes('Car') || transportStr.includes('Multiple'),
        twowheeler: transportStr.includes('Two-wheeler'),
        volunteer: transportStr.includes('Volunteer')
      });
    }
  }, [currentUserId]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updatedNgos = ngos.map(n => {
      if (n.id === currentNgo.id) {
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
    alert('NGO Transport & Service Radius Profile updated successfully!');
  };

  // Find matches compatible with this NGO
  const getJobMatches = () => {
    if (!isVerified) return [];

    const jobs = [];
    const activeDonations = donations.filter(d => d.status === 'Available' || d.status === 'Partially Allocated');

    activeDonations.forEach(don => {
      const donationMatches = findMatchesForDonation(don.id);
      const ngoMatches = donationMatches.filter(m => m.NGO_id === currentNgo.id);
      
      ngoMatches.forEach(m => {
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

  // Nearby Orphanage Requests
  const getNearbyOrphanageRequests = () => {
    const requests = getData('thunai_requests');
    const orphanages = getData('thunai_orphanages');
    const activeReqs = requests.filter(r => r.status !== 'Fulfilled');

    return activeReqs.map(req => {
      const orph = orphanages.find(o => o.id === req.orphanage_id);
      const dist = orph ? getDistance(currentNgo.location.lat, currentNgo.location.lng, orph.location.lat, orph.location.lng) : 5;
      return { ...req, orphanage: orph, distance: dist };
    }).filter(req => req.distance <= radius);
  };

  const handleAcceptJob = (job) => {
    try {
      acceptMatch(job);
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
      extra.pickup_time = 'Within 45 minutes';
    } else if (status === 'Delivered') {
      extra.proof_image = proofPreview || 'delivery_photo_verified.png';
      setProofUploadModal(null);
      setProofPreview(null);
    }

    updateDeliveryStatus(delId, status, extra);
    setDonations(getData('thunai_donations'));
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));
  };

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
      
      {/* Profile Overview Banner */}
      <div className="card-glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderLeft: '5px solid var(--accent)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              NGO Coordination Bridge
            </span>
            {isVerified ? (
              <span className="badge badge-success" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <ShieldCheck size={12} /> Verified NGO
              </span>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                Pending Verification
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.85rem', marginTop: '0.25rem', fontFamily: 'Outfit, sans-serif' }}>{currentNgo.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            📍 Base Coordinates: Lat: {currentNgo.location.lat}, Lng: {currentNgo.location.lng} | Service Radius: <strong>{radius} km</strong> | Transport: <strong>{currentNgo.transport_type}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{getJobMatches().length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nearby Matches</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'Outfit, sans-serif' }}>{activeDeliveries.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Deliveries</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>{completedDeliveries.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Delivered</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button className={`btn btn-sm ${activeTab === 'jobs' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('jobs')}>
          <Compass size={16} /> Matching Donations ({getJobMatches().length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'requests' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('requests')}>
          <ListPlus size={16} /> Orphanage Needs ({getNearbyOrphanageRequests().length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'active' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('active')}>
          <Truck size={16} /> Active Deliveries ({activeDeliveries.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'completed' ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setActiveTab('completed')}>
          <CheckCircle size={16} /> Completed Shipments ({completedDeliveries.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'profile' ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setActiveTab('profile')}>
          <Settings size={16} /> Transport Profile
        </button>
      </div>

      {/* TAB 1: MATCHING JOBS */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isVerified && (
            <div className="card" style={{ borderLeft: '5px solid var(--danger)', backgroundColor: '#fef2f2', padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Admin Verification Required
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Your NGO profile is currently pending administrator verification. In compliance with safety regulations, you will receive full platform access to accept donations once verified in the Admin Dashboard.
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
                <div key={idx} className="card animate-slide-up" style={{ padding: '1.75rem' }}>
                  <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <span className="badge badge-success animate-pulse-slow" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                        🎯 MATCH SCORE: {job.match_score}%
                      </span>
                      <h3 style={{ fontSize: '1.35rem', marginTop: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                        🍱 {donation?.category === 'Food' ? 'Food Rescue Match' : 'Resource Allocation'}: {job.quantity} x {donation?.item_name}
                      </h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {donation?.priority === 'Urgent' && <span className="badge badge-danger">🔴 URGENT</span>}
                      {donation?.category === 'Food' && donation.expiry_time && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, marginTop: '0.35rem' }}>
                          ⏰ Expiry: {new Date(donation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Flow Card: Donor ➔ NGO ➔ Orphanage */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>📍 PICKUP (DONOR)</span>
                      <h4 style={{ fontSize: '0.95rem', marginTop: '0.15rem' }}>
                        {donation?.contact_info?.split('(')[0] || 'Surplus Supplier'}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Distance to Donor: <strong>{job.donor_distance} km</strong>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Offered: {donation?.quantity} units</span>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '1.75rem', color: 'var(--primary)' }}>➔</div>

                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>📍 RECIPIENT (ORPHANAGE)</span>
                      <h4 style={{ fontSize: '0.95rem', marginTop: '0.15rem' }}>{orphanage?.name}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Distance to Home: <strong>{job.orphanage_distance} km</strong>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Needs: {request?.required_quantity} units</span>
                    </div>
                  </div>

                  {/* Score Breakdown Pills */}
                  {job.score_breakdown && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        📍 Distance: {job.score_breakdown.distanceScore}/30
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        📦 Qty Fit: {job.score_breakdown.quantityScore}/20
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        🚨 Urgency: {job.score_breakdown.urgencyScore}/15
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        ⏰ Expiry/Time: {job.score_breakdown.timeScore}/15
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        🚐 Fleet: {job.score_breakdown.transportScore}/10
                      </span>
                    </div>
                  )}

                  <div className="flex-between">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Total Route Transit: <strong>{job.total_distance} km</strong> | Vehicle Req: <strong>{currentNgo.transport_type}</strong>
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
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
              <div className="flex-center" style={{ flexDirection: 'column', height: '260px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                <Compass size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h3>No Pending Matches</h3>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', textAlign: 'center', maxWidth: '450px' }}>
                  There are no unassigned matches within your {radius} km service radius. We will alert you immediately when donors post resources.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 2: NEARBY ORPHANAGE REQUESTS */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
            Nearby Orphanage Demands (Within {radius} km)
          </h3>
          <div className="grid-2">
            {getNearbyOrphanageRequests().map(req => (
              <div key={req.id} className="card" style={{ padding: '1.5rem', borderLeft: req.priority === 'Urgent' ? '4px solid var(--danger)' : '4px solid var(--secondary)' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{req.category}</span>
                  {req.priority === 'Urgent' ? <span className="badge badge-danger">🔴 URGENT</span> : <span className="badge badge-neutral">{req.priority}</span>}
                </div>
                <h4 style={{ fontSize: '1.15rem', fontFamily: 'Outfit, sans-serif' }}>{req.item_name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                  Required: <strong>{req.required_quantity} units</strong> (Remaining: {req.remaining_quantity})
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div>🏠 Orphanage: <strong>{req.orphanage?.name}</strong></div>
                  <div>📍 Distance: <strong>{req.distance} km away</strong></div>
                  <div>📅 Needed By: <strong>{req.required_date}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE DELIVERIES */}
      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {activeDeliveries.length > 0 ? (
            activeDeliveries.map((del) => {
              const details = getDeliveryDetails(del);
              if (!details) return null;

              const { match, donation, request } = details;

              return (
                <div key={del.id} className="card" style={{ padding: '1.75rem' }}>
                  
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
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Active Transit Status:</strong> {
                        del.status === 'NGO Accepted' ? 'Awaiting pickup scheduling with donor.' :
                        del.status === 'Pickup Scheduled' ? 'Pickup is scheduled. En route to collect.' :
                        del.status === 'Picked Up' ? 'Donation secured in vehicle. Ready to deliver.' :
                        del.status === 'Out for Delivery' ? 'En route to orphanage recipient.' :
                        'Delivered! Awaiting recipient signature confirmation.'
                      }
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {del.status === 'NGO Accepted' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleTransitStatusChange(del.id, 'Pickup Scheduled')}>
                          <Calendar size={14} /> Schedule Pickup
                        </button>
                      )}
                      
                      {del.status === 'Pickup Scheduled' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleTransitStatusChange(del.id, 'Picked Up')}>
                          <CheckCircle size={14} /> Mark Picked Up (In Transit)
                        </button>
                      )}

                      {del.status === 'Picked Up' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleTransitStatusChange(del.id, 'Out for Delivery')}>
                          <Truck size={14} /> Start Delivery (Out for Delivery)
                        </button>
                      )}

                      {del.status === 'Out for Delivery' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setProofUploadModal(del.id)}>
                          <Upload size={14} /> Mark Delivered & Upload Proof
                        </button>
                      )}

                      {del.status === 'Delivered' && (
                        <span style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: 700 }}>
                          ⏳ Awaiting Orphanage Receipt Signature
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '260px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <Truck size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No Active Deliveries</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>You don't have any accepted shipments in transit. Check "Matching Donations" to claim nearby jobs.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMPLETED DELIVERIES */}
      {activeTab === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {completedDeliveries.length > 0 ? (
            completedDeliveries.map((del) => {
              const details = getDeliveryDetails(del);
              if (!details) return null;
              const { match, donation } = details;
              const orphanageName = getData('thunai_orphanages').find(o => o.id === match.orphanage_id)?.name;

              return (
                <div key={del.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)', padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Delivery Completed & Confirmed</span>
                    <h4 style={{ fontSize: '1.15rem', fontFamily: 'Outfit, sans-serif' }}>{match.quantity} x {donation?.item_name || 'Resources'}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Delivered to: <strong>{orphanageName}</strong> | Completed on: {new Date(del.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <ShieldCheck size={20} /> Verified & Closed
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '220px', color: 'var(--text-muted)' }}>
              <CheckCircle size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No completed shipments yet.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
            <Settings size={20} className="text-primary" /> Configure NGO Transport Profile
          </h3>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">
                Maximum Pickup Service Radius: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{radius} km</strong>
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                THUNAI's smart matching engine strictly uses this radius to match you with donors and orphanages in Trichy.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Available Vehicles Fleet</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={vehicles.van} onChange={(e) => setVehicles({ ...vehicles, van: e.target.checked })} className="form-checkbox" />
                  <span>🚐 <strong>Van / Small Truck</strong> (For large volume food packets & furniture)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={vehicles.car} onChange={(e) => setVehicles({ ...vehicles, car: e.target.checked })} className="form-checkbox" />
                  <span>🚗 <strong>Car</strong> (For grocery sacks, clothes & medium crates)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={vehicles.twowheeler} onChange={(e) => setVehicles({ ...vehicles, twowheeler: e.target.checked })} className="form-checkbox" />
                  <span>🛵 <strong>Two-wheeler</strong> (For books, stationery & emergency meal kits)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={vehicles.volunteer} onChange={(e) => setVehicles({ ...vehicles, volunteer: e.target.checked })} className="form-checkbox" />
                  <span>👤 <strong>Volunteer Personal Vehicles</strong></span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
              Save Transport Configuration
            </button>
          </form>
        </div>
      )}

      {/* Proof Upload Modal */}
      {proofUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
              📸 Upload Delivery Proof
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Please attach delivery photo or handover verification document to confirm arrival at the orphanage.
            </p>

            <div className="form-group">
              <label className="btn btn-outline" style={{ cursor: 'pointer', width: '100%' }}>
                <Upload size={16} /> Select Photo / Document
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setProofPreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {proofPreview && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <img src={proofPreview} alt="Proof" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setProofUploadModal(null)}>Cancel</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleTransitStatusChange(proofUploadModal, 'Delivered')}>
                Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

