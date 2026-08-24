// Database and Smart Matching Engine Service for THUNAI
// Connect. Collect. Deliver. Hope.

// Coordinates for Trichy City Center (10.7905, 78.7047)
export const MAP_CENTER = { lat: 10.7905, lng: 78.7047 };

// Helper to calculate distance in km using Haversine formula
export function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
}

// Convert geographic coordinates to X/Y percentages for the SVG map
export function coordToPercent(lat, lng) {
  const latMin = 10.7300;
  const latMax = 10.8400;
  const lngMin = 78.6600;
  const lngMax = 78.7500;

  const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const y = 100 - ((lat - latMin) / (latMax - latMin)) * 100;
  return { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) };
}

// Web Audio API Synthesizer Chime for Notifications
export function playNotificationSound(type = 'info') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'urgent') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // AudioContext blocked or not supported
  }
}

// Initial Seed Data
const defaultUsers = [
  { id: 'usr_admin', name: 'Thunai Admin', email: 'admin@thunai.org', phone: '+91 98400 12345', role: 'admin', location: { lat: 10.7905, lng: 78.7047 } },
  
  // Donors
  { id: 'usr_donor1', name: 'Trichy Grand Palace Hall', email: 'grandpalace@gmail.com', phone: '+91 98765 43210', role: 'donor', location: { lat: 10.8120, lng: 78.7150 } },
  { id: 'usr_donor2', name: 'Apex Stationery & Book Mart', email: 'apexstationery@yahoo.com', phone: '+91 97654 32109', role: 'donor', location: { lat: 10.7800, lng: 78.7050 } },
  { id: 'usr_donor3', name: 'Ananya Krishnan (Individual)', email: 'ananya.k@gmail.com', phone: '+91 96543 21098', role: 'donor', location: { lat: 10.7920, lng: 78.6980 } },
  { id: 'usr_donor4', name: 'Sarath Kumar (Bakery Owner)', email: 'sarath.bakes@gmail.com', phone: '+91 95432 10987', role: 'donor', location: { lat: 10.7990, lng: 78.7080 } },

  // NGOs
  { id: 'usr_ngo1', name: 'CareConnect Foundation', email: 'contact@careconnect.org', phone: '+91 94321 09876', role: 'ngo', location: { lat: 10.7950, lng: 78.7120 } },
  { id: 'usr_ngo2', name: 'HopeBridge NGO', email: 'info@hopebridge.org', phone: '+91 93210 98765', role: 'ngo', location: { lat: 10.7850, lng: 78.6920 } },
  { id: 'usr_ngo3', name: 'Helping Hands Trust', email: 'admin@helpinghands.org', phone: '+91 92109 87654', role: 'ngo', location: { lat: 10.8010, lng: 78.6850 } },
  { id: 'usr_ngo4', name: 'ServeTogether Foundation', email: 'serve@servetogether.org', phone: '+91 91098 76543', role: 'ngo', location: { lat: 10.7700, lng: 78.7100 } },

  // Orphanages
  { id: 'usr_orphanage1', name: 'Little Stars Children Home', email: 'stars@littlestars.org', phone: '+91 90987 65432', role: 'orphanage', location: { lat: 10.7990, lng: 78.7250 } },
  { id: 'usr_orphanage2', name: 'Hope Children Home', email: 'home@hopeorphanage.org', phone: '+91 89876 54321', role: 'orphanage', location: { lat: 10.7680, lng: 78.6810 } },
  { id: 'usr_orphanage3', name: 'Bright Future Home', email: 'contact@brightfuture.org', phone: '+91 88765 43210', role: 'orphanage', location: { lat: 10.8200, lng: 78.7000 } },
  { id: 'usr_orphanage4', name: 'New Life Children Centre', email: 'newlife@newlife.org', phone: '+91 87654 32109', role: 'orphanage', location: { lat: 10.7500, lng: 78.7300 } }
];

