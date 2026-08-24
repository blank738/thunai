// Database and Smart Matching Engine Service for THUNAI

// Coordinates for Trichy City Center (10.7905, 78.7047)
export const MAP_CENTER = { lat: 10.7905, lng: 78.7047 };

// Helper to calculate distance in km using Haversine formula
export function getDistance(lat1, lon1, lat2, lon2) {
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
  // Bounding box for Trichy area (approx 15km service area)
  const latMin = 10.7300;
  const latMax = 10.8400;
  const lngMin = 78.6600;
  const lngMax = 78.7500;

  const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const y = 100 - ((lat - latMin) / (latMax - latMin)) * 100; // Invert Y for SVG coord system
  return { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) };
}

// Initial Seed Data
const defaultUsers = [
  { id: 'usr_admin', name: 'Thunai Admin', email: 'admin@thunai.org', role: 'admin', location: { lat: 10.7905, lng: 78.7047 } },
  
  // Donors
  { id: 'usr_donor1', name: 'Trichy Grand Palace Hall', email: 'grandpalace@gmail.com', phone: '9876543210', role: 'donor', location: { lat: 10.8120, lng: 78.7150 } },
  { id: 'usr_donor2', name: 'Apex Stationery Mart', email: 'apexstationery@yahoo.com', phone: '9765432109', role: 'donor', location: { lat: 10.7800, lng: 78.7050 } },
  { id: 'usr_donor3', name: 'Ananya Krishnan', email: 'ananya@gmail.com', phone: '9654321098', role: 'donor', location: { lat: 10.7920, lng: 78.6980 } },
  { id: 'usr_donor4', name: 'Sarath Kumar', email: 'sarath@gmail.com', phone: '9543210987', role: 'donor', location: { lat: 10.7990, lng: 78.7080 } },

  // NGOs
  { id: 'usr_ngo1', name: 'CareConnect Foundation', email: 'contact@careconnect.org', phone: '9432109876', role: 'ngo', location: { lat: 10.7950, lng: 78.7120 } },
  { id: 'usr_ngo2', name: 'HopeBridge NGO', email: 'info@hopebridge.org', phone: '9321098765', role: 'ngo', location: { lat: 10.7850, lng: 78.6920 } },
  { id: 'usr_ngo3', name: 'Helping Hands Trust', email: 'admin@helpinghands.org', phone: '9210987654', role: 'ngo', location: { lat: 10.8010, lng: 78.6850 } },
  { id: 'usr_ngo4', name: 'ServeTogether Foundation', email: 'serve@servetogether.org', phone: '9109876543', role: 'ngo', location: { lat: 10.7700, lng: 78.7100 } },

  // Orphanages
  { id: 'usr_orphanage1', name: 'Little Stars Children Home', email: 'stars@littlestars.org', phone: '9098765432', role: 'orphanage', location: { lat: 10.7990, lng: 78.7250 } },
  { id: 'usr_orphanage2', name: 'Hope Children Home', email: 'home@hopeorphanage.org', phone: '8987654321', role: 'orphanage', location: { lat: 10.7680, lng: 78.6810 } },
  { id: 'usr_orphanage3', name: 'Bright Future Home', email: 'contact@brightfuture.org', phone: '8876543210', role: 'orphanage', location: { lat: 10.8200, lng: 78.7000 } },
  { id: 'usr_orphanage4', name: 'New Life Children Centre', email: 'newlife@newlife.org', phone: '8765432109', role: 'orphanage', location: { lat: 10.7500, lng: 78.7300 } }
];

const defaultNgos = [
  { id: 'ngo1', user_id: 'usr_ngo1', name: 'CareConnect Foundation', description: 'Bridging resources to children since 2018. Specializing in daily food collection and transport logistics.', location: { lat: 10.7950, lng: 78.7120 }, service_radius: 12, transport_type: 'Van', verification_status: 'verified' },
  { id: 'ngo2', user_id: 'usr_ngo2', name: 'HopeBridge NGO', description: 'Empowering children with education and sustenance supplies in rural Trichy areas.', location: { lat: 10.7850, lng: 78.6920 }, service_radius: 8, transport_type: 'Car', verification_status: 'verified' },
  { id: 'ngo3', user_id: 'usr_ngo3', name: 'Helping Hands Trust', description: 'Distributing dry grocery items, books and electronic materials. Volunteer driven.', location: { lat: 10.8010, lng: 78.6850 }, service_radius: 15, transport_type: 'Multiple vehicles', verification_status: 'verified' },
  { id: 'ngo4', user_id: 'usr_ngo4', name: 'ServeTogether Foundation', description: 'Emergency food response and student stationery support.', location: { lat: 10.7700, lng: 78.7100 }, service_radius: 5, transport_type: 'Two-wheeler', verification_status: 'pending' }
];

