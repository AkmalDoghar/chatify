'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, MessageSquarePlus, UserPlus } from 'lucide-react';
import api from '../utils/api';
import StatusIndicator from './StatusIndicator';

export default function NewChatModal({ isOpen, onClose, onSelectUser }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers('');
    }
  }, [isOpen]);

  const fetchUsers = async (query) => {
    setLoading(true);
    try {
      const endpoint = query ? `/users?search=${encodeURIComponent(query)}` : '/users/all';
      const res = await api.get(endpoint);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchUsers(val);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            Start a New Chat
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            style={{ paddingLeft: '42px', borderRadius: '20px' }}
          />
        </div>

        {/* User list */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <div style={{ textAlignment: 'center', padding: '24px', color: 'var(--text-muted)' }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ textAlignment: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              No users found. Try another search.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => {
                  onSelectUser(u._id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-panel)')}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=E2725B&color=fff`}
                    alt={u.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '2px', right: '0' }}>
                    <StatusIndicator status={u.status} lastSeen={u.lastSeen} showText={false} />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.bio || u.email}
                  </p>
                </div>

                <MessageSquarePlus size={20} color="var(--accent-coral)" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