const defaultNgos = [
  { id: 'ngo1', user_id: 'usr_ngo1', name: 'CareConnect Foundation', description: 'Bridging resources to children since 2018. Specializing in daily fresh food collection, temperature-safe transport, and student stationery distribution.', location: { lat: 10.7950, lng: 78.7120 }, service_radius: 15, transport_type: 'Van, Car, Volunteer vehicle', verification_status: 'verified', contact: '+91 94321 09876', completed_deliveries_count: 42 },
  { id: 'ngo2', user_id: 'usr_ngo2', name: 'HopeBridge NGO', description: 'Empowering children with quality education and sustenance supplies in rural and semi-urban Trichy areas.', location: { lat: 10.7850, lng: 78.6920 }, service_radius: 10, transport_type: 'Car, Two-wheeler', verification_status: 'verified', contact: '+91 93210 98765', completed_deliveries_count: 28 },
  { id: 'ngo3', user_id: 'usr_ngo3', name: 'Helping Hands Trust', description: 'Distributing dry grocery items, books, clothing, and digital learning devices. Volunteer driven.', location: { lat: 10.8010, lng: 78.6850 }, service_radius: 18, transport_type: 'Multiple vehicles, Van', verification_status: 'verified', contact: '+91 92109 87654', completed_deliveries_count: 65 },
  { id: 'ngo4', user_id: 'usr_ngo4', name: 'ServeTogether Foundation', description: 'Emergency food response and student school kit support across South Trichy.', location: { lat: 10.7700, lng: 78.7100 }, service_radius: 8, transport_type: 'Two-wheeler, Car', verification_status: 'pending', contact: '+91 91098 76543', completed_deliveries_count: 5 }
];

const defaultOrphanages = [
  { id: 'orph1', user_id: 'usr_orphanage1', name: 'Little Stars Children Home', description: 'Providing comprehensive care, shelter, and schooling to 65 vulnerable children in Trichy East.', location: { lat: 10.7990, lng: 78.7250 }, children_count: 65, verification_status: 'verified', contact: '+91 90987 65432', address: '14, Kamaraj Nagar, Trichy East' },
  { id: 'orph2', user_id: 'usr_orphanage2', name: 'Hope Children Home', description: 'Home to 45 bright children focusing on primary education, vocational skills, and balanced nutrition.', location: { lat: 10.7680, lng: 78.6810 }, children_count: 45, verification_status: 'verified', contact: '+91 89876 54321', address: '88, Gandhi Road, Cantonment Extn' },
  { id: 'orph3', user_id: 'usr_orphanage3', name: 'Bright Future Home', description: 'Caring for 30 school-going boys and girls. Need regular support with daily meals and textbooks.', location: { lat: 10.8200, lng: 78.7000 }, children_count: 30, verification_status: 'verified', contact: '+91 88765 43210', address: '23, Rockfort North, Srirangam Road' },
  { id: 'orph4', user_id: 'usr_orphanage4', name: 'New Life Children Centre', description: 'Shelter supporting 55 orphans with lodging, food, and foundational learning resources.', location: { lat: 10.7500, lng: 78.7300 }, children_count: 55, verification_status: 'pending', contact: '+91 87654 32109', address: '5, Airport Bypass Road, Trichy' }
];

const defaultRequests = [
  { id: 'req1', orphanage_id: 'orph2', category: 'Food', item_name: 'Veg Meal Packets', required_quantity: 80, remaining_quantity: 80, priority: 'Urgent', required_date: '2026-08-25', status: 'Pending', description: 'Needs lunch for 45 children plus 35 resident volunteers and support staff.', created_at: new Date().toISOString() },
  { id: 'req2', orphanage_id: 'orph1', category: 'Books', item_name: 'Ruled Notebooks', required_quantity: 100, remaining_quantity: 40, priority: 'High', required_date: '2026-09-01', status: 'Partially Matched', description: 'Double line and single line notebooks for primary school students term exams.', created_at: new Date().toISOString() },
  { id: 'req3', orphanage_id: 'orph3', category: 'Stationery', item_name: 'School Bags & Pencil Kits', required_quantity: 30, remaining_quantity: 30, priority: 'Medium', required_date: '2026-09-05', status: 'Pending', description: 'Durable bags and stationery pouches for children joining the school term.', created_at: new Date().toISOString() },
  { id: 'req4', orphanage_id: 'orph4', category: 'Grocery', item_name: 'Ponni Rice Bags (25kg)', required_quantity: 5, remaining_quantity: 5, priority: 'High', required_date: '2026-08-30', status: 'Pending', description: 'Monthly grain supply requirement for kitchen sustenance.', created_at: new Date().toISOString() }
];