const defaultOrphanages = [
  { id: 'orph1', user_id: 'usr_orphanage1', name: 'Little Stars Children Home', description: 'Providing shelter and care to 65 young children in Trichy east.', location: { lat: 10.7990, lng: 78.7250 }, children_count: 65, verification_status: 'verified' },
  { id: 'orph2', user_id: 'usr_orphanage2', name: 'Hope Children Home', description: 'Home to 45 children with a focus on education and technical skills.', location: { lat: 10.7680, lng: 78.6810 }, children_count: 45, verification_status: 'verified' },
  { id: 'orph3', user_id: 'usr_orphanage3', name: 'Bright Future Home', description: 'Caring for 30 school going children. Need support with daily meals and clothes.', location: { lat: 10.8200, lng: 78.7000 }, children_count: 30, verification_status: 'verified' },
  { id: 'orph4', user_id: 'usr_orphanage4', name: 'New Life Children Centre', description: 'Shelter supporting 55 orphans with lodging, food, and basic education.', location: { lat: 10.7500, lng: 78.7300 }, children_count: 55, verification_status: 'pending' }
];

const defaultRequests = [
  { id: 'req1', orphanage_id: 'orph2', category: 'Food', item_name: 'Meal Packets', required_quantity: 80, remaining_quantity: 80, priority: 'Urgent', required_date: '2026-08-25', status: 'Pending', description: 'Needs lunch for 45 children plus volunteers.', created_at: new Date().toISOString() },
  { id: 'req2', orphanage_id: 'orph1', category: 'Books', item_name: 'Notebooks', required_quantity: 100, remaining_quantity: 40, priority: 'High', required_date: '2026-09-01', status: 'Partially Matched', description: 'Scribbling and writing books for primary school students.', created_at: new Date().toISOString() },
  { id: 'req3', orphanage_id: 'orph3', category: 'Stationery', item_name: 'School Bags', required_quantity: 30, remaining_quantity: 30, priority: 'Medium', required_date: '2026-09-05', status: 'Pending', description: 'Bags for children joining the school term.', created_at: new Date().toISOString() },
  { id: 'req4', orphanage_id: 'orph4', category: 'Grocery', item_name: 'Rice Bags (25kg)', required_quantity: 5, remaining_quantity: 5, priority: 'High', required_date: '2026-08-30', status: 'Pending', description: 'Monthly grain supply.', created_at: new Date().toISOString() }
];

const defaultDonations = [
  { id: 'don1', donor_id: 'usr_donor1', category: 'Food', item_name: 'Meal Packets', quantity: 100, available_quantity: 100, location: { lat: 10.8120, lng: 78.7150 }, priority: 'Urgent', expiry_time: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(), status: 'Available', description: 'Surplus food from marriage reception. Packaged fresh vegetarian lunch.', created_at: new Date().toISOString(), contact_info: '9876543210 (Manager, Palace)' },
  { id: 'don2', donor_id: 'usr_donor2', category: 'Books', item_name: 'Notebooks', quantity: 150, available_quantity: 90, location: { lat: 10.7800, lng: 78.7050 }, priority: 'Normal', expiry_time: null, status: 'Available', description: 'Surplus printed notebooks from store storage room.', created_at: new Date().toISOString(), contact_info: 'Apex Stationery Shop Front Desk' },
  { id: 'don3', donor_id: 'usr_donor3', category: 'Clothes', item_name: 'Children T-Shirts', quantity: 40, available_quantity: 40, location: { lat: 10.7920, lng: 78.6980 }, priority: 'Normal', expiry_time: null, status: 'Available', description: 'Gently used clean cotton clothes for children aged 6-12.', created_at: new Date().toISOString(), contact_info: 'Ananya K., Main Road Apartment' }
];

