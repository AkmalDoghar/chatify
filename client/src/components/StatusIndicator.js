'use client';

import React from 'react';

export const formatLastSeen = (dateString) => {
  if (!dateString) return 'Offline';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function StatusIndicator({ status, lastSeen, showText = true }) {
  const isOnline = status === 'online';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        className={isOnline ? 'status-dot-online' : 'status-dot-offline'}
        style={{
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          display: 'inline-block',
        }}
      />
      {showText && (
        <span style={{ fontSize: '0.8rem', color: isOnline ? 'var(--accent-teal)' : 'var(--text-muted)', fontWeight: 500 }}>
          {isOnline ? 'Online' : `Last seen ${formatLastSeen(lastSeen)}`}
        </span>
      )}
    </div>
  );
}