const defaultDonations = [
  { 
    id: 'don1', 
    donor_id: 'usr_donor1', 
    category: 'Food', 
    item_name: 'Fresh Veg Briyani & Curd Rice Packets', 
    quantity: 100, 
    available_quantity: 100, 
    location: { lat: 10.8120, lng: 78.7150 }, 
    priority: 'Urgent', 
    is_veg: true,
    meals_count: 100,
    preparation_time: '7:00 PM',
    expiry_time: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(), 
    status: 'Available', 
    description: 'Surplus food from evening marriage reception. Freshly cooked vegetarian lunch packets, packed hygienically.', 
    created_at: new Date().toISOString(), 
    contact_info: '+91 98765 43210 (Manager, Grand Palace Hall)' 
  },
  { 
    id: 'don2', 
    donor_id: 'usr_donor2', 
    category: 'Books', 
    item_name: '192-Page Ruled Notebooks', 
    quantity: 150, 
    available_quantity: 90, 
    location: { lat: 10.7800, lng: 78.7050 }, 
    priority: 'Normal', 
    condition: 'New',
    expiry_time: null, 
    status: 'Available', 
    description: 'Surplus batch of high quality notebook stock from wholesale stationery store warehouse.', 
    created_at: new Date().toISOString(), 
    contact_info: '+91 97654 32109 (Apex Stationery Mart Desk)' 
  },
  { 
    id: 'don3', 
    donor_id: 'usr_donor3', 
    category: 'Clothes', 
    item_name: 'Children Cotton T-Shirts & Tops (Ages 6-12)', 
    quantity: 40, 
    available_quantity: 40, 
    location: { lat: 10.7920, lng: 78.6980 }, 
    priority: 'Normal', 
    condition: 'Excellent',
    expiry_time: null, 
    status: 'Available', 
    description: 'Gently used clean cotton clothes, washed and sorted for children aged 6 to 12.', 
    created_at: new Date().toISOString(), 
    contact_info: '+91 96543 21098 (Ananya K., Cantonment)' 
  }
];

const defaultMatches = [
  // Initial match demonstrating partial allocation of notebooks
  { 
    id: 'match_seed1', 
    donation_id: 'don2', 
    NGO_id: 'ngo1', 
    orphanage_id: 'orph1', 
    match_score: 92, 
    quantity: 60, 
    status: 'Delivered', 
    created_at: new Date().toISOString() 
  }
];

const defaultDeliveries = [
  { 
    id: 'del_seed1', 
    match_id: 'match_seed1', 
    NGO_id: 'ngo1', 
    pickup_location: { lat: 10.7800, lng: 78.7050 }, 
    delivery_location: { lat: 10.7990, lng: 78.7250 }, 
    status: 'Confirmed', 
    proof_image: 'delivered_books_proof.jpg', 
    completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() 
  }
];

const defaultNotifications = [
  { id: 'notif_1', user_id: 'usr_donor2', role: 'donor', title: 'Donation Accepted', message: 'Your donation of 60 notebooks was accepted and successfully delivered by CareConnect Foundation.', status: 'read', type: 'success', created_at: new Date().toISOString() },
  { id: 'notif_2', user_id: 'usr_ngo1', role: 'ngo', title: '🔴 Urgent Food Surplus Alert', message: '100 fresh veg meal packets available 2.4 km away from your base. Match Score: 96%.', status: 'unread', type: 'urgent', created_at: new Date().toISOString() },
  { id: 'notif_3', user_id: 'usr_orphanage1', role: 'orphanage', title: 'Resources Successfully Received', message: '60 notebooks delivered by CareConnect Foundation. Receipt recorded.', status: 'read', type: 'info', created_at: new Date().toISOString() }
];

const defaultImpactStats = {
  totalDonations: 1250,
  verifiedNgos: 85,
  orphanages: 120,
  childrenSupported: 5200,
  activeDonations: 2,
  activeDeliveries: 0,
  completedDonations: 48,
  foodSavedKg: 3500,
  itemsDistributed: 1840
};