const defaultMatches = [
  // Initial match to pre-allocate notebooks
  { id: 'match_seed1', donation_id: 'don2', NGO_id: 'ngo1', orphanage_id: 'orph1', match_score: 88, quantity: 60, status: 'Delivered', created_at: new Date().toISOString() }
];

const defaultDeliveries = [
  { id: 'del_seed1', match_id: 'match_seed1', NGO_id: 'ngo1', pickup_location: { lat: 10.7800, lng: 78.7050 }, delivery_location: { lat: 10.7990, lng: 78.7250 }, status: 'Confirmed', proof_image: 'delivered_books_proof.jpg', completed_at: new Date().toISOString() }
];

const defaultNotifications = [
  { id: 'notif_1', user_id: 'usr_donor2', role: 'donor', title: 'Donation Accepted', message: 'Your donation of 60 notebooks has been accepted by CareConnect Foundation.', status: 'read', type: 'info', created_at: new Date().toISOString() },
  { id: 'notif_2', user_id: 'usr_ngo1', role: 'ngo', title: 'New Nearby Urgent Food', message: '🔴 Urgent food donation available 1.4 km from your main center.', status: 'unread', type: 'urgent', created_at: new Date().toISOString() },
  { id: 'notif_3', user_id: 'usr_orphanage1', role: 'orphanage', title: 'Delivery In Transit', message: 'CareConnect Foundation is delivering your requested 60 notebooks.', status: 'read', type: 'info', created_at: new Date().toISOString() }
];

