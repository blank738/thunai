import React from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { getData, saveData } from '../services/db';

export default function NotificationDrawer({ isOpen, onClose, currentUserId, notifications, setNotifications }) {
  // Filter notifications for the current active user role
  const userNotifications = notifications.filter(n => n.user_id === currentUserId);

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
      default:
        return <Info size={18} className="text-primary" />;
    }
  };

  return (
    <div className={`notification-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} className="text-primary" />
          <h3>Notifications</h3>
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

      <div className="drawer-content">
        {userNotifications.length > 0 ? (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: '0.75rem' }} onClick={markAllAsRead}>
                Mark all read
              </button>
              <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }} onClick={clearAll}>
                <Trash2 size={12} /> Clear all
              </button>
            </div>
            {userNotifications.map((n) => (
              <div 
                key={n.id} 
                className={`notification-item ${n.status === 'unread' ? 'unread' : ''} ${n.type === 'urgent' ? 'urgent' : ''}`}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.message}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'right' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex-center" style={{ flexDirection: 'column', height: '100%', color: 'var(--text-muted)', gap: '1rem', textAlign: 'center' }}>
            <Bell size={48} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No notifications yet.<br />Updates about matches and deliveries will show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
