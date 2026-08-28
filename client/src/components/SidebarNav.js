'use client';

import React from 'react';
import {
  MessageSquare, CircleDashed, Phone, Users, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusIndicator from './StatusIndicator';

export default function SidebarNav({ activeTab, setActiveTab, onOpenProfile, unreadCount = 0 }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, badge: unreadCount },
    { id: 'status', label: 'Status', icon: CircleDashed, dot: true },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="sidebar-nav-container"
      style={{
        width: '72px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 0 18px 0',
        flexShrink: 0,
        zIndex: 20,
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Top Section: Navigation Items */}
      <div className="sidebar-nav-top" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <nav className="sidebar-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`sidebar-btn ${isActive ? 'tab-active-anim' : ''}`}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(226, 114, 91, 0.16)' : 'transparent',
                  color: isActive ? 'var(--accent-coral)' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = 'var(--accent-coral)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <Icon size={21} style={{ transition: 'transform 0.2s ease', transform: isActive ? 'scale(1.08)' : 'scale(1)' }} />
                <span className="sidebar-btn-label" style={{ color: isActive ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
                  {item.label}
                </span>

                {/* Left Active Glow Indicator Strip (Desktop) */}
                {isActive && (
                  <div
                    className="sidebar-active-strip slide-in-left"
                    style={{
                      position: 'absolute',
                      left: '-12px',
                      top: '10px',
                      bottom: '10px',
                      width: '4px',
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: 'var(--accent-coral)',
                      boxShadow: '0 0 10px var(--accent-coral)',
                    }}
                  />
                )}

                {/* Unread Badge */}
                {item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '6px',
                      backgroundColor: 'var(--accent-coral)',
                      color: '#FFFFFF',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      padding: '1px 5px',
                      minWidth: '16px',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      boxShadow: '0 2px 6px rgba(226, 114, 91, 0.5)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Status Dot Notification */}
                {item.dot && !item.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '10px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-teal)',
                      boxShadow: '0 0 6px var(--accent-teal)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Profile Avatar */}
      <div className="sidebar-nav-bottom" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
        <div
          onClick={onOpenProfile}
          style={{
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Your Profile"
        >
          <img
            src={user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=E2725B&color=fff`}
            alt={user?.name}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--accent-coral)',
            }}
          />
          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px' }}>
            <StatusIndicator status="online" showText={false} />
          </div>
        </div>
      </div>
    </aside>
  );
}
