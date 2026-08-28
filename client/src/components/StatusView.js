'use client';

import React from 'react';
import { Plus, CircleDashed, Camera, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StatusView({ chats, onOpenProfile }) {
  const { user } = useAuth();

  // Extract unique contacts from chats for sample status updates
  const contactStatuses = chats.flatMap((chat) => {
    const recipient = chat.participants?.find(p => p._id !== user?._id);
    if (!recipient) return [];
    return [{
      id: recipient._id,
      user: recipient,
      time: 'Today, 8:30 AM',
      unread: true,
    }];
  });

  return (
    <div
      className="fade-in"
      style={{
        width: '340px',
        height: '100%',
        backgroundColor: 'var(--bg-panel)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="brand-font" style={{ fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: '1', marginBottom: '4px' }}>
          Status
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Share moments with your contacts
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* User's own status update row */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              padding: '10px 12px',
              borderRadius: '18px',
              backgroundColor: 'var(--bg-main)',
              transition: 'all 0.2s ease',
            }}
            onClick={onOpenProfile}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=E2725B&color=fff`}
                alt={user?.name}
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: 'var(--accent-coral)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-panel)',
                }}
              >
                <Plus size={13} />
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                My Status
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tap to update status bio
              </p>
            </div>
          </div>
        </div>

        {/* Recent updates heading */}
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
          Recent Updates ({contactStatuses.length})
        </div>

        {contactStatuses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <CircleDashed size={32} color="var(--accent-teal)" />
            <p style={{ fontSize: '0.86rem' }}>No status updates from friends yet.</p>
          </div>
        ) : (
          contactStatuses.map((st) => (
            <div
              key={st.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 12px',
                borderRadius: '18px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'backgroundColor 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => alert(`${st.user.name}'s Status: "${st.user.bio || 'Hey there! I am using Chatify.'}"`)}
            >
              <div style={{ position: 'relative', padding: '3px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-coral), var(--accent-teal))' }}>
                <img
                  src={st.user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.user.name)}&background=E2725B&color=fff`}
                  alt={st.user.name}
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bg-panel)' }}
                />
              </div>

              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {st.user.name}
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {st.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