// Initialize database in localStorage
export function initDB() {
  if (!localStorage.getItem('thunai_users')) {
    localStorage.setItem('thunai_users', JSON.stringify(defaultUsers));
    localStorage.setItem('thunai_ngos', JSON.stringify(defaultNgos));
    localStorage.setItem('thunai_orphanages', JSON.stringify(defaultOrphanages));
    localStorage.setItem('thunai_requests', JSON.stringify(defaultRequests));
    localStorage.setItem('thunai_donations', JSON.stringify(defaultDonations));
    localStorage.setItem('thunai_matches', JSON.stringify(defaultMatches));
    localStorage.setItem('thunai_deliveries', JSON.stringify(defaultDeliveries));
    localStorage.setItem('thunai_notifications', JSON.stringify(defaultNotifications));
    localStorage.setItem('thunai_stats', JSON.stringify(defaultImpactStats));
  }
}

// Database Getters
export function getData(key) {
  initDB();
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Database Setters
export function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// SMART MATCHING ENGINE
// Score = Distance Score + Resource Match + Quantity Match + Urgency + Time Availability + NGO Transport + Service Radius
export function findMatchesForDonation(donationId) {
  const donations = getData('thunai_donations');
  const donation = donations.find(d => d.id === donationId);
  if (!donation || donation.available_quantity <= 0) return [];

  const requests = getData('thunai_requests');
  const ngos = getData('thunai_ngos');
  const orphanages = getData('thunai_orphanages');
  
  const matches = [];

  // Filter requests that match category and still need resources
  const compatibleRequests = requests.filter(r => 
    r.category.toLowerCase() === donation.category.toLowerCase() && 
    r.remaining_quantity > 0 &&
    r.status !== 'Fulfilled'
  );

  for (const req of compatibleRequests) {
    const orphanageObj = orphanages.find(o => o.id === req.orphanage_id);
    if (!orphanageObj) continue;

    // Filter verified NGOs within distance limits
    const activeNgos = ngos.filter(n => n.verification_status === 'verified');

    for (const ngo of activeNgos) {
      // Calculate distances
      const distDonorToNgo = getDistance(donation.location.lat, donation.location.lng, ngo.location.lat, ngo.location.lng);
      const distNgoToOrph = getDistance(ngo.location.lat, ngo.location.lng, orphanageObj.location.lat, orphanageObj.location.lng);
      const totalDistance = distDonorToNgo + distNgoToOrph;

      // 1. Service Radius validation (Ensure NGO covers the distance)
      if (distDonorToNgo > ngo.service_radius || distNgoToOrph > ngo.service_radius) {
        continue;
      }

      let distanceScore = 0;
      let resourceScore = 20; // Exact category match
      let quantityScore = 0;
      let urgencyScore = 0;
      let timeScore = 0;
      let transportScore = 0;

      // A. Distance Score (max 30)
      if (totalDistance <= 3) distanceScore = 30;
      else if (totalDistance <= 6) distanceScore = 25;
      else if (totalDistance <= 10) distanceScore = 20;
      else if (totalDistance <= 15) distanceScore = 15;
      else distanceScore = 8;

      // B. Quantity Fit Score (max 20)
      const quantityToMatch = Math.min(donation.available_quantity, req.remaining_quantity);
      if (quantityToMatch === req.remaining_quantity) {
        quantityScore = 20; // Fully satisfies orphanage need
      } else {
        const ratio = quantityToMatch / req.required_quantity;
        quantityScore = Math.round(ratio * 20); // Partial fulfillment
      }

      // C. Urgency Score (max 15)
      const isUrgentReq = req.priority?.toLowerCase() === 'urgent';
      const isUrgentDon = donation.priority?.toLowerCase() === 'urgent';
      if (isUrgentReq || isUrgentDon) {
        urgencyScore = 15;
      } else if (req.priority?.toLowerCase() === 'high') {
        urgencyScore = 12;
      } else if (req.priority?.toLowerCase() === 'medium') {
        urgencyScore = 8;
      } else {
        urgencyScore = 4;
      }

      // D. Food Expiry & Time Availability Score (max 15)
      if (donation.category.toLowerCase() === 'food' && donation.expiry_time) {
        const hoursLeft = (new Date(donation.expiry_time) - new Date()) / (1000 * 60 * 60);
        if (hoursLeft > 0) {
          if (hoursLeft <= 2) timeScore = 15; // Extremely urgent food rescue!
          else if (hoursLeft <= 4) timeScore = 12;
          else if (hoursLeft <= 8) timeScore = 8;
          else timeScore = 5;
        }
      } else {
        timeScore = 10; // Standard availability
      }

      // E. NGO Transport Compatibility (max 10)
      const cargoSize = donation.quantity;
      const transport = (ngo.transport_type || '').toLowerCase();
      
      if (transport.includes('multiple') || transport.includes('van')) {
        transportScore = 10;
      } else if (transport.includes('car') && cargoSize <= 100) {
        transportScore = 10;
      } else if (transport.includes('two-wheeler') && cargoSize <= 25) {
        transportScore = 10;
      } else if (transport.includes('two-wheeler') && cargoSize > 25) {
        transportScore = 3;
      } else {
        transportScore = 6;
      }

      const totalScore = Math.min(distanceScore + resourceScore + quantityScore + urgencyScore + timeScore + transportScore, 100);

      matches.push({
        donation_id: donation.id,
        NGO_id: ngo.id,
        orphanage_id: orphanageObj.id,
        request_id: req.id,
        match_score: totalScore,
        score_breakdown: {
          distanceScore,
          resourceScore,
          quantityScore,
          urgencyScore,
          timeScore,
          transportScore,
          totalScore
        },
        quantity: quantityToMatch,
        donor_distance: distDonorToNgo,
        orphanage_distance: distNgoToOrph,
        total_distance: totalDistance
      });
    }
  }

  // Sort by highest match score
  return matches.sort((a, b) => b.match_score - a.match_score);
}

// Transaction: Create a Donation
export function createDonation(donorId, data) {
  const donations = getData('thunai_donations');
  const newDonation = {
    id: 'don_' + Date.now(),
    donor_id: donorId,
    category: data.category,
    item_name: data.item_name,
    quantity: parseInt(data.quantity),
    available_quantity: parseInt(data.quantity),
    allocated_quantity: 0,
    location: data.location,
    priority: data.priority || 'Normal',
    is_veg: data.is_veg !== undefined ? data.is_veg : true,
    meals_count: data.meals_count ? parseInt(data.meals_count) : parseInt(data.quantity),
    preparation_time: data.preparation_time || null,
    expiry_time: data.expiry_time || null,
    condition: data.condition || 'Good',
    image_url: data.image_url || null,
    status: 'Available',
    description: data.description,
    created_at: new Date().toISOString(),
    contact_info: data.contact_info
  };

  donations.unshift(newDonation);
  saveData('thunai_donations', donations);

  // Trigger matches automatically and notify NGOs in radius
  const matchOptions = findMatchesForDonation(newDonation.id);
  const ngos = getData('thunai_ngos');
  const notifications = getData('thunai_notifications');

  // Notify NGOs with high match score (>=60)
  matchOptions.forEach(m => {
    if (m.match_score >= 60) {
      const ngoObj = ngos.find(n => n.id === m.NGO_id);
      if (ngoObj) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: ngoObj.user_id,
          role: 'ngo',
          title: newDonation.priority === 'Urgent' ? '🔴 URGENT Donation Match' : '🎯 New Compatible Match',
          message: `${newDonation.priority === 'Urgent' ? 'Urgent ' : ''}${newDonation.quantity} ${newDonation.item_name} matches a request near you. Match Score: ${m.match_score}%.`,
          status: 'unread',
          type: newDonation.priority === 'Urgent' ? 'urgent' : 'info',
          created_at: new Date().toISOString()
        });
      }
    }
  });

  saveData('thunai_notifications', notifications);
  incrementStats('totalDonations', 1);
  incrementStats('activeDonations', 1);
  playNotificationSound(newDonation.priority === 'Urgent' ? 'urgent' : 'info');

  return newDonation;
}

