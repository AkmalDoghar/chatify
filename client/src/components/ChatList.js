'use client';

import React, { useState } from 'react';
import { Search, Plus, User as UserIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusIndicator, { formatLastSeen } from './StatusIndicator';

export default function ChatList({
  chats,
  activeChat,
  onSelectChat,
  onOpenProfile,
  onOpenNewChat,
}) {
  const { user } = useAuth();
  const [filterText, setFilterText] = useState('');

  // Helper to extract the recipient participant in a 1-to-1 chat
  const getChatRecipient = (chat) => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find((p) => p._id !== user?._id) || chat.participants[0];
  };

  const formatChatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter((chat) => {
    if (chat.isGroupChat) {
      return chat.chatName.toLowerCase().includes(filterText.toLowerCase());
    }
    const recipient = getChatRecipient(chat);
    return recipient?.name.toLowerCase().includes(filterText.toLowerCase());
  });

  return (
    <div
      style={{
        width: '340px',
        height: '100%',
        backgroundColor: 'var(--bg-panel)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={onOpenProfile}
            style={{ position: 'relative', cursor: 'pointer' }}
            title="Edit Profile"
          >
            <img
              src={user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=E2725B&color=fff`}
              alt={user?.name}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
              <StatusIndicator status="online" showText={false} />
            </div>
          </div>

          <div>
            <h1 className="brand-font" style={{ fontSize: '1.7rem', color: 'var(--accent-coral)', lineHeight: '1' }}>
              Chatify
            </h1>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {user?.name}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenNewChat}
          className="btn-primary"
          style={{
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            padding: 0,
          }}
          title="New Chat"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search Input */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
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
            placeholder="Search conversations..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              paddingLeft: '38px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-main)',
              fontSize: '0.88rem',
            }}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {filteredChats.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <MessageSquare size={32} color="var(--border-color)" />
            <p style={{ fontSize: '0.9rem' }}>No conversations yet.</p>
            <button onClick={onOpenNewChat} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
              Start a Chat
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const recipient = getChatRecipient(chat);
            const isActive = activeChat?._id === chat._id;
            const lastMsg = chat.lastMessage;
            const unreadCount = chat.unreadCount || 0;

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
                  backgroundColor: isActive ? 'var(--accent-coral-light)' : 'transparent',
                  border: isActive ? '1px solid var(--accent-coral)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={
                      chat.isGroupChat
                        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.chatName)}&background=3F8F82&color=fff`
                        : recipient?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient?.name || 'U')}&background=E2725B&color=fff`
                    }
                    alt={chat.isGroupChat ? chat.chatName : recipient?.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  {!chat.isGroupChat && recipient && (
                    <div style={{ position: 'absolute', bottom: '2px', right: '0' }}>
                      <StatusIndicator status={recipient.status} showText={false} />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h3
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {chat.isGroupChat ? chat.chatName : recipient?.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatChatTime(lastMsg?.createdAt || chat.updatedAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontWeight: unreadCount > 0 ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginRight: '6px',
                      }}
                    >
                      {lastMsg
                        ? lastMsg.messageType === 'image'
                          ? '📷 Image'
                          : lastMsg.content
                        : 'No messages yet'}
                    </p>

                    {unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: 'var(--accent-coral)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          borderRadius: '12px',
                          padding: '2px 8px',
                          minWidth: '20px',
                          textAlign: 'center',
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