const defaultImpactStats = {
  totalDonations: 290,
  verifiedNgos: 3,
  orphanages: 4,
  activeDonations: 2,
  activeDeliveries: 0,
  completedDonations: 1,
  foodSavedKg: 80,
  itemsDistributed: 60
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

// Smart Matching Algorithm
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

      let score = 0;

      // A. Distance Score (max 40)
      if (totalDistance <= 4) score += 40;
      else if (totalDistance <= 8) score += 30;
      else if (totalDistance <= 15) score += 20;
      else score += 10;

      // B. Resource Category Match (20 pts - guaranteed since we filtered)
      score += 20;

      // C. Quantity Fit Score (max 15)
      const quantityToMatch = Math.min(donation.available_quantity, req.remaining_quantity);
      if (quantityToMatch === req.remaining_quantity) {
        score += 15; // Fully supplies request
      } else {
        const ratio = quantityToMatch / req.required_quantity;
        score += Math.round(ratio * 15); // Partial supply
      }

      // D. Urgency Score (max 15)
      if (req.priority.toLowerCase() === 'urgent' || donation.priority.toLowerCase() === 'urgent') {
        score += 15;
      } else if (req.priority.toLowerCase() === 'high') {
        score += 12;
      } else if (req.priority.toLowerCase() === 'medium') {
        score += 8;
      } else {
        score += 4;
      }

      // E. Expiry and Urgency for Food (max 10)
      if (donation.category.toLowerCase() === 'food' && donation.expiry_time) {
        const hoursLeft = (new Date(donation.expiry_time) - new Date()) / (1000 * 60 * 60);
        if (hoursLeft > 0) {
          if (hoursLeft < 3) {
            score += 10; // Extremely urgent food match
          } else if (hoursLeft < 6) {
            score += 6;
          } else {
            score += 3;
          }
        }
      }

      // F. NGO Transport Compatibility (max 10)
      // Large cargo needs Car/Van. Two-wheeler can only handle small boxes/bags.
      const cargoSize = donation.quantity;
      const transport = ngo.transport_type.toLowerCase();
      
      if (transport.includes('multiple') || transport.includes('van')) {
        score += 10;
      } else if (transport.includes('car') && cargoSize <= 100) {
        score += 10;
      } else if (transport.includes('two-wheeler') && cargoSize <= 20) {
        score += 10;
      } else if (transport.includes('two-wheeler') && cargoSize > 20) {
        score += 2; // Incompatible or poor transport fit, but possible with multiple trips
      } else {
        score += 5;
      }

      matches.push({
        donation_id: donation.id,
        NGO_id: ngo.id,
        orphanage_id: orphanageObj.id,
        request_id: req.id,
        match_score: Math.min(score, 100), // Cap at 100%
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

// Transactional functions to process simulation steps
export function createDonation(donorId, data) {
  const donations = getData('thunai_donations');
  const newDonation = {
    id: 'don_' + Date.now(),
    donor_id: donorId,
    category: data.category,
    item_name: data.item_name,
    quantity: parseInt(data.quantity),
    available_quantity: parseInt(data.quantity),
    location: data.location,
    priority: data.priority || 'Normal',
    expiry_time: data.expiry_time || null,
    status: 'Available',
    description: data.description,
    created_at: new Date().toISOString(),
    contact_info: data.contact_info
  };

  donations.unshift(newDonation);
  saveData('thunai_donations', donations);

  // Trigger matches automatically and add notification for NGOs in radius
  const matchOptions = findMatchesForDonation(newDonation.id);
  const ngos = getData('thunai_ngos');
  const notifications = getData('thunai_notifications');

  // Notify NGOs with high match score (>70)
  matchOptions.forEach(m => {
    if (m.match_score >= 70) {
      const ngoObj = ngos.find(n => n.id === m.NGO_id);
      if (ngoObj) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: ngoObj.user_id,
          role: 'ngo',
          title: newDonation.priority === 'Urgent' ? '🔴 URGENT Donation Match' : 'New Match Available',
          message: `${newDonation.priority === 'Urgent' ? 'Urgent ' : ''}Donation of ${newDonation.quantity} ${newDonation.item_name} matches a request near you. Score: ${m.match_score}%.`,
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

  return newDonation;
}

export function createRequest(orphanageId, data) {
  const requests = getData('thunai_requests');
  const newRequest = {
    id: 'req_' + Date.now(),
    orphanage_id: orphanageId,
    category: data.category,
    item_name: data.item_name,
    required_quantity: parseInt(data.quantity),
    remaining_quantity: parseInt(data.quantity),
    priority: data.priority || 'Normal',
    required_date: data.required_date,
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
  
  ngos.forEach(ngo => {
    if (ngo.verification_status === 'verified') {
      const dist = getDistance(ngo.location.lat, ngo.location.lng, orphanageObj.location.lat, orphanageObj.location.lng);
      if (dist <= ngo.service_radius) {
        notifications.unshift({
          id: 'notif_' + Date.now() + Math.random(),
          user_id: ngo.user_id,
          role: 'ngo',
          title: 'Nearby Orphanage Need',
          message: `${orphanageObj.name} needs ${newRequest.required_quantity} ${newRequest.item_name} by ${newRequest.required_date}.`,
          status: 'unread',
          type: 'info',
          created_at: new Date().toISOString()
        });
      }
    }
  });

  saveData('thunai_notifications', notifications);
  return newRequest;
}

// Transaction: NGO accepts a match suggestion
export function acceptMatch(matchData) {
  const donations = getData('thunai_donations');
  const requests = getData('thunai_requests');
  const matches = getData('thunai_matches');
  const deliveries = getData('thunai_deliveries');
  const notifications = getData('thunai_notifications');

  const donation = donations.find(d => d.id === matchData.donation_id);
  const request = requests.find(r => r.id === matchData.request_id);

  if (!donation || !request || donation.available_quantity < matchData.quantity || request.remaining_quantity < matchData.quantity) {
    throw new Error("Unable to accept match: Quantity no longer available or request fulfilled.");
  }

  // Calculate allocation
  const allocQty = matchData.quantity;

  // Update Donation
  donation.available_quantity -= allocQty;
  if (donation.available_quantity === 0) {
    donation.status = 'Allocated';
  } else {
    donation.status = 'Partially Allocated';
  }

  // Update Request
  request.remaining_quantity -= allocQty;
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
    quantity: allocQty,
    status: 'NGO Accepted',
    created_at: new Date().toISOString()
  };
  matches.unshift(newMatch);
  saveData('thunai_matches', matches);

  // Create Delivery Record
  const newDelivery = {
    id: 'del_' + Date.now(),
    match_id: newMatch.id,
    NGO_id: matchData.NGO_id,
    pickup_location: donation.location,
    delivery_location: request.required_location || getData('thunai_orphanages').find(o => o.id === matchData.orphanage_id).location,
    status: 'NGO Accepted',
    proof_image: null,
    completed_at: null
  };
  deliveries.unshift(newDelivery);
  saveData('thunai_deliveries', deliveries);

  // Notify Donor
  notifications.unshift({
    id: 'notif_' + Date.now() + Math.random(),
    user_id: donation.donor_id,
    role: 'donor',
    title: 'Donation Accepted',
    message: `Your donation of ${allocQty} ${donation.item_name} has been accepted by CareConnect Foundation. Pickup scheduling in progress.`,
    status: 'unread',
    type: 'info',
    created_at: new Date().toISOString()
  });

  // Notify Orphanage
  const orphUser = getData('thunai_users').find(u => u.id === getData('thunai_orphanages').find(o => o.id === matchData.orphanage_id).user_id);
  if (orphUser) {
    notifications.unshift({
      id: 'notif_' + Date.now() + Math.random(),
      user_id: orphUser.id,
      role: 'orphanage',
      title: 'Resources Matched!',
      message: `Great news! CareConnect Foundation will deliver ${allocQty} ${donation.item_name} matching your request.`,
      status: 'unread',
      type: 'info',
      created_at: new Date().toISOString()
    });
  }

  saveData('thunai_notifications', notifications);
  incrementStats('activeDeliveries', 1);

  return newMatch;
}

// Update Delivery status (NGO updates transit workflow)
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
          title: 'Pickup Scheduled',
          message: `CareConnect NGO has scheduled pickup. Estimated time: ${extraData.pickup_time || 'within 2 hours'}.`,
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
          title: 'Donation Picked Up',
          message: `Your donation of ${match.quantity} ${item_name} was picked up by NGO and is in transit.`,
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
          title: 'Delivery in Transit',
          message: `The NGO has picked up the resources and is heading to your location.`,
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
          title: '🚐 Out for Delivery',
          message: `CareConnect NGO is arriving soon to deliver ${match.quantity} ${item_name}.`,
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
          title: '🎉 Delivery Arrived!',
          message: `${match.quantity} ${item_name} has arrived. Please confirm receipt to complete.`,
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
          title: '❤️ Donation Delivered Successfully!',
          message: `Your donation of ${match.quantity} ${item_name} was successfully delivered to ${orphanageObj.name}!`,
          status: 'unread',
          type: 'info',
          created_at: new Date().toISOString()
        });
      }
      // Update statistics
      incrementStats('activeDeliveries', -1);
      incrementStats('completedDonations', 1);
      if (donation && donation.category.toLowerCase() === 'food') {
        incrementStats('foodSavedKg', Math.round(match.quantity * 0.4)); // Appx 400g per meal
      }
      incrementStats('itemsDistributed', match.quantity);
    }
  }

  saveData('thunai_notifications', notifications);
  return delivery;
}

