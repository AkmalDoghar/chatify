'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Phone, MessageSquare, Trash2, UserCheck, FileText } from 'lucide-react';
import api from '../utils/api';

export default function SavedContactsModal({ isOpen, onClose, onSelectUser }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // 1. Fetch saved contacts from backend DB
      const res = await api.get('/users/contacts');
      const saved = res.data || [];

      // 2. Fetch all registered users
      const usersRes = await api.get('/users/all');
      const allUsers = usersRes.data || [];

      // Format & merge
      const merged = saved.map((sc) => {
        const matched = allUsers.find(
          (u) => (u.phone && u.phone === sc.phone) || u.name.toLowerCase() === sc.name.toLowerCase()
        );
        return {
          _id: sc._id,
          name: sc.name,
          phone: sc.phone,
          note: sc.note,
          profilePic: matched ? matched.profilePic : '',
          userId: matched ? matched._id : null,
        };
      });

      if (merged.length > 0) {
        setContacts(merged);
      } else {
        // Show registered users if no custom contacts added yet
        const defaultContacts = allUsers.map((u) => ({
          _id: u._id,
          name: u.name,
          phone: u.email || 'Registered User',
          note: u.bio || '',
          profilePic: u.profilePic,
          userId: u._id,
        }));
        setContacts(defaultContacts);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = async (contact) => {
    try {
      if (contact.userId) {
        await onSelectUser(contact.userId);
      } else {
        await onSelectUser(contact);
      }
      onClose();
    } catch (err) {
      console.error('Error opening chat for contact:', err);
      onClose();
    }
  };

  const handleDeleteContact = async (e, contactId) => {
    e.stopPropagation(); // Prevent opening chat when clicking delete
    try {
      await api.delete(`/users/contacts/${contactId}`);
      setContacts((prev) => prev.filter((c) => c._id !== contactId));
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="modal-overlay fade-in"
      style={{
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="modal-content slide-in-up"
        style={{
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          borderRadius: '28px',
          padding: '26px',
          backgroundColor: 'var(--bg-panel)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Absolute Top-Right Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '22px',
            right: '22px',
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
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-main)')}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-coral-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-coral)',
              }}
            >
              <UserCheck size={22} />
            </div>
            <div>
              <h2 className="brand-font" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                Saved Contacts
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Click any contact to chat immediately
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
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
            placeholder="Search saved contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: '40px',
              borderRadius: '18px',
              backgroundColor: 'var(--bg-main)',
              fontSize: '0.86rem',
            }}
          />
        </div>

        {/* Contacts List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '4px',
          }}
        >
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading saved contacts...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No contacts found
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => handleContactClick(contact)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-coral-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-main)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={
                      contact.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=E2725B&color=fff`
                    }
                    alt={contact.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {contact.name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {contact.phone}
                    </p>
                    {contact.note && (
                      <p style={{ fontSize: '0.74rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <FileText size={11} /> {contact.note}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactClick(contact);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '16px',
                      border: 'none',
                      backgroundColor: 'var(--accent-coral)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(226, 114, 91, 0.25)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <MessageSquare size={14} /> Message
                  </button>

                  <button
                    onClick={(e) => handleDeleteContact(e, contact._id)}
                    title="Delete Contact"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'backgroundColor 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
