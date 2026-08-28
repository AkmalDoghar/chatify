'use client';

import React, { useState } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CallsView({ chats, onOpenNewChat }) {
  const { user } = useAuth();
  const [filterText, setFilterText] = useState('');

  // Sample call history generator based on user chats
  const sampleCalls = chats.flatMap((chat, index) => {
    const recipient = chat.participants?.find(p => p._id !== user?._id);
    if (!recipient) return [];
    return [
      {
        id: `call-${chat._id}-1`,
        user: recipient,
        type: index % 2 === 0 ? 'incoming' : 'outgoing',
        video: index % 3 === 0,
        time: 'Today, 10:45 AM',
      },
      {
        id: `call-${chat._id}-2`,
        user: recipient,
        type: 'missed',
        video: false,
        time: 'Yesterday, 4:20 PM',
      }
    ];
  }).filter(c => c.user.name.toLowerCase().includes(filterText.toLowerCase()));

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
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: '1' }}>
            Calls
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Recent call log
          </span>
        </div>

        <button
          onClick={onOpenNewChat}
          className="btn-primary"
          style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
          title="New Call"
        >
          <Phone size={18} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search calls..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ paddingLeft: '38px', borderRadius: '20px', backgroundColor: 'var(--bg-main)', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Calls List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {sampleCalls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-coral-light)', color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={28} />
            </div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>No Calls Yet</h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '220px' }}>Start an audio or video call with your contacts anytime.</p>
          </div>
        ) : (
          sampleCalls.map((call) => (
            <div
              key={call.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '18px',
                marginBottom: '6px',
                transition: 'backgroundColor 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <img
                src={call.user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(call.user.name)}&background=E2725B&color=fff`}
                alt={call.user.name}
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {call.user.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: call.type === 'missed' ? '#EF4444' : 'var(--text-muted)' }}>
                  {call.type === 'incoming' && <PhoneIncoming size={13} color="var(--accent-teal)" />}
                  {call.type === 'outgoing' && <PhoneOutgoing size={13} color="var(--accent-coral)" />}
                  {call.type === 'missed' && <PhoneMissed size={13} color="#EF4444" />}
                  <span>{call.time}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', backgroundColor: 'var(--accent-coral-light)', color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Audio Call"
                  onClick={() => alert(`Starting audio call with ${call.user.name}...`)}
                >
                  <Phone size={16} />
                </button>
                <button
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', backgroundColor: 'var(--accent-teal-light)', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Video Call"
                  onClick={() => alert(`Starting video call with ${call.user.name}...`)}
                >
                  <Video size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