// Transaction: Create an Orphanage Request
export function createRequest(orphanageId, data) {
  const requests = getData('thunai_requests');
  const newRequest = {
    id: 'req_' + Date.now(),
    orphanage_id: orphanageId,
    category: data.category,
    item_name: data.item_name,
    required_quantity: parseInt(data.quantity),
    remaining_quantity: parseInt(data.quantity),
    allocated_quantity: 0,
    priority: data.priority || 'Normal',
    required_date: data.required_date,
    image_url: data.image_url || null,
    status: 'Pending',
    description: data.description,
    created_at: new Date().toISOString()
  };

  requests.unshift(newRequest);
  saveData('thunai_requests', requests);

  // Send notification to nearby verified NGOs
  const ngos = getData('thunai_ngos');
  const notifications = getData('thunai_notifications');
  const orphanageObj = getData('thunai_orphanages').find(o => o.id === orphanageId);
  
  if (orphanageObj) {
    ngos.forEach(ngo => {
      if (ngo.verification_status === 'verified') {
        const dist = getDistance(ngo.location.lat, ngo.location.lng, orphanageObj.location.lat, orphanageObj.location.lng);
        if (dist <= ngo.service_radius) {
          notifications.unshift({
            id: 'notif_' + Date.now() + Math.random(),
            user_id: ngo.user_id,
            role: 'ngo',
            title: newRequest.priority === 'Urgent' ? '🔴 URGENT Orphanage Need' : 'New Orphanage Need',
            message: `${orphanageObj.name} needs ${newRequest.required_quantity} ${newRequest.item_name} by ${newRequest.required_date}.`,
            status: 'unread',
            type: newRequest.priority === 'Urgent' ? 'urgent' : 'info',
            created_at: new Date().toISOString()
          });
        }
      }
    });
  }

  saveData('thunai_notifications', notifications);
  playNotificationSound('info');
  return newRequest;
}

