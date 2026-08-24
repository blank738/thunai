import React, { useState, useEffect } from 'react';
import { Gift, HandHelping, BookOpen, Heart, Globe, Play, CheckCircle2, ChevronRight, AlertCircle, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { getData, resetDB, acceptMatch, updateDeliveryStatus, findMatchesForDonation } from '../services/db';

export default function Home({ setRole, setPage, stats, setStats, notifications, setNotifications }) {
  const [simStep, setSimStep] = useState(0);
  const [simMessage, setSimMessage] = useState('Welcome! Start the interactive simulation below to see THUNAI in action.');
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [activeDonation, setActiveDonation] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [sigPadInput, setSigPadInput] = useState('');

  // Handle resetting the simulation when component loads or database resets
  const handleResetSim = () => {
    resetDB();
    setSimStep(0);
    setSimMessage('Database reset. Click "Step 1" to start the walkthrough.');
    setActiveMatch(null);
    setActiveDelivery(null);
    setActiveDonation(null);
    setActiveRequest(null);
    setSigPadInput('');
    
    // Refresh parent states
    setStats(getData('thunai_stats'));
    setNotifications(getData('thunai_notifications'));
  };

  const runSimStep1 = () => {
    // Step 1: Orphanage Posts a Request (Hope Children's Home needs 80 meals)
    // We already seeded one request req1 (80 meals) but let's make sure it is reset and set active
    const requests = getData('thunai_requests');
    const req = requests.find(r => r.id === 'req1') || requests[0];
    
    // Highlight request
    setActiveRequest(req);
    setRole('orphanage');
    setPage('profile'); // Show orphanage dashboard
    setSimStep(1);
    setSimMessage('Step 1: Hope Children\'s Home has posted an urgent request for 80 meals. Switching you to the Orphanage Dashboard.');
  };

  const runSimStep2 = () => {
    // Step 2: Donor Posts a Donation (Wedding Hall has 100 surplus meals)
    const donations = getData('thunai_donations');
    const don = donations.find(d => d.id === 'don1') || donations[0];
    
    setActiveDonation(don);
    setRole('donor');
    setPage('profile'); // Show donor dashboard
    setSimStep(2);
    setSimMessage('Step 2: Trichy Grand Palace Hall posted a donation of 100 meals. Switching to the Donor Dashboard.');
  };

  const runSimStep3 = () => {
    // Step 3: THUNAI Matching Engine finds the match
    if (!activeDonation) {
      const donations = getData('thunai_donations');
      setActiveDonation(donations[0]);
    }
    
    const don = activeDonation || getData('thunai_donations')[0];
    const matches = findMatchesForDonation(don.id);
    
    if (matches.length > 0) {
      setActiveMatch(matches[0]); // The highest score match is NGO CareConnect (ngo1) with Orphanage Hope Children (orph2)
      setRole('ngo');
      setPage('profile'); // Switch to NGO view to see matching card
      setSimStep(3);
      setSimMessage(`Step 3: THUNAI matched the donation with Hope Children's Home (Needs 80) and CareConnect NGO (radius 12km) with a Match Score of ${matches[0].match_score}%.`);
    } else {
      setSimMessage('No compatible matches found. Reset database and try again.');
    }
  };

  const runSimStep4 = () => {
    // Step 4: NGO accepts the match
    if (!activeMatch) {
      setSimMessage('Please run Step 3 first to find the match.');
      return;
    }
    
    try {
      const acceptedMatch = acceptMatch(activeMatch);
      const deliveries = getData('thunai_deliveries');
      const del = deliveries.find(d => d.match_id === acceptedMatch.id);
      
      setActiveDelivery(del);
      setRole('ngo');
      setPage('profile'); // NGO dashboard shows active deliveries
      setSimStep(4);
      setSimMessage('Step 4: CareConnect NGO accepted the delivery request. The donation custody is now logged.');
      
      // Update notifications and stats
      setNotifications(getData('thunai_notifications'));
      setStats(getData('thunai_stats'));
    } catch (e) {
      setSimMessage(`Acceptance failed: ${e.message}`);
    }
  };

  const runSimStep5 = () => {
    // Step 5: NGO picks up the donation
    if (!activeDelivery) {
      const deliveries = getData('thunai_deliveries');
      if (deliveries.length > 0) setActiveDelivery(deliveries[0]);
      else {
        setSimMessage('Please run Step 4 first.');
        return;
      }
    }
    
    const del = activeDelivery || getData('thunai_deliveries')[0];
    
    // First transition to Pickup Scheduled
    updateDeliveryStatus(del.id, 'Pickup Scheduled', { pickup_time: '20 mins' });
    // Immediately transition to Picked Up for demo purposes
    const updatedDel = updateDeliveryStatus(del.id, 'Picked Up');
    
    setActiveDelivery(updatedDel);
    setRole('ngo');
    setPage('profile');
    setSimStep(5);
    setSimMessage('Step 5: NGO scheduled and completed pickup. Resource custody is now transferred to the NGO vehicle (🚐 Transit).');
    
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));
  };

  const runSimStep6 = () => {
    // Step 6: NGO delivers to Orphanage
    if (!activeDelivery) {
      setSimMessage('Please complete previous steps first.');
      return;
    }
    
    updateDeliveryStatus(activeDelivery.id, 'Out for Delivery');
    const updatedDel = updateDeliveryStatus(activeDelivery.id, 'Delivered', { proof_image: 'signature_sign.png' });
    
    setActiveDelivery(updatedDel);
    setRole('orphanage');
    setPage('profile'); // Switch to Orphanage to confirm receipt
    setSimStep(6);
    setSimMessage('Step 6: NGO arrived and delivered the 80 meals. Switching to the Orphanage Dashboard for confirmation.');
    
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));
  };

  const runSimStep7 = () => {
    // Step 7: Orphanage confirms receipt
    if (!activeDelivery) {
      setSimMessage('Please complete previous steps first.');
      return;
    }
    
    const updatedDel = updateDeliveryStatus(activeDelivery.id, 'Confirmed');
    
    setActiveDelivery(updatedDel);
    setRole('admin');
    setPage('profile'); // Show impact analytics
    setSimStep(7);
    setSimMessage('Step 7: Orphanage confirmed receipt! Impact counters updated. 80 meals saved, 1 orphanage supported.');
    
    setNotifications(getData('thunai_notifications'));
    setStats(getData('thunai_stats'));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ 
        background: 'radial-gradient(circle at 10% 20%, rgba(13, 148, 136, 0.08) 0%, rgba(255, 255, 255, 0) 90%)',
        padding: '5rem 0 3.5rem 0',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid var(--primary-border)' }}>
            <Award size={14} /> Hackathon Prototype Showcase
          </div>
          <h1 style={{ fontSize: '3.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            THUNAI
          </h1>
          <p className="text-secondary" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '1.5rem' }}>
            Connect. Collect. Deliver. Hope.
          </p>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxContent: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.7' }}>
            A location-based smart resource distribution network. We connect donors who have surplus resources directly with verified NGOs who pick up, transport, and deliver them to orphanages in need.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setRole('donor'); setPage('profile'); }}>
              <Gift size={18} /> Donate Now
            </button>
            <button className="btn btn-secondary" onClick={() => { setRole('orphanage'); setPage('profile'); }}>
              <HandHelping size={18} /> Request Resources
            </button>
            <button className="btn btn-outline" onClick={() => { setRole('ngo'); setPage('profile'); }}>
              Join as NGO
            </button>
            <button className="btn btn-ghost" style={{ border: '1px dashed var(--text-muted)' }} onClick={() => setPage('map')}>
              Explore Nearby Needs
            </button>
          </div>

          {/* SVG Hero Flow Graphic */}
          <div className="card-glass" style={{ marginTop: '4rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              The Custody Distribution Network
            </h4>
            <div className="flex-between" style={{ gap: '1rem', overflowX: 'auto', padding: '0.5rem 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--info)', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)', fontSize: '1.5rem', justifyContent: 'center' }}>👤</div>
                <strong style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Donor</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Posts Surplus</span>
              </div>
              <ArrowRight className="text-muted animate-pulse-slow" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 4px 10px var(--primary-glow)', fontSize: '1.5rem', justifyContent: 'center' }}>🎯</div>
                <strong style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>THUNAI Engine</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Location Matching</span>
              </div>
              <ArrowRight className="text-muted animate-pulse-slow" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)', fontSize: '1.5rem', justifyContent: 'center' }}>🚐</div>
                <strong style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>NGO Transport</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pickup & Custody</span>
              </div>
              <ArrowRight className="text-muted animate-pulse-slow" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 4px 10px var(--secondary-glow)', fontSize: '1.5rem', justifyContent: 'center' }}>🏠</div>
                <strong style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Orphanage</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Confirm Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIMULATION CONTROLLER (CRITICAL HACKATHON DEMO CONTROL) */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="walkthrough-guide">
            <div className="flex-between">
              <div>
                <h3 style={{ color: 'white', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Play size={20} className="animate-pulse-slow" /> Interactive Platform Walkthrough
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Step through our automated simulation to view how a meal request is created, matched, transported, and verified.
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white' }} onClick={handleResetSim}>
                Reset Demo
              </button>
            </div>

            <div style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.2)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem', 
              margin: '1.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              borderLeft: '4px solid var(--secondary)'
            }}>
              <AlertCircle size={20} className="text-secondary" />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{simMessage}</div>
            </div>

            <div className="walkthrough-steps">
              <button className={`walkthrough-btn ${simStep === 1 ? 'active' : ''}`} onClick={runSimStep1}>
                <div className="walkthrough-btn-number">Step 01</div>
                <strong>Post Request</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.8 }}>Orphanage needs 80 meals</div>
              </button>
              
              <button className={`walkthrough-btn ${simStep === 2 ? 'active' : ''}`} onClick={runSimStep2}>
                <div className="walkthrough-btn-number">Step 02</div>
                <strong>Post Donation</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.8 }}>Surplus of 100 meals</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 3 ? 'active' : ''}`} onClick={runSimStep3}>
                <div className="walkthrough-btn-number">Step 03</div>
                <strong>Match Engine</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.8 }}>Calculates best NGO & Route</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 4 ? 'active' : ''}`} onClick={runSimStep4}>
                <div className="walkthrough-btn-number">Step 04</div>
                <strong>NGO Accepts</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.8 }}>CareConnect claims job</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 5 ? 'active' : ''}`} onClick={runSimStep5}>
                <div className="walkthrough-btn-number">Step 05</div>
                <strong>NGO Pickup</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.8 }}>Meals in vehicle transit</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 6 ? 'active' : ''}`} onClick={runSimStep6}>
                <div className="walkthrough-btn-number">Step 06</div>
                <strong>NGO Delivery</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.8 }}>Meals arrive at home</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 7 ? 'active' : ''}`} onClick={runSimStep7}>
                <div className="walkthrough-btn-number">Step 07</div>
                <strong>Confirmation</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.8 }}>Receipt logged & closed</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMPACT COUNTERS */}
      <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="grid-4">
            <div className="card metric-card" style={{ padding: '1.25rem' }}>
              <div className="metric-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Gift size={24} />
              </div>
              <div className="metric-info">
                <h4>{stats.totalDonations}+</h4>
                <p>Total Donations</p>
              </div>
            </div>

            <div className="card metric-card" style={{ padding: '1.25rem' }}>
              <div className="metric-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="metric-info">
                <h4>{stats.verifiedNgos}</h4>
                <p>Verified NGOs</p>
              </div>
            </div>

            <div className="card metric-card" style={{ padding: '1.25rem' }}>
              <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: 'var(--secondary)' }}>
                <HandHelping size={24} />
              </div>
              <div className="metric-info">
                <h4>{stats.orphanages}</h4>
                <p>Orphanages Supported</p>
              </div>
            </div>

            <div className="card metric-card" style={{ padding: '1.25rem' }}>
              <div className="metric-icon" style={{ backgroundColor: '#eff6ff', color: 'var(--info)' }}>
                <Globe size={24} />
              </div>
              <div className="metric-info">
                <h4>{stats.foodSavedKg} kg</h4>
                <p>Surplus Food Saved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL WORLD DEMO WALKTHROUGH FEATURE CARD */}
      <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2.5rem' }}>
            Featured Live Connection Demo
          </h2>
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', borderLeft: '5px solid var(--primary)', padding: '2rem' }}>
            <div className="badge badge-success animate-pulse-slow" style={{ marginBottom: '1rem' }}>
              🍱 From Surplus Food to Smiles
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr 40px 1fr', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.9rem' }}>ABC Wedding Hall</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>100 meals available</div>
              </div>
              
              <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>➔</div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
                <strong style={{ fontSize: '0.9rem' }}>CareConnect NGO</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>📍 2.3 km away</div>
              </div>

              <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>➔</div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.9rem' }}>Hope Children Home</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Needs 80 meals</div>
              </div>
            </div>

            <div className="flex-between" style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
              <div>
                <strong className="text-primary" style={{ display: 'block', fontSize: '0.95rem' }}>✅ 80 Meals Successfully Delivered</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Surplus food waste prevented. Transited securely. Full custody confirmed.</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Impact Metrics</strong>
                <div>Children: 45 Supported</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SDG SECTION */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>THUNAI for the SDGs</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              How our location-based matching engine maps directly to the United Nations Sustainable Development Goals.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            <div className="card" style={{ borderTop: '4px solid #e5243b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#e5243b' }}>SDG 1 — NO POVERTY</h4>
                <div style={{ fontWeight: 800, color: '#e5243b', fontSize: '1.5rem' }}>1</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Improves access to essential life resources, educational supplies, and clothes for vulnerable children in orphanages.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #dda63a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#dda63a' }}>SDG 2 — ZERO HUNGER</h4>
                <div style={{ fontWeight: 800, color: '#dda63a', fontSize: '1.5rem' }}>2</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Redirects surplus catered food, grocery bags, and grains directly to children who need them, resolving immediate food deficits.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #c5192d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#c5192d' }}>SDG 4 — QUALITY EDUCATION</h4>
                <div style={{ fontWeight: 800, color: '#c5192d', fontSize: '1.5rem' }}>4</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Connects donor stores directly with orphanages to deliver books, stationery, pencil boxes, and other educational materials.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #dd1367' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#dd1367' }}>SDG 10 — REDUCED INEQUALITIES</h4>
                <div style={{ fontWeight: 800, color: '#dd1367', fontSize: '1.5rem' }}>10</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Leverages community-driven logistics to support under-resourced shelters, reducing geographic and economic inequalities.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #00689d', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#00689d' }}>SDG 12 — RESPONSIBLE CONSUMPTION AND PRODUCTION</h4>
                <div style={{ fontWeight: 800, color: '#00689d', fontSize: '1.5rem' }}>12</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Diverts massive volume of edible excess food and unused items from garbage fills, minimizing consumption waste and environmental cost.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
