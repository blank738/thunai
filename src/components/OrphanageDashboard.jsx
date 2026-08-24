import React, { useState, useRef, useEffect } from 'react';
import { Home, ListPlus, CheckSquare, Plus, Clock, HelpCircle, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
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
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
    }
  }, [activeTab, incomingMatches]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Support mouse and touch
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
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
    
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
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
      alert("Please fill in item name, quantity, and date.");
      return;
    }

    const requestData = {
      category: category,
      item_name: itemName,
      quantity: parseInt(quantity),
      priority: priority,
      required_date: requiredDate,
      description: description
    };

    createRequest(currentOrph.id, requestData);

    // Refresh state
    setRequests(getData('thunai_requests'));
    setNotifications(getData('thunai_notifications'));

    // Reset Form
    setItemName('');
    setQuantity('');
    setDescription('');
    setActiveTab('incoming');
  };

  // Confirm receipt and release custody transition
  const handleConfirmReceipt = (delId) => {
    if (!isSigned && !signerName) {
      alert("Please sign or enter your name to confirm receipt.");
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
    alert("Donation Received successfully! Custody closed. Impact metrics updated.");
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Profile Overview */}
      <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderLeft: '5px solid var(--secondary)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Orphanage Portal</span>
            {isVerified ? (
              <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                Verified Home
              </span>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                Pending Verification
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{currentOrph.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            📍 Location: Lat: {currentOrph.location.lat}, Lng: {currentOrph.location.lng} | Sheltering: {currentOrph.children_count} Children
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>{activeRequests.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Needs</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>{completedMatches.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Received Posts</div>
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
          
          {/* List Active Requests matching current deliveries */}
          {incomingMatches.length > 0 ? (
            incomingMatches.map((matchRecord) => {
              const delivery = deliveries.find(d => d.match_id === matchRecord.id);
              const donation = donations.find(d => d.id === matchRecord.donation_id);
              const requestObj = requests.find(r => r.id === matchRecord.request_id);

              if (!delivery || !donation || !requestObj) return null;

              const ngos = getData('thunai_ngos');
              const ngo = ngos.find(n => n.id === delivery.NGO_id) || { name: 'Assigned NGO' };

              return (
                <div key={matchRecord.id} className="card" style={{ padding: '1.5rem' }}>
                  
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
                        marginTop: '1.5rem', 
                        padding: '1.5rem', 
                        backgroundColor: 'var(--primary-light)', 
                        border: '1px solid var(--primary-border)',
                        borderRadius: 'var(--radius-md)' 
                      }}
                    >
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
                        <Sparkles size={18} /> 🎉 Resource Arrived!
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        The <strong>{matchRecord.quantity} x {donation.item_name}</strong> was delivered by <strong>{ngo.name}</strong>. Please provide a signature to confirm receipt.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        {/* Interactive Signature Canvas drawing pad */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Digital Signature Pad:</span>
                          <canvas 
                            ref={canvasRef}
                            width={280}
                            height={120}
                            className="signature-pad"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Use mouse or touch to sign inside box.</span>
                            <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: '0.7rem', textDecoration: 'underline' }} onClick={clearSignature}>Clear</button>
                          </div>
                        </div>

                        {/* Text Cursive input option */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Or Type Signatory Full Name:</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Sister Maria (Superintendent)" 
                            className="form-input" 
                            value={signerName}
                            onChange={(e) => { setSignerName(e.target.value); setIsSigned(e.target.value.length > 0); }}
                          />
                          {signerName && (
                            <div style={{ marginTop: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cursive Preview:</span>
                              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                {signerName}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '1rem' }}
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
            <div className="flex-center" style={{ flexDirection: 'column', height: '240px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <Clock size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No Incoming Deliveries</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', textAlign: 'center', maxWidth: '400px' }}>
                There are no active transits matching your requests. Post a new resource need to trigger matching.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUEST FORM */}
      {activeTab === 'request' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListPlus size={20} className="text-secondary" /> Request Resource Needs
          </h3>

          {!isVerified && (
            <div className="card" style={{ borderLeft: '4px solid var(--danger)', backgroundColor: '#fef2f2', padding: '1rem', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <ShieldAlert size={16} /> Restricted Access
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Your orphanage is currently pending verification. You can submit requests, but matching with verified NGOs will commence only after administrator approval.
              </p>
            </div>
          )}

          <form onSubmit={handlePostRequest}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Resource Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Food">🍱 Food / Meals</option>
                  <option value="Books">📚 Books</option>
                  <option value="Stationery">✏️ Stationery Supplies</option>
                  <option value="Clothes">👕 Clothes</option>
                  <option value="Grocery">🍚 Groceries / Grains</option>
                  <option value="Educational">🎓 Educational / Material</option>
                  <option value="Other">🧸 Other Needs</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resource Item Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Leftover meal packets, notebooks" 
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
                  placeholder="e.g. 80 packets or notebooks" 
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
                  <option value="Urgent">🔴 Urgent Needs</option>
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
              <label className="form-label">Description / Delivery Instructions</label>
              <textarea 
                placeholder="e.g. Looking for simple vegetarian meals for lunch, or 40-page double line writing books." 
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
              POST REQUEST NEED
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

              return (
                <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)', padding: '1rem 1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem' }}>{m.quantity} x {donation?.item_name || 'Resources'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Delivered by NGO | Received on: {delivery?.completed_at ? new Date(delivery.completed_at).toLocaleDateString() : 'Confirmed'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <UserCheck size={18} /> Successfully Received
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '200px', color: 'var(--text-muted)' }}>
              <CheckSquare size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No received shipments yet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