// Admin / verification panel modifications
export function verifyOrganization(type, orgId, newStatus) {
  if (type === 'ngo') {
    const ngos = getData('thunai_ngos');
    const ngo = ngos.find(n => n.id === orgId);
    if (ngo) {
      ngo.verification_status = newStatus;
      saveData('thunai_ngos', ngos);
      
      // Notify the NGO
      const notifications = getData('thunai_notifications');
      notifications.unshift({
        id: 'notif_' + Date.now(),
        user_id: ngo.user_id,
        role: 'ngo',
        title: newStatus === 'verified' ? '✅ Profile Verified' : 'Profile Status Updated',
        message: newStatus === 'verified' 
          ? 'Your NGO status is now fully verified. You can now accept donation pickups.' 
          : `Your verification status has been updated to: ${newStatus}`,
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
      
      // Notify the orphanage
      const notifications = getData('thunai_notifications');
      notifications.unshift({
        id: 'notif_' + Date.now(),
        user_id: orphanage.user_id,
        role: 'orphanage',
        title: newStatus === 'verified' ? '✅ Profile Verified' : 'Profile Status Updated',
        message: newStatus === 'verified' 
          ? 'Your orphanage profile is now verified. You can now request resources.' 
          : `Your verification status has been updated to: ${newStatus}`,
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
  stats[field] = (stats[field] || 0) + val;
  localStorage.setItem('thunai_stats', JSON.stringify(stats));
}

// Reset Database to Seed Data (Useful for resetting walkthroughs)
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