// Transaction: NGO accepts a match suggestion (Partial matching supported)
export function acceptMatch(matchData) {
  const donations = getData('thunai_donations');
  const requests = getData('thunai_requests');
  const matches = getData('thunai_matches');
  const deliveries = getData('thunai_deliveries');
  const notifications = getData('thunai_notifications');

  const donation = donations.find(d => d.id === matchData.donation_id);
  const request = requests.find(r => r.id === matchData.request_id);

  if (!donation || !request || donation.available_quantity < matchData.quantity || request.remaining_quantity < matchData.quantity) {
    throw new Error("Unable to accept match: Quantity no longer available or request has already been fulfilled.");
  }

  // Calculate allocation
  const allocQty = matchData.quantity;

  // Update Donation Quantity Handling: Never allow system to over-allocate
  donation.available_quantity -= allocQty;
  donation.allocated_quantity = (donation.allocated_quantity || 0) + allocQty;
  if (donation.available_quantity === 0) {
    donation.status = 'Allocated';
  } else {
    donation.status = 'Partially Allocated';
  }

  // Update Request Quantity Handling
  request.remaining_quantity -= allocQty;
  request.allocated_quantity = (request.allocated_quantity || 0) + allocQty;
  if (request.remaining_quantity === 0) {
    request.status = 'Fulfilled';
  } else {
    request.status = 'Partially Matched';
  }

  // Save donation and request updates
  saveData('thunai_donations', donations);
  saveData('thunai_requests', requests);

  // Save the accepted match
  const newMatch = {
    id: 'match_' + Date.now(),
    donation_id: donation.id,
    NGO_id: matchData.NGO_id,
    orphanage_id: matchData.orphanage_id,
    request_id: matchData.request_id,
    match_score: matchData.match_score,
    score_breakdown: matchData.score_breakdown,
    quantity: allocQty,
    status: 'NGO Accepted',
    created_at: new Date().toISOString()
  };
  matches.unshift(newMatch);
  saveData('thunai_matches', matches);

  // Create Delivery Record
  const orphObj = getData('thunai_orphanages').find(o => o.id === matchData.orphanage_id);
  const newDelivery = {
    id: 'del_' + Date.now(),
    match_id: newMatch.id,
    NGO_id: matchData.NGO_id,
    pickup_location: donation.location,
    delivery_location: orphObj ? orphObj.location : { lat: 10.7905, lng: 78.7047 },
    status: 'NGO Accepted',
    proof_image: null,
    completed_at: null
  };
  deliveries.unshift(newDelivery);
  saveData('thunai_deliveries', deliveries);

  const ngoObj = getData('thunai_ngos').find(n => n.id === matchData.NGO_id) || { name: 'CareConnect NGO' };

  // Notify Donor
  notifications.unshift({
    id: 'notif_' + Date.now() + Math.random(),
    user_id: donation.donor_id,
    role: 'donor',
    title: '🟢 Donation Accepted by NGO',
    message: `Your donation of ${allocQty} ${donation.item_name} has been accepted by ${ngoObj.name}. Pickup scheduling in progress.`,
    status: 'unread',
    type: 'success',
    created_at: new Date().toISOString()
  });

  // Notify Orphanage
  const orphUser = getData('thunai_users').find(u => u.id === orphObj?.user_id);
  if (orphUser) {
    notifications.unshift({
      id: 'notif_' + Date.now() + Math.random(),
      user_id: orphUser.id,
      role: 'orphanage',
      title: '🎉 Resources Matched!',
      message: `Great news! ${ngoObj.name} will deliver ${allocQty} ${donation.item_name} matching your need.`,
      status: 'unread',
      type: 'info',
      created_at: new Date().toISOString()
    });
  }

  saveData('thunai_notifications', notifications);
  incrementStats('activeDeliveries', 1);
  playNotificationSound('success');

  return newMatch;
}

