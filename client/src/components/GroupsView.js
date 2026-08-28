'use client';

import React, { useState } from 'react';
import { Search, Users, Plus, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GroupsView({ chats, activeChat, onSelectChat, onOpenNewChat }) {
  const { user } = useAuth();
  const [filterText, setFilterText] = useState('');

  const groupChats = chats.filter(c => c.isGroupChat && c.chatName.toLowerCase().includes(filterText.toLowerCase()));

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
            Groups
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {groupChats.length} active communities
          </span>
        </div>

        <button
          onClick={onOpenNewChat}
          className="btn-primary"
          style={{ borderRadius: '16px', padding: '8px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> New Group
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search group chats..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ paddingLeft: '38px', borderRadius: '20px', backgroundColor: 'var(--bg-main)', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {groupChats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-teal-light)', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} />
            </div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>No Groups Found</h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '220px' }}>Create a group to start chatting with multiple friends at once.</p>
            <button onClick={onOpenNewChat} className="btn-primary" style={{ fontSize: '0.84rem', borderRadius: '20px', marginTop: '6px' }}>
              <UserPlus size={16} /> Create Group Chat
            </button>
          </div>
        ) : (
          groupChats.map((chat) => {
            const isActive = activeChat?._id === chat._id;
            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '18px',
                  marginBottom: '6px',
                  backgroundColor: isActive ? 'var(--accent-teal-light)' : 'transparent',
                  border: isActive ? '1px solid var(--accent-teal)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                  {chat.chatName.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {chat.chatName}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={12} color="var(--accent-teal)" /> {chat.participants?.length || 0} members
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
