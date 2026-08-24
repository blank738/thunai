import React, { useState } from 'react';
import { Gift, Heart, Clock, MapPin, Truck, Plus, History, Package, Coffee, FileText, CheckCircle } from 'lucide-react';
import { getData, createDonation, MAP_CENTER, getDistance } from '../services/db';
import StatusTracker from './StatusTracker';

export default function DonorDashboard({ currentUserId, donations, setDonations, setNotifications, setStats }) {
  const [activeTab, setActiveTab] = useState('active'); // active, post, history
  const [donationType, setDonationType] = useState('food'); // food, item
  
  // Form fields
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Food');
  const [isVeg, setIsVeg] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [mealsCount, setMealsCount] = useState('');
  const [bestBefore, setBestBefore] = useState('');
  const [condition, setCondition] = useState('Good');
  const [locationPreset, setLocationPreset] = useState('center'); // center, east, west, south
  const [priority, setPriority] = useState('Normal');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // Location Presets matching seed coordinate scopes
  const locationOptions = {
    center: { lat: 10.7920, lng: 78.6980, name: 'Cantonment, Trichy' },
    east: { lat: 10.8120, lng: 78.7150, name: 'Kailasapuram, Trichy' },
    west: { lat: 10.7990, lng: 78.6850, name: 'Thillai Nagar, Trichy' },
    south: { lat: 10.7800, lng: 78.7050, name: 'K K Nagar, Trichy' }
  };

  const donorUser = getData('thunai_users').find(u => u.id === currentUserId) || { name: 'Donor' };
  
  // Filter active and history donations for current donor
  const userDonations = donations.filter(d => d.donor_id === currentUserId);
  const activeDonations = userDonations.filter(d => d.status !== 'Confirmed');
  const pastDonations = userDonations.filter(d => d.status === 'Confirmed');

  const handlePostDonation = (e) => {
    e.preventDefault();

    if (!itemName || !quantity) {
      alert("Please fill in the item name and quantity.");
      return;
    }

    const loc = locationOptions[locationPreset];

    // For food, if best before is under 4 hours, auto raise priority
    let finalPriority = priority;
    if (donationType === 'food' && bestBefore) {
      const hoursLeft = (new Date(bestBefore) - new Date()) / (1000 * 60 * 60);
      if (hoursLeft > 0 && hoursLeft < 4) {
        finalPriority = 'Urgent';
      }
    }

    const donationData = {
      category: donationType === 'food' ? 'Food' : category,
      item_name: donationType === 'food' ? `${itemName} (${isVeg ? 'Veg' : 'Non-Veg'})` : itemName,
      quantity: parseInt(quantity),
      location: { lat: loc.lat, lng: loc.lng },
      priority: finalPriority,
      expiry_time: donationType === 'food' && bestBefore ? new Date(bestBefore).toISOString() : null,
      description: `${donationType === 'food' ? `Meals served: ${mealsCount || quantity}. ` : `Condition: ${condition}. `}${description}`,
      contact_info: `${contactInfo || donorUser.phone} (${loc.name})`
    };

    createDonation(currentUserId, donationData);
    
    // Refresh lists
    setDonations(getData('thunai_donations'));
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));

    // Reset Form
    setItemName('');
    setQuantity('');
    setMealsCount('');
    setBestBefore('');
    setDescription('');
    setContactInfo('');
    setActiveTab('active');
  };

  // Find linked match & delivery for status tracker
  const getTrackingData = (donationId) => {
    const matches = getData('thunai_matches');
    const deliveries = getData('thunai_deliveries');
    const requests = getData('thunai_requests');

    const match = matches.find(m => m.donation_id === donationId && m.status !== 'Declined');
    if (!match) return null;

    const delivery = deliveries.find(d => d.match_id === match.id);
    const request = requests.find(r => r.id === match.request_id);

    return { match, delivery, request };
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Profile Overview Banner */}
      <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderLeft: '5px solid var(--primary)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Donor Portal</span>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>Welcome, {donorUser.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={14} /> Registered Location: Lat: {donorUser.location.lat}, Lng: {donorUser.location.lng}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{userDonations.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Posts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>{pastDonations.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button className={`btn btn-sm ${activeTab === 'active' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('active')}>
          <Package size={16} /> Active Trackings ({activeDonations.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'post' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('post')}>
          <Plus size={16} /> Give What You Can (New)
        </button>
        <button className={`btn btn-sm ${activeTab === 'history' ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setActiveTab('history')}>
          <History size={16} /> Donation History ({pastDonations.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE TRACKING */}
      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeDonations.length > 0 ? (
            activeDonations.map((don) => {
              const tracking = getTrackingData(don.id);
              return (
                <div key={don.id} className="card" style={{ padding: '1.5rem' }}>
                  <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <div>
                      <span className="badge badge-info" style={{ marginBottom: '0.25rem' }}>{don.category}</span>
                      <h3 style={{ fontSize: '1.2rem' }}>{don.quantity} x {don.item_name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Posted: {new Date(don.created_at).toLocaleDateString()} at {new Date(don.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      {don.priority === 'Urgent' ? (
                        <span className="badge badge-danger">🔴 Urgent</span>
                      ) : (
                        <span className="badge badge-neutral">{don.priority}</span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {don.description}
                  </p>

                  {/* Status Visual Tracker */}
                  {tracking ? (
                    <StatusTracker 
                      match={tracking.match} 
                      delivery={tracking.delivery} 
                      donation={don} 
                      request={tracking.request} 
                    />
                  ) : (
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px dashed var(--text-muted)' }}>
                      <Clock className="animate-pulse-slow text-warning" size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                      <strong style={{ fontSize: '0.9rem', display: 'block' }}>Smart Matching In Progress...</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        THUNAI's matching engine is scanning nearby verified NGOs and orphanage requests to secure transport.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '240px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <Heart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No Active Donations</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>You don't have any items in transit. Click "Give What You Can" to share surplus resources.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POST DONATION FORM */}
      {activeTab === 'post' && (
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift size={20} className="text-secondary" /> Submit Donation Offer
          </h3>

          {/* Form Switcher */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.25rem', marginBottom: '1.5rem' }}>
            <button 
              type="button" 
              className={`btn btn-sm`} 
              style={{ flex: 1, backgroundColor: donationType === 'food' ? 'var(--primary-light)' : 'transparent', color: donationType === 'food' ? 'var(--primary)' : 'var(--text-secondary)' }}
              onClick={() => setDonationType('food')}
            >
              🍱 Food Donation
            </button>
            <button 
              type="button" 
              className={`btn btn-sm`} 
              style={{ flex: 1, backgroundColor: donationType === 'item' ? 'var(--primary-light)' : 'transparent', color: donationType === 'item' ? 'var(--primary)' : 'var(--text-secondary)' }}
              onClick={() => setDonationType('item')}
            >
              📚 Item Donation
            </button>
          </div>

          <form onSubmit={handlePostDonation}>
            
            {/* Form Fields */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{donationType === 'food' ? 'Food Name / Menu' : 'Item Name'}</label>
                <input 
                  type="text" 
                  placeholder={donationType === 'food' ? 'e.g. Veg Briyani, Chapathi with Gravy' : 'e.g. Ruled Notebooks, School Uniforms'} 
                  className="form-input"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              {donationType === 'food' ? (
                <div className="form-group">
                  <label className="form-label">Food Type</label>
                  <div style={{ display: 'flex', gap: '1rem', height: '100%', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="radio" name="veg" checked={isVeg} onChange={() => setIsVeg(true)} className="form-checkbox" style={{ borderRadius: '50%' }} /> Vegetarian
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="radio" name="veg" checked={!isVeg} onChange={() => setIsVeg(false)} className="form-checkbox" style={{ borderRadius: '50%' }} /> Non-Vegetarian
                    </label>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Item Category</label>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Books">📚 Books</option>
                    <option value="Stationery">✏️ Stationery</option>
                    <option value="Clothes">👕 Clothes</option>
                    <option value="Grocery">🍚 Groceries / Grains</option>
                    <option value="Furniture">🪑 Furniture</option>
                    <option value="Electronics">💻 Electronics</option>
                    <option value="Other">🧸 Other Useful Items</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  placeholder={donationType === 'food' ? 'e.g. 100 packets' : 'e.g. 50 bags'} 
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              {donationType === 'food' ? (
                <div className="form-group">
                  <label className="form-label">Approx Meals Covered</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 100 meals" 
                    className="form-input"
                    value={mealsCount}
                    onChange={(e) => setMealsCount(e.target.value)}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
                    <option value="New">Brand New</option>
                    <option value="Excellent">Like New / Excellent</option>
                    <option value="Good">Gently Used / Good</option>
                    <option value="Fair">Fair / Usable</option>
                  </select>
                </div>
              )}
            </div>

            {donationType === 'food' && (
              <div className="form-group">
                <label className="form-label">Best-Before / Expiry Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={bestBefore}
                  onChange={(e) => setBestBefore(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ⚠️ Food items expiring within 4 hours automatically receive HIGHER matching priority.
                </span>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Pickup Location Zone</label>
                <select className="form-select" value={locationPreset} onChange={(e) => setLocationPreset(e.target.value)}>
                  <option value="center">Trichy City Center (Cantonment)</option>
                  <option value="east">East Trichy (Kailasapuram)</option>
                  <option value="west">West Trichy (Thillai Nagar)</option>
                  <option value="south">South Trichy (K K Nagar)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Normal">🟢 Normal</option>
                  <option value="High">🟡 High</option>
                  <option value="Urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact & Details for Driver</label>
              <input 
                type="text" 
                placeholder="e.g. Phone number, gate passcode, or wedding manager name" 
                className="form-input"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Special Instructions</label>
              <textarea 
                placeholder="e.g. Clean cotton shirts, mixed sizes from 8 to 14. Boxed securely." 
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
              Post Donation Offer
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: DONATION HISTORY */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pastDonations.length > 0 ? (
            pastDonations.map((don) => {
              const tracking = getTrackingData(don.id);
              return (
                <div key={don.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)', padding: '1rem 1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem' }}>{don.quantity} x {don.item_name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Category: {don.category} | Delivered on: {tracking?.delivery?.completed_at ? new Date(tracking.delivery.completed_at).toLocaleDateString() : 'Confirmed'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle size={18} /> Delivered & Verified
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '200px', color: 'var(--text-muted)' }}>
              <History size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No completed donations yet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