// Update Delivery status (NGO updates transit workflow: NGO Accepted -> Pickup Scheduled -> Picked Up -> Out for Delivery -> Delivered -> Confirmed)
export function updateDeliveryStatus(deliveryId, newStatus, extraData = {}) {
  const deliveries = getData('thunai_deliveries');
  const matches = getData('thunai_matches');
  const notifications = getData('thunai_notifications');
  const donations = getData('thunai_donations');

  const delivery = deliveries.find(d => d.id === deliveryId);
  if (!delivery) return null;

  delivery.status = newStatus;
  
  if (newStatus === 'Delivered') {
    delivery.proof_image = extraData.proof_image || 'delivery_proof_signature.png';
  } else if (newStatus === 'Confirmed') {
    delivery.completed_at = new Date().toISOString();
  }
  saveData('thunai_deliveries', deliveries);

  // Update linked match status
  const match = matches.find(m => m.id === delivery.match_id);
  if (match) {
    match.status = newStatus;
    saveData('thunai_matches', matches);
    
    // Get donation details for notifications
    const donation = donations.find(d => d.id === match.donation_id);
    const item_name = donation ? donation.item_name : 'items';
    const ngoObj = getData('thunai_ngos').find(n => n.id === delivery.NGO_id) || { name: 'Assigned NGO' };

    // Get users involved to notify them
    const donorId = donation ? donation.donor_id : null;
    const orphanageObj = getData('thunai_orphanages').find(o => o.id === match.orphanage_id);
    const orphanageUser = orphanageObj ? getData('thunai_users').find(u => u.id === orphanageObj.user_id) : null;

    if (newStatus === 'Pickup Scheduled') {
      if (donorId) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: donorId,
          role: 'donor',
          title: '🗓️ Pickup Scheduled',
          message: `${ngoObj.name} scheduled pickup. Estimated time: ${extraData.pickup_time || 'within 1-2 hours'}.`,
          status: 'unread',
          type: 'info',
          created_at: new Date().toISOString()
        });
      }
    } else if (newStatus === 'Picked Up') {
      if (donorId) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: donorId,
          role: 'donor',
          title: '🚐 Donation Picked Up',
          message: `Your donation of ${match.quantity} ${item_name} was collected by ${ngoObj.name} and is now in vehicle custody.`,
          status: 'unread',
          type: 'info',
          created_at: new Date().toISOString()
        });
      }
      if (orphanageUser) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: orphanageUser.id,
          role: 'orphanage',
          title: '🚐 Delivery in Transit',
          message: `${ngoObj.name} has collected ${match.quantity} ${item_name} and is en route to your home.`,
          status: 'unread',
          type: 'info',
          created_at: new Date().toISOString()
        });
      }
    } else if (newStatus === 'Out for Delivery') {
      if (orphanageUser) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: orphanageUser.id,
          role: 'orphanage',
          title: '🚚 Arriving Soon!',
          message: `${ngoObj.name} vehicle is arriving shortly with ${match.quantity} ${item_name}.`,
          status: 'unread',
          type: 'info',
          created_at: new Date().toISOString()
        });
      }
    } else if (newStatus === 'Delivered') {
      if (orphanageUser) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: orphanageUser.id,
          role: 'orphanage',
          title: '🎉 Donation Arrived at Your Home!',
          message: `${match.quantity} ${item_name} has arrived. Please verify and confirm receipt to close custody.`,
          status: 'unread',
          type: 'urgent',
          created_at: new Date().toISOString()
        });
      }
    } else if (newStatus === 'Confirmed') {
      if (donorId) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: donorId,
          role: 'donor',
          title: '❤️ Donation Successfully Delivered & Verified!',
          message: `Your donation of ${match.quantity} ${item_name} was successfully received by ${orphanageObj?.name}! Impact recorded.`,
          status: 'unread',
          type: 'success',
          created_at: new Date().toISOString()
        });
      }
      
      // Update statistics
      incrementStats('activeDeliveries', -1);
      incrementStats('completedDonations', 1);
      if (donation && donation.category.toLowerCase() === 'food') {
        incrementStats('foodSavedKg', Math.round(match.quantity * 0.4)); // Appx 400g per meal packet
      }
      incrementStats('itemsDistributed', match.quantity);
      if (orphanageObj) {
        incrementStats('childrenSupported', orphanageObj.children_count || 10);
      }
    }
  }

  saveData('thunai_notifications', notifications);
  playNotificationSound(newStatus === 'Confirmed' ? 'success' : 'info');
  return delivery;
}

