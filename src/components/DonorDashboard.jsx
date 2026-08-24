import React, { useState } from 'react';
import { Gift, Heart, Clock, MapPin, Truck, Plus, History, Package, Coffee, FileText, CheckCircle, Upload, Award, AlertCircle, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { getData, createDonation, MAP_CENTER, getDistance } from '../services/db';
import StatusTracker from './StatusTracker';
import CertificateModal from './CertificateModal';

export default function DonorDashboard({ currentUserId, donations, setDonations, setNotifications, setStats }) {
  const [activeTab, setActiveTab] = useState('active'); // active, post, history
  const [donationType, setDonationType] = useState('food'); // food, item
  
  // Food donation fields
  const [foodName, setFoodName] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [foodQuantity, setFoodQuantity] = useState('');
  const [mealsCount, setMealsCount] = useState('');
  const [prepTime, setPrepTime] = useState('7:00 PM');
  const [bestBefore, setBestBefore] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  
  // Item donation fields
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Books');
  const [itemQuantity, setItemQuantity] = useState('');
  const [condition, setCondition] = useState('Good');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  
  // Shared fields
  const [locationPreset, setLocationPreset] = useState('center'); // center, east, west, south
  const [priority, setPriority] = useState('Normal');
  const [contactInfo, setContactInfo] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState(null);

  // Location Presets matching Trichy seed coordinates
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

  // Handle simulated image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostDonation = (e) => {
    e.preventDefault();

    const loc = locationOptions[locationPreset];
    let finalPriority = priority;
    let donationData = null;

    if (donationType === 'food') {
      if (!foodName || !foodQuantity) {
        alert("Please provide the food name and quantity.");
        return;
      }

      // Check if food expiring within 4 hours -> Auto promote to URGENT
      if (bestBefore) {
        const hoursLeft = (new Date(bestBefore) - new Date()) / (1000 * 60 * 60);
        if (hoursLeft > 0 && hoursLeft <= 4) {
          finalPriority = 'Urgent';
        }
      }

      donationData = {
        category: 'Food',
        item_name: `${foodName} (${isVeg ? 'Vegetarian' : 'Non-Vegetarian'})`,
        quantity: parseInt(foodQuantity),
        is_veg: isVeg,
        meals_count: parseInt(mealsCount || foodQuantity),
        preparation_time: prepTime,
        expiry_time: bestBefore ? new Date(bestBefore).toISOString() : null,
        location: { lat: loc.lat, lng: loc.lng },
        priority: finalPriority,
        description: `Food: ${isVeg ? 'Veg' : 'Non-Veg'} | Approx Meals: ${mealsCount || foodQuantity} | Prepared: ${prepTime}. ${foodDescription}`,
        contact_info: `${contactInfo || donorUser.phone} (${loc.name})`,
        image_url: imagePreview
      };
    } else {
      if (!itemName || !itemQuantity) {
        alert("Please provide the item name and quantity.");
        return;
      }

      donationData = {
        category: category,
        item_name: itemName,
        quantity: parseInt(itemQuantity),
        condition: condition,
        location: { lat: loc.lat, lng: loc.lng },
        priority: finalPriority,
        expiry_time: null,
        description: `Category: ${category} | Condition: ${condition} | Available: ${availabilityDate || 'Immediate'}. ${itemDescription}`,
        contact_info: `${contactInfo || donorUser.phone} (${loc.name})`,
        image_url: imagePreview
      };
    }

    createDonation(currentUserId, donationData);
    
    // Refresh lists
    setDonations(getData('thunai_donations'));
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));

    // Reset Form
    setFoodName('');
    setFoodQuantity('');
    setMealsCount('');
    setBestBefore('');
    setFoodDescription('');
    setItemName('');
    setItemQuantity('');
    setItemDescription('');
    setImagePreview(null);
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
      <div className="card-glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderLeft: '5px solid var(--primary)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Donor Portal</span>
          <h2 style={{ fontSize: '1.85rem', marginTop: '0.25rem', fontFamily: 'Outfit, sans-serif' }}>Welcome, {donorUser.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={14} className="text-primary" /> Registered Base: Lat: {donorUser.location.lat}, Lng: {donorUser.location.lng} (Trichy)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{userDonations.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Posts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>{pastDonations.length}</div>
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
                      <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>{don.quantity} x {don.item_name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Posted: {new Date(don.created_at).toLocaleDateString()} at {new Date(don.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      {don.priority === 'Urgent' ? (
                        <span className="badge badge-danger">🔴 URGENT</span>
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
                    <div style={{ padding: '1.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px dashed var(--text-muted)' }}>
                      <Clock className="animate-pulse-slow text-warning" size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                      <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>Smart Matching In Progress...</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '450px', display: 'inline-block', marginTop: '0.25rem' }}>
                        THUNAI's matching engine is scanning nearby verified NGOs and orphanage needs in Trichy to route this resource.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '260px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <Heart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No Active Donations</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>You don't have any items currently in transit. Click "Give What You Can" to share surplus food or supplies.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POST DONATION FORM */}
      {activeTab === 'post' && (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              “Give What You Can.”
            </span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.25rem', fontFamily: 'Outfit, sans-serif' }}>
              Submit Surplus Donation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              THUNAI will immediately calculate nearby NGO transport bridges and orphanage matches.
            </p>
          </div>

          {/* Form Switcher */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.3rem', marginBottom: '1.75rem', background: 'var(--bg-tertiary)' }}>
            <button 
              type="button" 
              className={`btn btn-sm`} 
              style={{ flex: 1, backgroundColor: donationType === 'food' ? 'var(--primary)' : 'transparent', color: donationType === 'food' ? 'white' : 'var(--text-secondary)', fontWeight: 700 }}
              onClick={() => setDonationType('food')}
            >
              🍱 Food Donation (Urgent Rescue)
            </button>
            <button 
              type="button" 
              className={`btn btn-sm`} 
              style={{ flex: 1, backgroundColor: donationType === 'item' ? 'var(--secondary)' : 'transparent', color: donationType === 'item' ? 'white' : 'var(--text-secondary)', fontWeight: 700 }}
              onClick={() => setDonationType('item')}
            >
              📚 Item Donation (Books, Clothes & Goods)
            </button>
          </div>

          <form onSubmit={handlePostDonation}>
            
            {donationType === 'food' ? (
              <>
                {/* FOOD DONATION FORM FIELDS */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Food Name / Menu Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Veg Briyani, Chapathi with Paneer Gravy" 
                      className="form-input"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dietary Type</label>
                    <div style={{ display: 'flex', gap: '1.5rem', height: '100%', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        <input type="radio" name="veg" checked={isVeg} onChange={() => setIsVeg(true)} className="form-checkbox" style={{ borderRadius: '50%' }} /> 🟢 Vegetarian
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        <input type="radio" name="veg" checked={!isVeg} onChange={() => setIsVeg(false)} className="form-checkbox" style={{ borderRadius: '50%' }} /> 🔴 Non-Vegetarian
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Quantity (Packets / Units)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 100 packets" 
                      className="form-input"
                      value={foodQuantity}
                      onChange={(e) => { setFoodQuantity(e.target.value); if (!mealsCount) setMealsCount(e.target.value); }}
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Approx Meals Served</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 100 children" 
                      className="form-input"
                      value={mealsCount}
                      onChange={(e) => setMealsCount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Preparation Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 7:00 PM" 
                      className="form-input"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Best-Before / Expiry Time</label>
                    <input 
                      type="datetime-local" 
                      className="form-input"
                      value={bestBefore}
                      onChange={(e) => setBestBefore(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>
                      ⚠️ Approaching expiry (&lt; 4 hours) automatically receives HIGHER matching priority.
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Packaging Instructions</label>
                  <textarea 
                    placeholder="e.g. Prepared for evening banquet. Packed hygienically in individual foil boxes with water bottles." 
                    className="form-textarea"
                    value={foodDescription}
                    onChange={(e) => setFoodDescription(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                {/* ITEM DONATION FORM FIELDS */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Item Category</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Books">📚 Books</option>
                      <option value="School Bags">🎒 School Bags</option>
                      <option value="Stationery">✏️ Stationery Supplies</option>
                      <option value="Clothes">👕 Clothes</option>
                      <option value="Grocery">🍚 Groceries / Grains</option>
                      <option value="Educational">🎓 Educational Materials</option>
                      <option value="Furniture">🪑 Furniture</option>
                      <option value="Electronics">💻 Electronics</option>
                      <option value="Other">🧸 Other Useful Items</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Item Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 192-Page Ruled Notebooks, School Uniforms" 
                      className="form-input"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 50" 
                      className="form-input"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Item Condition</label>
                    <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
                      <option value="New">Brand New</option>
                      <option value="Excellent">Like New / Excellent</option>
                      <option value="Good">Gently Used / Good</option>
                      <option value="Fair">Fair / Usable</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Available Pickup Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={availabilityDate}
                    onChange={(e) => setAvailabilityDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Specifications</label>
                  <textarea 
                    placeholder="e.g. Ruled notebooks suitable for 4th to 8th standard students, boxed in packages of 25." 
                    className="form-textarea"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* SHARED LOCATION & CONTACT FIELDS */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Pickup Location Zone (Trichy)</label>
                <select className="form-select" value={locationPreset} onChange={(e) => setLocationPreset(e.target.value)}>
                  <option value="center">Trichy City Center (Cantonment)</option>
                  <option value="east">East Trichy (Kailasapuram / NIT area)</option>
                  <option value="west">West Trichy (Thillai Nagar)</option>
                  <option value="south">South Trichy (K K Nagar)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Normal">🟢 Normal</option>
                  <option value="High">🟡 High Priority</option>
                  <option value="Urgent">🔴 Urgent Priority</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person & Phone for NGO Driver</label>
              <input 
                type="text" 
                placeholder="e.g. +91 98765 43210 (Manager, Front Desk)" 
                className="form-input"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>

            {/* Image Upload Option */}
            <div className="form-group">
              <label className="form-label">Attach Item / Food Photo (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> Choose Image
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {imagePreview && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={14} /> Image Attached
                  </span>
                )}
              </div>
              {imagePreview && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className={donationType === 'food' ? 'btn btn-primary' : 'btn btn-secondary'} 
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.9rem', fontSize: '1rem' }}
            >
              {donationType === 'food' ? '🍱 POST FOOD DONATION' : '📚 POST ITEM DONATION'}
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
              const orphName = tracking?.match?.orphanage_id ? getData('thunai_orphanages').find(o => o.id === tracking.match.orphanage_id)?.name : 'Hope Children Home';
              const ngoName = tracking?.delivery?.NGO_id ? getData('thunai_ngos').find(n => n.id === tracking.delivery.NGO_id)?.name : 'CareConnect Foundation';

              return (
                <div key={don.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)', padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Delivered & Confirmed</span>
                    <h4 style={{ fontSize: '1.15rem', fontFamily: 'Outfit, sans-serif' }}>{don.quantity} x {don.item_name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Delivered to <strong>{orphName}</strong> via <strong>{ngoName}</strong> | Completed: {tracking?.delivery?.completed_at ? new Date(tracking.delivery.completed_at).toLocaleDateString() : 'Verified'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--primary)', borderColor: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setSelectedCert({
                        donorName: donorUser.name,
                        itemName: don.item_name,
                        quantity: don.quantity,
                        orphanageName: orphName,
                        ngoName: ngoName,
                        date: tracking?.delivery?.completed_at ? new Date(tracking.delivery.completed_at).toLocaleDateString() : new Date().toLocaleDateString()
                      })}
                    >
                      <Award size={16} /> View Impact Certificate
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', height: '220px', color: 'var(--text-muted)' }}>
              <History size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No completed donations yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal 
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          donorName={selectedCert.donorName}
          itemName={selectedCert.itemName}
          quantity={selectedCert.quantity}
          orphanageName={selectedCert.orphanageName}
          ngoName={selectedCert.ngoName}
          date={selectedCert.date}
        />
      )}

    </div>
  );
}

