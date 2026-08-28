'use client';

import React from 'react';
import { User, Shield, Bell, Key, LogOut, ChevronRight, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsView({ onOpenProfile }) {
  const { user, logout } = useAuth();

  const settingsOptions = [
    {
      icon: User,
      title: 'Profile Settings',
      subtitle: 'Name, bio, and profile picture',
      action: onOpenProfile,
      color: 'var(--accent-coral)',
      bg: 'var(--accent-coral-light)',
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'JWT token encryption & status privacy',
      action: () => alert('Privacy & Security: Your account is protected with bcrypt hashing & JWT tokens.'),
      color: 'var(--accent-teal)',
      bg: 'var(--accent-teal-light)',
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Message sound & desktop alerts',
      action: () => alert('Notifications are enabled for real-time messages.'),
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
    {
      icon: Key,
      title: 'Account Security',
      subtitle: 'Password & email configuration',
      action: onOpenProfile,
      color: '#EC4899',
      bg: '#FDF2F8',
    },
  ];

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
          Settings
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Manage your account & preferences
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* User Card */}
        <div
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 16px',
            borderRadius: '20px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            marginBottom: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <img
            src={user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=E2725B&color=fff`}
            alt={user?.name}
            style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {user?.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {settingsOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <div
                key={i}
                onClick={opt.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  transition: 'backgroundColor 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    backgroundColor: opt.bg,
                    color: opt.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {opt.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {opt.subtitle}
                  </p>
                </div>

                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            );
          })}
        </div>

        {/* Logout Row */}
        <div style={{ marginTop: '28px' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '18px',
              border: '1px solid #FCA5A5',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={18} /> Log Out of Chatify
          </button>
        </div>
      </div>
    </div>
  );
}
