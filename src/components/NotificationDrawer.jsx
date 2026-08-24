import React, { useState } from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle, Trash2, Truck, Compass, Sparkles } from 'lucide-react';
import { getData, saveData } from '../services/db';

export default function NotificationDrawer({ isOpen, onClose, currentUserId, notifications, setNotifications }) {
  const [filterTab, setFilterTab] = useState('all'); // all, urgent, deliveries, matches
  
  // Filter notifications for the current active user role
  const userNotifications = notifications.filter(n => n.user_id === currentUserId);

  const filteredNotifs = userNotifications.filter(n => {
    if (filterTab === 'urgent') return n.type === 'urgent' || n.priority === 'Urgent';
    if (filterTab === 'deliveries') return n.type === 'delivery' || n.title.toLowerCase().includes('delivery') || n.title.toLowerCase().includes('pickup') || n.title.toLowerCase().includes('transit');
    if (filterTab === 'matches') return n.type === 'match' || n.title.toLowerCase().includes('match') || n.title.toLowerCase().includes('allocated');
    return true;
  });

  const markAllAsRead = () => {
    const updated = notifications.map(n => {
      if (n.user_id === currentUserId) {
        return { ...n, status: 'read' };
      }
      return n;
    });
    saveData('thunai_notifications', updated);
    setNotifications(updated);
  };

  const clearAll = () => {
    const updated = notifications.filter(n => n.user_id !== currentUserId);
    saveData('thunai_notifications', updated);
    setNotifications(updated);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle size={18} className="text-danger animate-pulse-slow" />;
      case 'success':
        return <CheckCircle size={18} className="text-success" />;
      case 'delivery':
        return <Truck size={18} className="text-secondary" />;
      case 'match':
        return <Compass size={18} className="text-primary" />;
      default:
        return <Info size={18} className="text-primary" />;
    }
  };

  return (
    <div className={`notification-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} className="text-primary" />
          <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>Notifications</h3>
          {userNotifications.filter(n => n.status === 'unread').length > 0 && (
            <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              {userNotifications.filter(n => n.status === 'unread').length} New
            </span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0.25rem' }}>
          <X size={20} />
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', overflowX: 'auto' }}>
        <button 
          className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
          onClick={() => setFilterTab('all')}
        >
          All ({userNotifications.length})
        </button>
        <button 
          className={`btn btn-sm ${filterTab === 'urgent' ? 'btn-secondary' : 'btn-ghost'}`}
          style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', color: filterTab === 'urgent' ? 'white' : 'var(--danger)' }}
          onClick={() => setFilterTab('urgent')}
        >
          🚨 Urgent
        </button>
        <button 
          className={`btn btn-sm ${filterTab === 'deliveries' ? 'btn-secondary' : 'btn-ghost'}`}
          style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
          onClick={() => setFilterTab('deliveries')}
        >
          🚚 Deliveries
        </button>
        <button 
          className={`btn btn-sm ${filterTab === 'matches' ? 'btn-secondary' : 'btn-ghost'}`}
          style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
          onClick={() => setFilterTab('matches')}
        >
          🎯 Matches
        </button>
      </div>

      <div className="drawer-content">
        {filteredNotifs.length > 0 ? (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: '0.75rem' }} onClick={markAllAsRead}>
                Mark all read
              </button>
              <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }} onClick={clearAll}>
                <Trash2 size={12} /> Clear all
              </button>
            </div>
            {filteredNotifs.map((n) => (
              <div 
                key={n.id} 
                className={`notification-item ${n.status === 'unread' ? 'unread' : ''} ${n.type === 'urgent' ? 'urgent' : ''}`}
              >
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>{n.message}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'right' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex-center" style={{ flexDirection: 'column', height: '100%', color: 'var(--text-muted)', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
            <Bell size={48} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No {filterTab !== 'all' ? filterTab : ''} notifications.<br />Updates about matches, live transits and deliveries will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

