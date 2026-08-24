import React, { useState, useRef, useEffect } from 'react';
import { Home, ListPlus, CheckSquare, Plus, Clock, HelpCircle, UserCheck, ShieldAlert, Sparkles, AlertTriangle, Upload, CheckCircle, ShieldCheck } from 'lucide-react';
import { getData, saveData, createRequest, updateDeliveryStatus } from '../services/db';
import StatusTracker from './StatusTracker';

export default function OrphanageDashboard({ currentUserId, requests, setRequests, setNotifications, setStats }) {
  const [activeTab, setActiveTab] = useState('incoming'); // incoming, request, history
  
  // Form fields
  const [category, setCategory] = useState('Food');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [requiredDate, setRequiredDate] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Signature states
  const [signerName, setSignerName] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Retrieve Orphanage details
  const orphanages = getData('thunai_orphanages');
  const currentOrph = orphanages.find(o => o.user_id === currentUserId) || orphanages[0];
  const isVerified = currentOrph?.verification_status === 'verified';

  // Filter requests
  const userRequests = requests.filter(r => r.orphanage_id === currentOrph.id);
  const activeRequests = userRequests.filter(r => r.status !== 'Fulfilled');
  
  // Find matches and deliveries destined for this orphanage
  const matches = getData('thunai_matches');
  const deliveries = getData('thunai_deliveries');
  const donations = getData('thunai_donations');

  // Filter incoming (active, not completed) deliveries for this orphanage
  const incomingMatches = matches.filter(m => m.orphanage_id === currentOrph.id && m.status !== 'Confirmed');
  
  // Completed deliveries
  const completedMatches = matches.filter(m => m.orphanage_id === currentOrph.id && m.status === 'Confirmed');

  // Handle Canvas Drawing Logic for Signature
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
    }
  }, [activeTab, incomingMatches]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsSigned(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
    setSignerName('');
  };

  // Post Request Form submission
  const handlePostRequest = (e) => {
    e.preventDefault();

    if (!itemName || !quantity || !requiredDate) {
      alert("Please fill in item name, quantity, and required-by date.");
      return;
    }

    const requestData = {
      category: category,
      item_name: itemName,
      quantity: parseInt(quantity),
      priority: priority,
      required_date: requiredDate,
      description: description,
      image_url: imagePreview
    };

    createRequest(currentOrph.id, requestData);

    // Refresh state
    setRequests(getData('thunai_requests'));
    setNotifications(getData('thunai_notifications'));

    // Reset Form
    setItemName('');
    setQuantity('');
    setDescription('');
    setImagePreview(null);
    setActiveTab('incoming');
  };

  // Fast 1-Click SOS Urgent Emergency Request
  const handleQuickSOS = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const reqDate = tomorrow.toISOString().split('T')[0];

    const emergencyData = {
      category: 'Food',
      item_name: 'Urgent Meal Packets / Dry Ration Need',
      quantity: currentOrph.children_count || 45,
      priority: 'Urgent',
      required_date: reqDate,
      description: `EMERGENCY SOS: ${currentOrph.name} needs immediate lunch/dinner for ${currentOrph.children_count} children today due to kitchen supply deficit. Verified NGOs please respond.`
    };

    createRequest(currentOrph.id, emergencyData);
    setRequests(getData('thunai_requests'));
    setNotifications(getData('thunai_notifications'));
    alert(`🚨 SOS Emergency Request for ${currentOrph.children_count} meals broadcasted to all verified NGOs!`);
    setActiveTab('incoming');
  };

  // Confirm receipt and release custody transition
  const handleConfirmReceipt = (delId) => {
    if (!isSigned && !signerName) {
      alert("Please sign on the signature pad or type your name to confirm receipt.");
      return;
    }

    updateDeliveryStatus(delId, 'Confirmed');

    // Refresh states
    setRequests(getData('thunai_requests'));
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));

    // Reset signaturepad
    setIsSigned(false);
    setSignerName('');
    alert("✅ Donation Successfully Received! Custody closed. Impact metrics updated.");
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Profile Overview Banner */}
      <div className="card-glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderLeft: '5px solid var(--secondary)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Orphanage Portal
            </span>
            {isVerified ? (
              <span className="badge badge-success" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <ShieldCheck size={12} /> Verified Orphanage
              </span>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                Pending Verification
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.85rem', marginTop: '0.25rem', fontFamily: 'Outfit, sans-serif' }}>{currentOrph.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            📍 Base Coordinates: Lat: {currentOrph.location.lat}, Lng: {currentOrph.location.lng} | Sheltering: <strong>{currentOrph.children_count} Children</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-sm" 
            style={{ backgroundColor: '#ef4444', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)' }}
            onClick={handleQuickSOS}
          >
            <AlertTriangle size={16} className="animate-pulse-slow" /> 1-Click SOS Food Need
          </button>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'Outfit, sans-serif' }}>{activeRequests.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Needs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>{completedMatches.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Received</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button className={`btn btn-sm ${activeTab === 'incoming' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('incoming')}>
          <Clock size={16} /> Incoming Deliveries ({incomingMatches.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'request' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('request')}>
          <Plus size={16} /> Request Resource (New)
        </button>
        <button className={`btn btn-sm ${activeTab === 'history' ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setActiveTab('history')}>
          <CheckSquare size={16} /> Received History ({completedMatches.length})
        </button>
      </div>

      {/* TAB 1: INCOMING DELIVERIES */}
      {activeTab === 'incoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {incomingMatches.length > 0 ? (
            incomingMatches.map((matchRecord) => {
              const delivery = deliveries.find(d => d.match_id === matchRecord.id);
              const donation = donations.find(d => d.id === matchRecord.donation_id);
              const requestObj = requests.find(r => r.id === matchRecord.request_id);

              if (!delivery || !donation || !requestObj) return null;

              const ngos = getData('thunai_ngos');
              const ngo = ngos.find(n => n.id === delivery.NGO_id) || { name: 'CareConnect Foundation' };

              return (
                <div key={matchRecord.id} className="card animate-slide-up" style={{ padding: '1.75rem' }}>
                  
                  {/* Status Visual Tracker */}
                  <StatusTracker 
                    match={matchRecord} 
                    delivery={delivery} 
                    donation={donation} 
                    request={requestObj} 
                  />

                  {/* Arrived Confirmation Modal Panel */}
                  {delivery.status === 'Delivered' && (
                    <div 
                      className="animate-slide-up"
                      style={{ 
                        marginTop: '1.75rem', 
                        padding: '1.75rem', 
                        backgroundColor: 'var(--primary-light)', 
                        border: '2px solid var(--primary-border)',
                        borderRadius: 'var(--radius-md)' 
                      }}
                    >
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
                        <Sparkles size={20} /> 🎉 Donation Arrived at Your Home!
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                        The <strong>{matchRecord.quantity} x {donation.item_name}</strong> was delivered by <strong>{ngo.name}</strong>. Please sign below to confirm receipt and finalize delivery.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.25rem' }}>
                        {/* Interactive Signature Canvas drawing pad */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. Draw Digital Signature:</span>
                          <canvas 
                            ref={canvasRef}
                            width={320}
                            height={120}
                            className="signature-pad"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            style={{ backgroundColor: '#ffffff' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Draw with mouse or finger inside the box.</span>
                            <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: '0.75rem', color: 'var(--danger)', textDecoration: 'underline' }} onClick={clearSignature}>
                              Clear Signature
                            </button>
                          </div>
                        </div>

                        {/* Text Cursive input option */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">2. Or Type Signatory Full Name & Role:</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Sister Maria (Superintendent, Hope Home)" 
                            className="form-input" 
                            value={signerName}
                            onChange={(e) => { setSignerName(e.target.value); setIsSigned(e.target.value.length > 0); }}
                          />
                          {signerName && (
                            <div style={{ marginTop: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Signature Cursive Verification:</span>
                              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.35rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                {signerName}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem', fontSize: '1rem', fontWeight: 800 }}
                        onClick={() => handleConfirmReceipt(delivery.id)}
                        disabled={!isSigned}
                      >
                        CONFIRM RECEIPT & CLOSE TRANSIT
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '260px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <Clock size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No Incoming Deliveries</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', textAlign: 'center', maxWidth: '450px' }}>
                There are no active shipments currently matched. Post a new resource need to trigger matching.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUEST FORM */}
      {activeTab === 'request' && (
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              “Request What You Need.”
            </span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.25rem', fontFamily: 'Outfit, sans-serif' }}>
              Post Resource Requirement
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Create a request for food, books, stationery, or supplies to be matched with donors in Trichy.
            </p>
          </div>

          <form onSubmit={handlePostRequest}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Resource Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Food">🍱 Food / Meals</option>
                  <option value="Books">📚 Books</option>
                  <option value="School Bags">🎒 School Bags</option>
                  <option value="Stationery">✏️ Stationery Supplies</option>
                  <option value="Clothes">👕 Clothes</option>
                  <option value="Grocery">🍚 Groceries / Grains</option>
                  <option value="Educational">🎓 Educational / Learning Kits</option>
                  <option value="Furniture">🪑 Furniture</option>
                  <option value="Electronics">💻 Electronics</option>
                  <option value="Other">🧸 Other Needs</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resource Item Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vegetarian Lunch Packets, 192-page Notebooks" 
                  className="form-input"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Required Quantity</label>
                <input 
                  type="number" 
                  placeholder="e.g. 80 packets or units" 
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Normal">🟢 Normal Priority</option>
                  <option value="Medium">🟡 Medium Urgency</option>
                  <option value="Urgent">🔴 Urgent Priority</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required By Date</label>
              <input 
                type="date" 
                className="form-input"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Specific Requirement Details</label>
              <textarea 
                placeholder="e.g. Looking for nutritious vegetarian lunch packets for 45 school children and resident staff." 
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem', fontSize: '1rem' }}>
              🏠 POST RESOURCE REQUEST
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: RECEIVED HISTORY */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {completedMatches.length > 0 ? (
            completedMatches.map((m) => {
              const donation = donations.find(d => d.id === m.donation_id);
              const delivery = deliveries.find(d => d.match_id === m.id);
              const ngo = getData('thunai_ngos').find(n => n.id === delivery?.NGO_id);

              return (
                <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)', padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Successfully Received</span>
                    <h4 style={{ fontSize: '1.15rem', fontFamily: 'Outfit, sans-serif' }}>{m.quantity} x {donation?.item_name || 'Resources'}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Delivered by <strong>{ngo?.name || 'CareConnect NGO'}</strong> | Received on: {delivery?.completed_at ? new Date(delivery.completed_at).toLocaleDateString() : 'Verified'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <UserCheck size={20} /> Receipt Recorded
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '220px', color: 'var(--text-muted)' }}>
              <CheckSquare size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No received shipments yet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

