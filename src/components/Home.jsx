import React, { useState } from 'react';
import { 
  Gift, HandHelping, BookOpen, Heart, Globe, Play, CheckCircle2, ChevronRight, 
  AlertCircle, ArrowRight, ShieldCheck, Award, Sparkles, Truck, Clock, MapPin, 
  TrendingUp, Users, Shield, RefreshCw, HelpCircle, ChevronDown, ChevronUp, Leaf, 
  Compass, Share2, Check, AlertTriangle, FileText, LogIn
} from 'lucide-react';
import { getData, resetDB, acceptMatch, updateDeliveryStatus, findMatchesForDonation, playNotificationSound } from '../services/db';

export default function Home({ setRole, setPage, stats, setStats, notifications, setNotifications, setAuthModalOpen }) {
  // Simulator State
  const [simStep, setSimStep] = useState(0);
  const [simMessage, setSimMessage] = useState('Welcome! Click "Step 01" to start the interactive simulation.');
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [activeDonation, setActiveDonation] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);

  // Impact Calculator State
  const [calcMeals, setCalcMeals] = useState(120);
  const [calcGrains, setCalcGrains] = useState(30);
  const [calcBooks, setCalcBooks] = useState(60);
  const [calcClothes, setCalcClothes] = useState(25);

  // FAQ Open State
  const [openFaq, setOpenFaq] = useState(0);

  // Real-time Impact Calculations
  const totalChildrenFed = Math.round(calcMeals * 1.0 + calcGrains * 2.5);
  const totalFoodSavedKg = Math.round(calcMeals * 0.45 + calcGrains);
  const totalCo2SavedKg = Math.round(totalFoodSavedKg * 2.5 + calcClothes * 3.6 + calcBooks * 0.8);
  const totalValueSavedInr = Math.round(calcMeals * 85 + calcGrains * 50 + calcBooks * 45 + calcClothes * 250);

  // Simulation Handlers
  const handleResetSim = () => {
    resetDB();
    setSimStep(0);
    setSimMessage('Database reset. Click "Step 01" to start the walkthrough.');
    setActiveMatch(null);
    setActiveDelivery(null);
    setActiveDonation(null);
    setActiveRequest(null);
    setStats(getData('thunai_stats'));
    setNotifications(getData('thunai_notifications'));
    playNotificationSound('info');
  };

  const runSimStep1 = () => {
    const requests = getData('thunai_requests');
    const req = requests.find(r => r.id === 'req1') || requests[0];
    setActiveRequest(req);
    setRole('orphanage');
    setPage('profile');
    setSimStep(1);
    setSimMessage('Step 1: Hope Children\'s Home has posted an urgent requirement for 80 meal packets.');
    playNotificationSound('urgent');
  };

  const runSimStep2 = () => {
    const donations = getData('thunai_donations');
    const don = donations.find(d => d.id === 'don1') || donations[0];
    setActiveDonation(don);
    setRole('donor');
    setPage('profile');
    setSimStep(2);
    setSimMessage('Step 2: Grand Palace Banquet Hall posted 100 surplus vegetarian meal packets with a 3-hour expiry.');
    playNotificationSound('info');
  };

  const runSimStep3 = () => {
    const don = activeDonation || getData('thunai_donations')[0];
    const matches = findMatchesForDonation(don.id);
    if (matches.length > 0) {
      setActiveMatch(matches[0]);
      setRole('ngo');
      setPage('profile');
      setSimStep(3);
      setSimMessage(`Step 3: THUNAI AI evaluated distance, fleet capacity, and urgency to find a ${matches[0].match_score}% Smart Match!`);
      playNotificationSound('info');
    }
  };

  const runSimStep4 = () => {
    if (!activeMatch) {
      const don = getData('thunai_donations')[0];
      const matches = findMatchesForDonation(don.id);
      if (matches.length > 0) setActiveMatch(matches[0]);
    }
    const matchToAccept = activeMatch || findMatchesForDonation(getData('thunai_donations')[0].id)[0];
    try {
      const acceptedMatch = acceptMatch(matchToAccept);
      const deliveries = getData('thunai_deliveries');
      const del = deliveries.find(d => d.match_id === acceptedMatch.id);
      setActiveDelivery(del);
      setRole('ngo');
      setPage('profile');
      setSimStep(4);
      setSimMessage('Step 4: CareConnect Foundation accepted the pickup. Resource custody is officially assigned.');
      setNotifications(getData('thunai_notifications'));
      setStats(getData('thunai_stats'));
      playNotificationSound('success');
    } catch (e) {
      setSimMessage(`Notice: ${e.message}`);
    }
  };

  const runSimStep5 = () => {
    const deliveries = getData('thunai_deliveries');
    const del = activeDelivery || deliveries[0];
    if (del) {
      updateDeliveryStatus(del.id, 'Pickup Scheduled', { pickup_time: '25 mins' });
      const updatedDel = updateDeliveryStatus(del.id, 'Picked Up');
      setActiveDelivery(updatedDel);
      setRole('ngo');
      setPage('profile');
      setSimStep(5);
      setSimMessage('Step 5: NGO van arrived at Grand Palace Hall. 80 meals secured in vehicle transit.');
      setNotifications(getData('thunai_notifications'));
      setStats(getData('thunai_stats'));
      playNotificationSound('info');
    }
  };

  const runSimStep6 = () => {
    const deliveries = getData('thunai_deliveries');
    const del = activeDelivery || deliveries[0];
    if (del) {
      updateDeliveryStatus(del.id, 'Out for Delivery');
      const updatedDel = updateDeliveryStatus(del.id, 'Delivered', { proof_image: 'handover_photo.png' });
      setActiveDelivery(updatedDel);
      setRole('orphanage');
      setPage('profile');
      setSimStep(6);
      setSimMessage('Step 6: NGO driver arrived at Hope Children Home and uploaded delivery proof. Awaiting signature.');
      setNotifications(getData('thunai_notifications'));
      setStats(getData('thunai_stats'));
      playNotificationSound('urgent');
    }
  };

  const runSimStep7 = () => {
    const deliveries = getData('thunai_deliveries');
    const del = activeDelivery || deliveries[0];
    if (del) {
      const updatedDel = updateDeliveryStatus(del.id, 'Confirmed');
      setActiveDelivery(updatedDel);
      setRole('donor');
      setPage('profile');
      setSimStep(7);
      setSimMessage('Step 7: Orphanage superintendent signed the digital pad! Custody closed & Certificate generated.');
      setNotifications(getData('thunai_notifications'));
      setStats(getData('thunai_stats'));
      playNotificationSound('success');
    }
  };

  const faqs = [
    {
      q: "How does THUNAI solve the transport problem when orphanages can't collect donations?",
      a: "Unlike traditional bulletin boards that expect orphanages to arrange their own transport, THUNAI treats verified NGOs as the physical logistics bridge. Our algorithm pairs donations with nearby NGOs that have verified transport fleets (Vans, Cars, Two-Wheelers) and assigns them delivery custody."
    },
    {
      q: "How does the < 4 Hour Urgent Food Rescue window work?",
      a: "Perishable cooked meals from wedding banquets, restaurants, and hotels spoil rapidly. When a donor posts food expiring in under 4 hours, THUNAI automatically elevates the priority to 🔴 URGENT, calculates the closest NGO van within radius, and sends high-priority acoustic notifications for instant dispatch."
    },
    {
      q: "What happens if a donor has 100 items but an orphanage only needs 60?",
      a: "THUNAI features an intelligent Partial Quantity Allocation engine. It allocates precisely the 60 units needed to the orphanage, marks the remaining 40 units as 'Partially Allocated', and immediately matches the leftover balance with the next nearest orphanage without over-allocation."
    },
    {
      q: "How is trust and safety guaranteed during handovers?",
      a: "Every NGO and Orphanage must be verified by platform administrators before accepting jobs. Furthermore, every handover requires a tamper-proof Digital Signature on an HTML5 canvas pad or photo proof, creating an unbroken chain of custody."
    },
    {
      q: "Can individual citizens or local stores donate books, clothes, and school bags?",
      a: "Absolutely! Donors can choose 'Item Donation' to contribute ruled notebooks, school uniforms, geometry boxes, winter blankets, or dry groceries. NGOs collect these during scheduled routes."
    },
    {
      q: "Is THUNAI aligned with official social impact and UN SDG metrics?",
      a: "Yes. THUNAI quantifies real-time contributions towards SDG 2 (Zero Hunger), SDG 4 (Quality Education), SDG 10 (Reduced Inequalities), SDG 12 (Responsible Consumption & Production), and SDG 17 (Partnerships for the Goals), generating verifiable certificates for CSR and community audits."
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ 
        position: 'relative',
        background: 'radial-gradient(circle at 50% 20%, rgba(13, 148, 136, 0.12) 0%, rgba(249, 115, 22, 0.04) 50%, rgba(255, 255, 255, 0) 100%)',
        padding: '4.5rem 0 3.5rem 0',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          
          {/* Live Activity Ribbon */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1.1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid var(--primary-border)', boxShadow: '0 4px 12px var(--primary-glow)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent)' }} className="animate-pulse-slow" />
            <span>Live in Trichy: <strong>14 Active Resource Transits Across 6 Zones</strong></span>
          </div>

          <h1 style={{ fontSize: '3.85rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            THUNAI <span className="text-gradient-primary">துணை</span>
          </h1>

          <div style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-gradient-secondary">Connect. </span>
            <span className="text-gradient-primary">Collect. </span>
            <span className="text-gradient-accent">Deliver. </span>
            <span style={{ color: 'var(--text-primary)' }}>Hope.</span>
          </div>

          <p style={{ fontSize: '1.18rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto 2.5rem auto', lineHeight: '1.7' }}>
            The AI-powered, location-based social logistics bridge connecting <strong>surplus donors, verified transport NGOs, and orphanages</strong> across Tiruchirappalli in real time.
          </p>

          {/* 4 Hero Action Cards */}
          <div className="grid-4" style={{ gap: '1.25rem', marginBottom: '2.5rem' }}>
            
            <div className="hero-action-card" onClick={() => { setRole('donor'); setPage('profile'); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Gift size={24} />
                </div>
                <ArrowRight size={18} className="text-primary" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Give Food & Goods</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Post surplus meals, books, clothes & grains for door pickup.</p>
              </div>
            </div>

            <div className="hero-action-card" onClick={() => { setRole('orphanage'); setPage('profile'); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                  <HandHelping size={24} />
                </div>
                <ArrowRight size={18} className="text-secondary" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Request for Home</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Publish child shelter needs or trigger 1-Click SOS emergency.</p>
              </div>
            </div>

            <div className="hero-action-card" onClick={() => { setRole('ngo'); setPage('profile'); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <Truck size={24} />
                </div>
                <ArrowRight size={18} className="text-accent" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Join as NGO Fleet</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Claim nearby matching routes and bridge the physical transit gap.</p>
              </div>
            </div>

            <div className="hero-action-card" onClick={() => setPage('map')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Compass size={24} />
                </div>
                <ArrowRight size={18} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Live Trichy Map</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Inspect active donors, NGO vans, and orphanages in real-time.</p>
              </div>
            </div>

          </div>

          {/* Role Login & Onboarding Guide Banner */}
          <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', marginBottom: '2.5rem', border: '2px solid var(--primary-border)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-info" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  🔑 How Authentication & Access Works
                </span>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>
                  How to Sign In or Register as a New User
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  THUNAI is tailored with dedicated portals for each user type. Choose your role below to log in or register a new organization:
                </p>
              </div>

              {setAuthModalOpen && (
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                  onClick={() => setAuthModalOpen(true)}
                >
                  <LogIn size={16} /> Open Sign In / Sign Up Modal
                </button>
              )}
            </div>

            <div className="grid-3" style={{ gap: '1.25rem' }}>
              
              {/* Orphanage Login Box */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🏠</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--secondary)' }}>1. For Orphanages</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                  Log in to post supply requests (meals, books, stationery), broadcast <strong>1-Click SOS emergency needs</strong>, and sign the digital receipt pad upon arrival.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1, fontSize: '0.75rem', fontWeight: 700 }}
                    onClick={() => { setRole('orphanage'); setPage('profile'); }}
                  >
                    🏠 Log In as Orphanage
                  </button>
                  {setAuthModalOpen && (
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setAuthModalOpen(true)}
                    >
                      Register Home
                    </button>
                  )}
                </div>
              </div>

              {/* Donor Login Box */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🍱</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>2. For Donors & Venues</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                  Log in as a wedding hall, restaurant, or individual to list surplus food (&lt; 4 hr expiry) or goods, track live transport, and print <strong>Impact Certificates</strong>.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ flex: 1, fontSize: '0.75rem', fontWeight: 700 }}
                    onClick={() => { setRole('donor'); setPage('profile'); }}
                  >
                    🍱 Log In as Donor
                  </button>
                  {setAuthModalOpen && (
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setAuthModalOpen(true)}
                    >
                      Register Donor
                    </button>
                  )}
                </div>
              </div>

              {/* NGO Fleet Login Box */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🚐</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--accent)' }}>3. For NGO Fleets</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                  Log in as an NGO logistics partner to inspect AI Smart Matches within your radius slider, claim dispatches, and upload delivery handover proof.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-sm" 
                    style={{ flex: 1, backgroundColor: 'var(--accent)', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}
                    onClick={() => { setRole('ngo'); setPage('profile'); }}
                  >
                    🚐 Log In as NGO
                  </button>
                  {setAuthModalOpen && (
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setAuthModalOpen(true)}
                    >
                      Register Fleet
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Trust Pillars Strip */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="trust-badge-pill">
              <ShieldCheck size={16} className="text-primary" /> 100% Verified NGOs & Homes
            </div>
            <div className="trust-badge-pill">
              <Clock size={16} className="text-danger" /> &lt; 4-Hour Food Rescue Window
            </div>
            <div className="trust-badge-pill">
              <FileText size={16} className="text-accent" /> Digital Signature Chain of Custody
            </div>
            <div className="trust-badge-pill">
              <Leaf size={16} style={{ color: '#16a34a' }} /> Zero Landfill Waste Mission
            </div>
          </div>

        </div>
      </section>

      {/* 2. REAL-TIME IMPACT COUNTERS */}
      <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-4" style={{ gap: '1.5rem' }}>
            
            <div className="card metric-card" style={{ padding: '1.5rem' }}>
              <div className="metric-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Gift size={26} />
              </div>
              <div className="metric-info">
                <h4>{stats.totalDonations * 10 + 450}+</h4>
                <p>Meals & Goods Rescued</p>
              </div>
            </div>

            <div className="card metric-card" style={{ padding: '1.5rem' }}>
              <div className="metric-icon" style={{ backgroundColor: '#ecfdf5', color: 'var(--accent)' }}>
                <Users size={26} />
              </div>
              <div className="metric-info">
                <h4>{stats.childrenSupported || 5200}+</h4>
                <p>Children Nourished & Clothed</p>
              </div>
            </div>

            <div className="card metric-card" style={{ padding: '1.5rem' }}>
              <div className="metric-icon" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                <Truck size={26} />
              </div>
              <div className="metric-info">
                <h4>{stats.verifiedNgos * 4 + 16} Partners</h4>
                <p>Active NGO Transport Fleets</p>
              </div>
            </div>

            <div className="card metric-card" style={{ padding: '1.5rem' }}>
              <div className="metric-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                <Globe size={26} />
              </div>
              <div className="metric-info">
                <h4>{stats.foodSavedKg * 2 + 1800} kg</h4>
                <p>CO₂ Landfill Emissions Saved</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. 4-STEP CORE WORKFLOW ARCHITECTURE */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Architectural Engine
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>
              How THUNAI Solves the Distribution Gap
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0 auto', fontSize: '1.05rem' }}>
              A deterministic 4-stage logistics protocol ensuring zero food spoilage and complete custody accountability.
            </p>
          </div>

          <div className="grid-4" style={{ gap: '1.5rem' }}>
            
            <div className="step-architecture-card">
              <div className="step-badge-num">01</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>POST</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1 }}>
                Orphanages publish exact deficits (meals, notebooks, bags). Donors post surplus resources with expiry timestamps and packaging notes.
              </p>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                📍 Geotagged Trichy Zones
              </div>
            </div>

            <div className="step-architecture-card">
              <div className="step-badge-num" style={{ background: 'var(--secondary)' }}>02</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>MATCH</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1 }}>
                Our 6-factor algorithm evaluates route distance ($\le$ NGO radius), category taxonomy, partial quantity fit, and urgency to assign a 0–100% Match Score.
              </p>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 700 }}>
                🎯 Partial Quantity Aware
              </div>
            </div>

            <div className="step-architecture-card">
              <div className="step-badge-num" style={{ background: 'var(--accent)' }}>03</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>COLLECT</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1 }}>
                Verified NGO accepts the dispatch. The driver navigates to the donor's address, verifies hygiene packaging, and secures custody in the vehicle.
              </p>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
                🚐 Verified Vehicle Fleets
              </div>
            </div>

            <div className="step-architecture-card">
              <div className="step-badge-num" style={{ background: '#3b82f6' }}>04</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>DELIVER</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1 }}>
                NGO delivers to the orphanage. The superintendent signs the HTML5 Digital Signature Pad, closing custody and issuing an Impact Certificate.
              </p>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>
                ✍️ Verified Digital Receipt
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE 7-STEP WORKFLOW SIMULATOR STUDIO */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          
          <div className="walkthrough-guide">
            
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  Interactive Simulator
                </span>
                <h3 style={{ color: 'white', fontSize: '1.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'Outfit, sans-serif' }}>
                  <Play size={22} className="animate-pulse-slow text-secondary" /> Step-By-Step Redistribution Lifecycle
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '680px' }}>
                  Experience the end-to-end flow from an orphanage's dinner deficit to NGO transport and digital confirmation.
                </p>
              </div>

              <button 
                className="btn btn-ghost btn-sm" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                onClick={handleResetSim}
              >
                <RefreshCw size={14} /> Reset Simulation
              </button>
            </div>

            {/* Live Message Bar */}
            <div style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.25)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem', 
              margin: '1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              borderLeft: '5px solid var(--secondary)'
            }}>
              <AlertCircle size={22} className="text-secondary animate-pulse-slow" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', lineHeight: '1.5' }}>
                {simMessage}
              </div>
            </div>

            {/* 7 Stepper Buttons */}
            <div className="walkthrough-steps" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
              
              <button className={`walkthrough-btn ${simStep === 1 ? 'active' : ''}`} onClick={runSimStep1}>
                <div className="walkthrough-btn-number">Step 01</div>
                <strong>Post Need</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.85 }}>80 Meals Needed</div>
              </button>
              
              <button className={`walkthrough-btn ${simStep === 2 ? 'active' : ''}`} onClick={runSimStep2}>
                <div className="walkthrough-btn-number">Step 02</div>
                <strong>Post Donation</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.85 }}>100 Surplus Meals</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 3 ? 'active' : ''}`} onClick={runSimStep3}>
                <div className="walkthrough-btn-number">Step 03</div>
                <strong>Match Engine</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.85 }}>Calculates 98% Fit</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 4 ? 'active' : ''}`} onClick={runSimStep4}>
                <div className="walkthrough-btn-number">Step 04</div>
                <strong>NGO Accepts</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.85 }}>CareConnect Claims</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 5 ? 'active' : ''}`} onClick={runSimStep5}>
                <div className="walkthrough-btn-number">Step 05</div>
                <strong>NGO Pickup</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.85 }}>En Route in Van</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 6 ? 'active' : ''}`} onClick={runSimStep6}>
                <div className="walkthrough-btn-number">Step 06</div>
                <strong>Delivered</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.85 }}>Arrived at Shelter</div>
              </button>

              <button className={`walkthrough-btn ${simStep === 7 ? 'active' : ''}`} onClick={runSimStep7}>
                <div className="walkthrough-btn-number">Step 07</div>
                <strong>Confirmed</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.85 }}>Digital Sign Pad</div>
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE SOCIAL IMPACT & CARBON OFFSET CALCULATOR */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Impact Modeling
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>
              Community Redistribution Impact Calculator
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0 auto', fontSize: '1.05rem' }}>
              Adjust the resource volume below to see the quantified nutritional, environmental, and financial impact.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '2.5rem', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Input Sliders */}
            <div className="card" style={{ padding: '2rem' }}>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>🍱 Surplus Cooked Meals:</label>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{calcMeals} Packets</strong>
                </div>
                <input type="range" min="0" max="500" step="10" value={calcMeals} onChange={(e) => setCalcMeals(parseInt(e.target.value))} className="form-input" style={{ padding: 0 }} />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>🍚 Dry Grains / Rice / Dal:</label>
                  <strong style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>{calcGrains} kg</strong>
                </div>
                <input type="range" min="0" max="200" step="5" value={calcGrains} onChange={(e) => setCalcGrains(parseInt(e.target.value))} className="form-input" style={{ padding: 0 }} />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>📚 Notebooks & School Stationery:</label>
                  <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>{calcBooks} Units</strong>
                </div>
                <input type="range" min="0" max="300" step="10" value={calcBooks} onChange={(e) => setCalcBooks(parseInt(e.target.value))} className="form-input" style={{ padding: 0 }} />
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>👕 Uniform & Clothes Sets:</label>
                  <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{calcClothes} Sets</strong>
                </div>
                <input type="range" min="0" max="100" step="5" value={calcClothes} onChange={(e) => setCalcClothes(parseInt(e.target.value))} className="form-input" style={{ padding: 0 }} />
              </div>

            </div>

            {/* Live Result Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 54, height: 54, borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  <Users size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
                    {totalChildrenFed} Children
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nourished with Complete Balanced Meals</div>
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 54, height: 54, borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                  <Globe size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'Outfit, sans-serif' }}>
                    {totalFoodSavedKg} kg Diverted
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fresh Food Kept Out of Landfill Waste</div>
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #16a34a', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 54, height: 54, borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                  <Leaf size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16a34a', fontFamily: 'Outfit, sans-serif' }}>
                    {totalCo2SavedKg} kg CO₂
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Greenhouse Gas Footprint Prevented</div>
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid var(--secondary)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 54, height: 54, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
                  <Award size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'Outfit, sans-serif' }}>
                    ₹{totalValueSavedInr.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Economic Value Channeled to Orphanages</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. URGENT FOOD RESCUE & PERISHABILITY ENGINE */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          
          <div className="card-glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', border: '2px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(254, 242, 242, 0.5)' }}>
            
            <div className="grid-2" style={{ gap: '3rem', alignItems: 'center' }}>
              
              <div>
                <span className="badge badge-danger animate-pulse-slow" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', marginBottom: '1rem' }}>
                  🚨 Critical Solution
                </span>
                <h2 style={{ fontSize: '2.4rem', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: '1.2' }}>
                  Why the &lt; 4-Hour Food Rescue Window Matters
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                  In India, over <strong>40% of catered wedding and banquet food is discarded</strong> simply because organizers have no vehicle to transport it before it cools and spoils.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fee2e2', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
                    <span>Automatic urgency escalation when best-before is &lt; 4 hours.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fee2e2', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
                    <span>Closest verified van dispatched within 20 minutes across Trichy.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fee2e2', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
                    <span>Hygienic foil & container packaging checklist mandatory.</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} /> Live Perishability Dispatch Demo
                </h4>
                
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                  <div className="flex-between">
                    <strong style={{ fontSize: '0.9rem' }}>Grand Palace Banquet Hall</strong>
                    <span className="badge badge-danger">Expiring in 2h 40m</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    100 Packets Vegetarian Briyani + Raita + Water Bottles
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                  <div style={{ height: '2px', background: 'var(--border-color)', flex: 1 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>TRANSIT ASSIGNED (2.3 KM)</span>
                  <div style={{ height: '2px', background: 'var(--border-color)', flex: 1 }} />
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
                  <div className="flex-between">
                    <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Hope Children Home</strong>
                    <span className="badge badge-success">Delivered in 35 mins</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    45 resident children nourished hot & fresh.
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. VALUE PROPOSITION MATRIX FOR ALL STAKEHOLDERS */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Stakeholder Empowerment
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>
              Built for Every Pillar of the Community
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0 auto', fontSize: '1.05rem' }}>
              How THUNAI creates win-win outcomes for donors, logistics NGOs, orphanages, and the city of Trichy.
            </p>
          </div>

          <div className="grid-4" style={{ gap: '1.5rem' }}>
            
            <div className="card" style={{ padding: '1.75rem', borderTop: '4px solid #0284c7' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#0284c7', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>
                🍱 For Donors
              </h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.2rem' }}>
                <li>Zero transport hassle — verified NGO arrives at your doorstep.</li>
                <li>Instant downloadable Certificates of Social Impact.</li>
                <li>100% transparency on exactly which children home received your food.</li>
                <li>Reduces business wastage and carbon tax footprint.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: '1.75rem', borderTop: '4px solid var(--accent)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--accent)', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>
                🚐 For NGOs
              </h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.2rem' }}>
                <li>Optimized route matching within your custom service radius.</li>
                <li>Score breakdowns showing distance, urgency, and fleet fit.</li>
                <li>Digital proof of delivery to build public trust and donor grants.</li>
                <li>Empowers volunteer drivers with real-time turn-by-turn tasks.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: '1.75rem', borderTop: '4px solid var(--secondary)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>
                🏠 For Orphanages
              </h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.2rem' }}>
                <li>Predictable, dignified supply of nutritious meals & school goods.</li>
                <li>1-Click SOS button for sudden ration or kitchen deficits.</li>
                <li>No coordination stress — deliveries arrive directly at the gate.</li>
                <li>Free digital signature confirmation on any mobile device.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: '1.75rem', borderTop: '4px solid #8b5cf6' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#8b5cf6', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>
                🌍 For Trichy City
              </h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.2rem' }}>
                <li>Diverts tons of organic waste from municipal dumping grounds.</li>
                <li>Fosters a resilient, collaborative smart city safety net.</li>
                <li>Transparent registry for city social welfare audits.</li>
                <li>Direct progress towards 5 United Nations Global Goals.</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 8. UN SUSTAINABLE DEVELOPMENT GOALS (SDG) */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Global Impact Alignment
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>
              THUNAI for the UN Sustainable Development Goals
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0 auto', fontSize: '1.05rem' }}>
              Every transaction directly advances the 2030 Agenda for Sustainable Development.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            
            <div className="card" style={{ borderTop: '5px solid #dda63a' }}>
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ color: '#dda63a', fontSize: '1.15rem' }}>SDG 2 — ZERO HUNGER</h4>
                <div style={{ fontWeight: 800, color: '#dda63a', fontSize: '1.6rem', fontFamily: 'Outfit, sans-serif' }}>2</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Eliminates childhood hunger by redirecting surplus nutritious hot meals, fruits, and dry grains to orphanages within hours of preparation.
              </p>
            </div>

            <div className="card" style={{ borderTop: '5px solid #c5192d' }}>
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ color: '#c5192d', fontSize: '1.15rem' }}>SDG 4 — QUALITY EDUCATION</h4>
                <div style={{ fontWeight: 800, color: '#c5192d', fontSize: '1.6rem', fontFamily: 'Outfit, sans-serif' }}>4</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Channels books, backpacks, geometry kits, and learning devices from donors and stationery shops directly into children's hands.
              </p>
            </div>

            <div className="card" style={{ borderTop: '5px solid #dd1367' }}>
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ color: '#dd1367', fontSize: '1.15rem' }}>SDG 10 — REDUCED INEQUALITIES</h4>
                <div style={{ fontWeight: 800, color: '#dd1367', fontSize: '1.6rem', fontFamily: 'Outfit, sans-serif' }}>10</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Levels the playing field for underfunded grassroots shelters by bringing verified logistics to marginalized communities.
              </p>
            </div>

            <div className="card" style={{ borderTop: '5px solid #00689d' }}>
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ color: '#00689d', fontSize: '1.15rem' }}>SDG 12 — RESPONSIBLE PRODUCTION</h4>
                <div style={{ fontWeight: 800, color: '#00689d', fontSize: '1.6rem', fontFamily: 'Outfit, sans-serif' }}>12</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Prevents landfill methane pollution by treating edible banquet excess and gently used items as valuable community assets.
              </p>
            </div>

            <div className="card" style={{ borderTop: '5px solid #19486a', gridColumn: 'span 2' }}>
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ color: '#19486a', fontSize: '1.15rem' }}>SDG 17 — PARTNERSHIPS FOR THE GOALS</h4>
                <div style={{ fontWeight: 800, color: '#19486a', fontSize: '1.6rem', fontFamily: 'Outfit, sans-serif' }}>17</div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Unites citizens, commercial wedding venues, logistics NGOs, child welfare institutions, and municipal authorities into one transparent trust network.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Got Questions?
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="faq-card" 
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <div className="flex-between">
                  <h4 style={{ fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif', color: openFaq === idx ? 'var(--primary)' : 'var(--text-primary)' }}>
                    {faq.q}
                  </h4>
                  {openFaq === idx ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-muted" />}
                </div>

                {openFaq === idx && (
                  <p className="animate-fade-in" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: '1.65' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. CALL TO ACTION (CTA) SECTION */}
      <section style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <h2 style={{ fontSize: '2.85rem', fontFamily: 'Outfit, sans-serif', marginBottom: '1rem' }}>
            Ready to Bridge the Gap in Your City?
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Whether you have surplus resources to share, need supplies for your children shelter, or operate a delivery fleet, THUNAI connects you instantly.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }} onClick={() => { setRole('donor'); setPage('profile'); }}>
              <Gift size={20} /> “Give What You Can.”
            </button>
            <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }} onClick={() => { setRole('orphanage'); setPage('profile'); }}>
              <HandHelping size={20} /> “Request What You Need.”
            </button>
            <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }} onClick={() => { setRole('ngo'); setPage('profile'); }}>
              <Truck size={20} /> “Help Deliver Hope.”
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
