'use client';

import React, { useState } from 'react';
import { X, Camera, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let finalPicUrl = profilePic;

      if (profilePic.startsWith('data:image')) {
        const uploadRes = await api.post('/upload', { image: profilePic });
        finalPicUrl = uploadRes.data.url;
      }

      const res = await api.put('/users/profile', {
        name,
        bio,
        profilePic: finalPicUrl,
      });

      updateUser(res.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
          <h2 className="brand-font" style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>
            Your Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '10px 14px', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '14px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <img
                src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E2725B&color=fff`}
                alt={name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--accent-coral)',
                }}
              />
              <label
                htmlFor="profile-upload"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: 'var(--accent-coral)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
                title="Upload Photo"
              >
                <Camera size={14} />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Display Name
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-field"
              value={user.email}
              disabled
              style={{ backgroundColor: 'var(--bg-subtle)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Bio
            </label>
            <textarea
              className="input-field"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell others a bit about yourself..."
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={logout}
              className="btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#DC2626' }}
            >
              <LogOut size={16} /> Logout
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 2 }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
