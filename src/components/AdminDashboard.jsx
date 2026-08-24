import React, { useState } from 'react';
import { Shield, Users, CheckCircle, Clock, Ban, List, Truck, ShieldAlert, Award, FileText, RefreshCw, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { getData, verifyOrganization, resetDB } from '../services/db';

export default function AdminDashboard({ stats, setStats, setNotifications, setRequests, setDonations }) {
  const [activeTab, setActiveTab] = useState('verification'); // verification, registry, statistics
  const [searchQuery, setSearchQuery] = useState('');
  
  // Retrieve databases
  const users = getData('thunai_users');
  const ngos = getData('thunai_ngos');
  const orphanages = getData('thunai_orphanages');
  const donations = getData('thunai_donations');
  const requests = getData('thunai_requests');
  const deliveries = getData('thunai_deliveries');
  const matches = getData('thunai_matches');

  // Verification actions
  const handleToggleVerification = (type, orgId, currentStatus) => {
    const nextStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    verifyOrganization(type, orgId, nextStatus);
    
    // Refresh parent and child displays
    setStats(getData('thunai_stats'));
    setNotifications(getData('thunai_notifications'));
    setRequests(getData('thunai_requests'));
    setDonations(getData('thunai_donations'));
  };

  const handleSystemReset = () => {
    if (confirm("Are you sure you want to reset the platform database to demo seeds?")) {
      resetDB();
      setStats(getData('thunai_stats'));
      setNotifications(getData('thunai_notifications'));
      setRequests(getData('thunai_requests'));
      setDonations(getData('thunai_donations'));
      alert("Database successfully reset to default seeds.");
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Banner */}
      <div className="card-glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderLeft: '5px solid var(--danger)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Administrator Management Console
          </span>
          <h2 style={{ fontSize: '1.85rem', marginTop: '0.25rem', fontFamily: 'Outfit, sans-serif' }}>Platform Administration & Trust System</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Verify NGO & Orphanage partners, inspect resource custody ledgers, and audit system impact statistics.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }} onClick={handleSystemReset}>
            <RefreshCw size={14} /> Reset Demo Database
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button className={`btn btn-sm ${activeTab === 'verification' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('verification')}>
          <Shield size={16} /> Partner Verification ({ngos.filter(n => n.verification_status === 'pending').length + orphanages.filter(o => o.verification_status === 'pending').length} Pending)
        </button>
        <button className={`btn btn-sm ${activeTab === 'registry' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('registry')}>
          <List size={16} /> Resource Ledger & Custody Logs
        </button>
        <button className={`btn btn-sm ${activeTab === 'statistics' ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setActiveTab('statistics')}>
          <Users size={16} /> System Census & Analytics
        </button>
      </div>

      {/* TAB 1: VERIFICATION SCREEN */}
      {activeTab === 'verification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* NGOs List */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
                NGO Registry Verification ({ngos.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {ngos.filter(n => n.verification_status === 'verified').length} Verified / {ngos.length} Total
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>NGO Organization</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Transport Fleet</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Service Range</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Deliveries Completed</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(n => (
                    <tr key={n.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{n.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.contact}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>🚐 {n.transport_type}</td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>{n.service_radius} km radius</td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>{n.completed_deliveries_count || 12} shipments</td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        {n.verification_status === 'verified' ? (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>✅ Verified</span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>⏳ Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <button 
                          className={`btn btn-sm ${n.verification_status === 'verified' ? 'btn-ghost' : 'btn-primary'}`}
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', fontWeight: 700 }}
                          onClick={() => handleToggleVerification('ngo', n.id, n.verification_status)}
                        >
                          {n.verification_status === 'verified' ? 'Revoke Status' : 'Approve & Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orphanages List */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
                Orphanage Registry Verification ({orphanages.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {orphanages.filter(o => o.verification_status === 'verified').length} Verified / {orphanages.length} Total
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Orphanage Home</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Children Sheltered</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Registered Address</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orphanages.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{o.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.contact}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>🏠 <strong>{o.children_count} Children</strong></td>
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.address || 'Trichy'}</td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        {o.verification_status === 'verified' ? (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>✅ Verified</span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>⏳ Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <button 
                          className={`btn btn-sm ${o.verification_status === 'verified' ? 'btn-ghost' : 'btn-secondary'}`}
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', fontWeight: 700 }}
                          onClick={() => handleToggleVerification('orphanage', o.id, o.verification_status)}
                        >
                          {o.verification_status === 'verified' ? 'Revoke Status' : 'Approve & Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: RESOURCE REGISTRY AUDITS */}
      {activeTab === 'registry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Donations */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
              Active Donations Ledger ({donations.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.6rem' }}>Resource Item</th>
                    <th style={{ padding: '0.6rem' }}>Offered</th>
                    <th style={{ padding: '0.6rem' }}>Allocated</th>
                    <th style={{ padding: '0.6rem' }}>Available</th>
                    <th style={{ padding: '0.6rem' }}>Priority</th>
                    <th style={{ padding: '0.6rem' }}>Custody Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 700 }}>{d.item_name}</td>
                      <td style={{ padding: '0.6rem' }}>{d.quantity}</td>
                      <td style={{ padding: '0.6rem', color: 'var(--accent)', fontWeight: 600 }}>{d.allocated_quantity || 0}</td>
                      <td style={{ padding: '0.6rem', color: 'var(--primary)', fontWeight: 700 }}>{d.available_quantity}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span className={`badge ${d.priority === 'Urgent' ? 'badge-danger' : d.priority === 'High' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.6rem' }}>
                          {d.priority}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: 'var(--primary)' }}>{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Requests */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
              Orphanage Requirements Ledger ({requests.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.6rem' }}>Item Requested</th>
                    <th style={{ padding: '0.6rem' }}>Required Qty</th>
                    <th style={{ padding: '0.6rem' }}>Remaining</th>
                    <th style={{ padding: '0.6rem' }}>Orphanage Home</th>
                    <th style={{ padding: '0.6rem' }}>Priority</th>
                    <th style={{ padding: '0.6rem' }}>Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => {
                    const orph = orphanages.find(o => o.id === r.orphanage_id);
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 700 }}>{r.item_name}</td>
                        <td style={{ padding: '0.6rem' }}>{r.required_quantity}</td>
                        <td style={{ padding: '0.6rem', color: 'var(--secondary)', fontWeight: 700 }}>{r.remaining_quantity}</td>
                        <td style={{ padding: '0.6rem' }}>{orph?.name}</td>
                        <td style={{ padding: '0.6rem' }}>
                          <span className={`badge ${r.priority === 'Urgent' ? 'badge-danger' : r.priority === 'High' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.6rem' }}>
                            {r.priority}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem', fontWeight: 700, color: 'var(--secondary)' }}>{r.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Deliveries / Matches */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
              Active Shipments & Routing Logs ({deliveries.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.6rem' }}>NGO Driver Partner</th>
                    <th style={{ padding: '0.6rem' }}>Resource Qty</th>
                    <th style={{ padding: '0.6rem' }}>Recipient Orphanage</th>
                    <th style={{ padding: '0.6rem' }}>Transit Custody</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map(d => {
                    const match = matches.find(m => m.id === d.match_id);
                    const ngo = ngos.find(n => n.id === d.NGO_id);
                    const donationObj = donations.find(don => don.id === match?.donation_id);

                    if (!match) return null;

                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 700 }}>{ngo?.name}</td>
                        <td style={{ padding: '0.6rem' }}>{match.quantity} x {donationObj?.item_name || 'Items'}</td>
                        <td style={{ padding: '0.6rem' }}>{orphanages.find(o => o.id === match.orphanage_id)?.name}</td>
                        <td style={{ padding: '0.6rem' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SYSTEM ANALYTICS */}
      {activeTab === 'statistics' && (
        <div className="card animate-slide-up" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
            THUNAI Social Impact Analytics & Platform Health
          </h3>
          
          <div className="grid-2" style={{ gap: '2rem', marginTop: '1rem' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>Partner Network Census</h4>
              <ul style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
                <li className="flex-between">
                  <span>Total Users Registered:</span>
                  <strong>{users.length} Active Accounts</strong>
                </li>
                <li className="flex-between">
                  <span>NGOs Enlisted:</span>
                  <strong>{ngos.length} Partners</strong>
                </li>
                <li className="flex-between">
                  <span>Verified NGO Bridges:</span>
                  <strong>{ngos.filter(n => n.verification_status === 'verified').length} Verified</strong>
                </li>
                <li className="flex-between">
                  <span>Orphanages Sheltered:</span>
                  <strong>{orphanages.length} Homes</strong>
                </li>
                <li className="flex-between">
                  <span>Total Children Supported:</span>
                  <strong>{stats.childrenSupported || 5200}+ Children</strong>
                </li>
              </ul>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--secondary)', fontFamily: 'Outfit, sans-serif' }}>Resource Redistribution Audits</h4>
              <ul style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
                <li className="flex-between">
                  <span>Total Donations Logged:</span>
                  <strong>{stats.totalDonations}+ Posts</strong>
                </li>
                <li className="flex-between">
                  <span>Surplus Food Waste Saved:</span>
                  <strong>{stats.foodSavedKg} kg Edible Meals</strong>
                </li>
                <li className="flex-between">
                  <span>Educational & Item Units Distributed:</span>
                  <strong>{stats.itemsDistributed} Items</strong>
                </li>
                <li className="flex-between">
                  <span>Active Shipments in Transit:</span>
                  <strong>{deliveries.filter(d => d.status !== 'Confirmed').length} Active</strong>
                </li>
                <li className="flex-between">
                  <span>Completed & Closed Shipments:</span>
                  <strong>{deliveries.filter(d => d.status === 'Confirmed').length} Confirmed</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

