import React, { useState } from 'react';
import { Shield, Users, CheckCircle, Clock, Ban, List, Truck, ShieldAlert, Award, FileText, RefreshCw } from 'lucide-react';
import { getData, verifyOrganization, resetDB } from '../services/db';

export default function AdminDashboard({ stats, setStats, setNotifications, setRequests, setDonations }) {
  const [activeTab, setActiveTab] = useState('verification'); // verification, registry, statistics
  
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
    if (confirm("Are you sure you want to reset the platform database? All custom inputs will be lost.")) {
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
      <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderLeft: '5px solid var(--danger)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>Administrator Management Console</span>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>Platform Administration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Verify organizations, manage resource transactions, audit system logs, and inspect metrics.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={handleSystemReset}>
            <RefreshCw size={14} /> Clear & Reset DB
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button className={`btn btn-sm ${activeTab === 'verification' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('verification')}>
          <Shield size={16} /> Organization Verification
        </button>
        <button className={`btn btn-sm ${activeTab === 'registry' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveTab('registry')}>
          <List size={16} /> Resource Registry Logs
        </button>
        <button className={`btn btn-sm ${activeTab === 'statistics' ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setActiveTab('statistics')}>
          <Users size={16} /> System Analytics
        </button>
      </div>

      {/* TAB 1: VERIFICATION SCREEN */}
      {activeTab === 'verification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* NGOs List */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              NGO Registry Verification ({ngos.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>NGO Name</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Transport Fleet</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Service Range</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(n => (
                    <tr key={n.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{n.name}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>🚐 {n.transport_type}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{n.service_radius} km</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {n.verification_status === 'verified' ? (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Verified</span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button 
                          className={`btn btn-sm ${n.verification_status === 'verified' ? 'btn-ghost' : 'btn-primary'}`}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleToggleVerification('ngo', n.id, n.verification_status)}
                        >
                          {n.verification_status === 'verified' ? 'Revoke Status' : 'Approve Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orphanages List */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Orphanage Registry Verification ({orphanages.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Orphanage Name</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Children Sheltered</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orphanages.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{o.name}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{o.children_count} Children</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {o.verification_status === 'verified' ? (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Verified</span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button 
                          className={`btn btn-sm ${o.verification_status === 'verified' ? 'btn-ghost' : 'btn-secondary'}`}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleToggleVerification('orphanage', o.id, o.verification_status)}
                        >
                          {o.verification_status === 'verified' ? 'Revoke Status' : 'Approve Verify'}
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
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Active Donations Ledger ({donations.filter(d => d.status !== 'Confirmed').length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem' }}>Item Name</th>
                    <th style={{ padding: '0.5rem' }}>Qty Left</th>
                    <th style={{ padding: '0.5rem' }}>Donor Zone</th>
                    <th style={{ padding: '0.5rem' }}>Priority</th>
                    <th style={{ padding: '0.5rem' }}>Custody Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{d.item_name}</td>
                      <td style={{ padding: '0.5rem' }}>{d.available_quantity} / {d.quantity}</td>
                      <td style={{ padding: '0.5rem' }}>{d.contact_info.includes('Cantonment') ? 'Cantonment' : d.contact_info.includes('Kailasapuram') ? 'Kailasapuram' : d.contact_info.includes('Thillai Nagar') ? 'Thillai Nagar' : 'K K Nagar'}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span className={`badge ${d.priority === 'Urgent' ? 'badge-danger' : d.priority === 'High' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.6rem' }}>
                          {d.priority}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Requests */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Orphanage Needs Requests Ledger ({requests.filter(r => r.status !== 'Fulfilled').length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem' }}>Item Requested</th>
                    <th style={{ padding: '0.5rem' }}>Qty Needed</th>
                    <th style={{ padding: '0.5rem' }}>Orphanage Home</th>
                    <th style={{ padding: '0.5rem' }}>Urgency</th>
                    <th style={{ padding: '0.5rem' }}>Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => {
                    const orph = orphanages.find(o => o.id === r.orphanage_id);
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{r.item_name}</td>
                        <td style={{ padding: '0.5rem' }}>{r.remaining_quantity} / {r.required_quantity}</td>
                        <td style={{ padding: '0.5rem' }}>{orph?.name}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span className={`badge ${r.priority === 'Urgent' ? 'badge-danger' : r.priority === 'High' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.6rem' }}>
                            {r.priority}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--secondary)' }}>{r.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Deliveries / Matches */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Active Shipments & Routing Logs ({deliveries.filter(d => d.status !== 'Confirmed').length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem' }}>NGO Driver Partner</th>
                    <th style={{ padding: '0.5rem' }}>Resource Qty</th>
                    <th style={{ padding: '0.5rem' }}>Recipient Orphanage</th>
                    <th style={{ padding: '0.5rem' }}>Route Coordinates</th>
                    <th style={{ padding: '0.5rem' }}>Transit Custody</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map(d => {
                    const match = matches.find(m => m.id === d.match_id);
                    const ngo = ngos.find(n => n.id === d.NGO_id);
                    const orph = orphanageObj => orphanages.find(o => o.id === match?.orphanage_id);
                    const donationObj = donations.find(don => don.id === match?.donation_id);

                    if (!match) return null;

                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{ngo?.name}</td>
                        <td style={{ padding: '0.5rem' }}>{match.quantity} x {donationObj?.item_name || 'Items'}</td>
                        <td style={{ padding: '0.5rem' }}>{orphanages.find(o => o.id === match.orphanage_id)?.name}</td>
                        <td style={{ padding: '0.5rem' }}>NGO({ngo?.location.lat},{ngo?.location.lng}) ➔ Orph({d.delivery_location.lat},{d.delivery_location.lng})</td>
                        <td style={{ padding: '0.5rem' }}>
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
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            System Integrity & Core Verification Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Role Registry Census</h4>
              <ul style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
                <li className="flex-between">
                  <span>Total Users Registered:</span>
                  <strong>{users.length}</strong>
                </li>
                <li className="flex-between">
                  <span>NGOs Enlisted:</span>
                  <strong>{ngos.length}</strong>
                </li>
                <li className="flex-between">
                  <span>Orphanages Enlisted:</span>
                  <strong>{orphanages.length}</strong>
                </li>
                <li className="flex-between">
                  <span>Verified NGO Bridges:</span>
                  <strong>{ngos.filter(n => n.verification_status === 'verified').length}</strong>
                </li>
              </ul>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>Sustenance Connection Audits</h4>
              <ul style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
                <li className="flex-between">
                  <span>Active Match Links:</span>
                  <strong>{matches.length}</strong>
                </li>
                <li className="flex-between">
                  <span>Active Shipments In Transit:</span>
                  <strong>{deliveries.filter(d => d.status !== 'Confirmed').length}</strong>
                </li>
                <li className="flex-between">
                  <span>Closed & Completed Transactions:</span>
                  <strong>{deliveries.filter(d => d.status === 'Confirmed').length}</strong>
                </li>
                <li className="flex-between">
                  <span>Items Handled:</span>
                  <strong>{stats.itemsDistributed} Items</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
