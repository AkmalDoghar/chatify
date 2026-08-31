'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MessageSquare, MoreVertical, CheckCheck, Users, User, Shield, BookUser } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusIndicator from './StatusIndicator';

export default function ChatList({
  chats,
  activeChat,
  onSelectChat,
  onOpenProfile,
  onOpenNewChat,
  onOpenContacts,
}) {
  const { user } = useAuth();
  const [filterText, setFilterText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'groups'
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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

  const totalChats = chats.length;
  const unreadChats = chats.filter((c) => (c.unreadCount || 0) > 0).length;
  const groupCount = chats.filter((c) => c.isGroupChat).length;

  const filteredChats = chats.filter((chat) => {
    if (activeFilter === 'unread' && (!chat.unreadCount || chat.unreadCount === 0)) return false;
    if (activeFilter === 'groups' && !chat.isGroupChat) return false;

    if (chat.isGroupChat) {
      return chat.chatName.toLowerCase().includes(filterText.toLowerCase());
    }
    const recipient = getChatRecipient(chat);
    return recipient?.name.toLowerCase().includes(filterText.toLowerCase());
  });

  return (
    <div
      className={`fade-in chat-list-panel ${activeChat ? 'mobile-hide-panel' : ''}`}
      style={{
        width: '320px',
        height: '100%',
        backgroundColor: 'var(--bg-panel)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* ── HEADER: "Chatify" Brand Logo & Title + Action Icons ── */}
      <div
        style={{
          padding: '16px 18px 12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 className="brand-font" style={{ fontSize: '1.85rem', color: 'var(--accent-coral)', lineHeight: 1 }}>
            Chatify
          </h2>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-teal)',
              display: 'inline-block',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} ref={menuRef}>
          {/* New Chat Button */}
          <button
            onClick={onOpenNewChat}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'var(--accent-coral)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(226, 114, 91, 0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="New Chat"
          >
            <Plus size={20} />
          </button>

          {/* Menu Dots Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: showMenu ? 'var(--bg-subtle)' : 'transparent',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
            onMouseLeave={(e) => {
              if (!showMenu) e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Menu Options"
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu Box */}
          {showMenu && (
            <div
              className="slide-in-up"
              style={{
                position: 'absolute',
                top: '54px',
                right: '18px',
                backgroundColor: 'var(--bg-panel)',
                borderRadius: '18px',
                boxShadow: '0 14px 40px rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-color)',
                padding: '8px',
                zIndex: 30,
                minWidth: '200px',
              }}
            >
              <button
                onClick={() => { onOpenContacts && onOpenContacts(); setShowMenu(false); }}
                style={{
                  width: '100%', padding: '10px 12px', border: 'none', background: 'none',
                  textAlign: 'left', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600,
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'backgroundColor 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <BookUser size={17} color="var(--accent-coral)" /> View Contacts
              </button>

              <button
                onClick={() => { onOpenNewChat(); setShowMenu(false); }}
                style={{
                  width: '100%', padding: '10px 12px', border: 'none', background: 'none',
                  textAlign: 'left', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600,
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'backgroundColor 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Plus size={17} color="var(--accent-coral)" /> New Chat
              </button>

              <button
                onClick={() => { onOpenNewChat(); setShowMenu(false); }}
                style={{
                  width: '100%', padding: '10px 12px', border: 'none', background: 'none',
                  textAlign: 'left', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600,
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'backgroundColor 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Users size={17} color="var(--accent-teal)" /> New Group Chat
              </button>

              <button
                onClick={() => { onOpenProfile(); setShowMenu(false); }}
                style={{
                  width: '100%', padding: '10px 12px', border: 'none', background: 'none',
                  textAlign: 'left', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600,
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'backgroundColor 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={17} color="#8B5CF6" /> My Profile
              </button>

              <button
                onClick={() => { setActiveFilter('unread'); setShowMenu(false); }}
                style={{
                  width: '100%', padding: '10px 12px', border: 'none', background: 'none',
                  textAlign: 'left', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600,
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'backgroundColor 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <CheckCheck size={17} color="#10B981" /> View Unread
              </button>

              <button
                onClick={() => { alert('Privacy options: end-to-end socket connection active.'); setShowMenu(false); }}
                style={{
                  width: '100%', padding: '10px 12px', border: 'none', background: 'none',
                  textAlign: 'left', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600,
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'backgroundColor 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Shield size={17} color="#EC4899" /> Security Info
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── SEARCH BOX (Positioned right below Chatify Header) ── */}
      <div style={{ padding: '0 18px 10px 18px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={17}
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
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-main)',
              fontSize: '0.88rem',
            }}
          />
        </div>
      </div>

      {/* ── FILTER PILLS DISPLAY + INLINE ADD (+) BUTTON ── */}
      <div style={{ padding: '0 18px 12px 18px', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '5px 14px',
              borderRadius: '14px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeFilter === 'all' ? 'var(--accent-coral)' : 'var(--bg-main)',
              color: activeFilter === 'all' ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
          >
            All ({totalChats})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            style={{
              padding: '5px 14px',
              borderRadius: '14px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeFilter === 'unread' ? 'var(--accent-coral)' : 'var(--bg-main)',
              color: activeFilter === 'unread' ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Unread ({unreadChats})
          </button>
          <button
            onClick={() => setActiveFilter('groups')}
            style={{
              padding: '5px 14px',
              borderRadius: '14px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeFilter === 'groups' ? 'var(--accent-teal)' : 'var(--bg-main)',
              color: activeFilter === 'groups' ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Groups ({groupCount})
          </button>
        </div>

        {/* Inline Add (+) Button */}
        <button
          onClick={onOpenNewChat}
          title="Add New Chat"
          style={{
            padding: '5px 12px',
            borderRadius: '14px',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: 'var(--accent-coral-light)',
            color: 'var(--accent-coral)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(226, 114, 91, 0.15)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={15} /> Add
        </button>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0 18px' }} />

      {/* ── CONVERSATIONS LIST ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {filteredChats.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 18px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <MessageSquare size={32} color="var(--border-color)" />
            <p style={{ fontSize: '0.88rem' }}>No conversations match your search.</p>
            <button onClick={onOpenNewChat} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: '16px' }}>
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
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '16px',
                  marginBottom: '4px',
                  backgroundColor: isActive ? 'var(--accent-coral-light)' : 'transparent',
                  border: 'none',
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
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  {!chat.isGroupChat && recipient && (
                    <div style={{ position: 'absolute', bottom: '0px', right: '0' }}>
                      <StatusIndicator status={recipient.status} showText={false} />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                    <h3
                      style={{
                        fontSize: '0.94rem',
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? 'var(--accent-coral)' : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {chat.isGroupChat ? chat.chatName : recipient?.name}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {formatChatTime(lastMsg?.createdAt || chat.updatedAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p
                      style={{
                        fontSize: '0.82rem',
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
                          : lastMsg.messageType === 'voice'
                          ? '🎤 Voice message'
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
                          borderRadius: '10px',
                          padding: '2px 7px',
                          minWidth: '18px',
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