// Organization Verification toggle by Admin
export function verifyOrganization(type, orgId, newStatus) {
  if (type === 'ngo') {
    const ngos = getData('thunai_ngos');
    const ngo = ngos.find(n => n.id === orgId);
    if (ngo) {
      ngo.verification_status = newStatus;
      saveData('thunai_ngos', ngos);
      
      const notifications = getData('thunai_notifications');
      notifications.unshift({
        id: 'notif_' + Date.now(),
        user_id: ngo.user_id,
        role: 'ngo',
        title: newStatus === 'verified' ? '✅ Profile Verified by Admin' : 'Profile Status Updated',
        message: newStatus === 'verified' 
          ? 'Your NGO status is now verified. You have full platform access to accept donations and view recipient addresses.' 
          : `Your verification status has been changed to: ${newStatus}`,
        status: 'unread',
        type: 'info',
        created_at: new Date().toISOString()
      });
      saveData('thunai_notifications', notifications);
      if (newStatus === 'verified') incrementStats('verifiedNgos', 1);
    }
  } else if (type === 'orphanage') {
    const orphanages = getData('thunai_orphanages');
    const orphanage = orphanages.find(o => o.id === orgId);
    if (orphanage) {
      orphanage.verification_status = newStatus;
      saveData('thunai_orphanages', orphanages);
      
      const notifications = getData('thunai_notifications');
      notifications.unshift({
        id: 'notif_' + Date.now(),
        user_id: orphanage.user_id,
        role: 'orphanage',
        title: newStatus === 'verified' ? '✅ Orphanage Verified by Admin' : 'Profile Status Updated',
        message: newStatus === 'verified' 
          ? 'Your orphanage profile is now verified. You can now request resources and receive donations.' 
          : `Your verification status has been changed to: ${newStatus}`,
        status: 'unread',
        type: 'info',
        created_at: new Date().toISOString()
      });
      saveData('thunai_notifications', notifications);
    }
  }
}

// Helpers for stats incrementing
function incrementStats(field, val) {
  const stats = JSON.parse(localStorage.getItem('thunai_stats')) || defaultImpactStats;
  stats[field] = Math.max((stats[field] || 0) + val, 0);
  localStorage.setItem('thunai_stats', JSON.stringify(stats));
}

// Reset Database to Seed Data (Useful for testing walkthroughs)
export function resetDB() {
  localStorage.removeItem('thunai_users');
  localStorage.removeItem('thunai_ngos');
  localStorage.removeItem('thunai_orphanages');
  localStorage.removeItem('thunai_requests');
  localStorage.removeItem('thunai_donations');
  localStorage.removeItem('thunai_matches');
  localStorage.removeItem('thunai_deliveries');
  localStorage.removeItem('thunai_notifications');
  localStorage.removeItem('thunai_stats');
  initDB();
}

