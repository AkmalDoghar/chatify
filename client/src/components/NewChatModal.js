'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserPlus,
  Users,
  Search,
  User,
  Phone,
  FileText,
  Check,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import api from '../utils/api';

const WORLD_COUNTRIES = [
  { code: '+92', flag: '🇵🇰', name: 'Pakistan', digits: 10, placeholder: '300 1234567' },
  { code: '+1', flag: '🇺🇸', name: 'United States', digits: 10, placeholder: '202 555 0143' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom', digits: 10, placeholder: '7911 123456' },
  { code: '+1', flag: '🇨🇦', name: 'Canada', digits: 10, placeholder: '416 555 0143' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates', digits: 9, placeholder: '50 123 4567' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', digits: 9, placeholder: '50 123 4567' },
  { code: '+91', flag: '🇮🇳', name: 'India', digits: 10, placeholder: '98765 43210' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey', digits: 10, placeholder: '501 123 4567' },
  { code: '+61', flag: '🇦🇺', name: 'Australia', digits: 9, placeholder: '412 345 678' },
  { code: '+49', flag: '🇩🇪', name: 'Germany', digits: 11, placeholder: '151 12345678' },
  { code: '+33', flag: '🇫🇷', name: 'France', digits: 9, placeholder: '6 12 34 56 78' },
  { code: '+39', flag: '🇮🇹', name: 'Italy', digits: 10, placeholder: '312 345 6789' },
  { code: '+34', flag: '🇪🇸', name: 'Spain', digits: 9, placeholder: '612 345 678' },
  { code: '+86', flag: '🇨🇳', name: 'China', digits: 11, placeholder: '138 1234 5678' },
  { code: '+81', flag: '🇯🇵', name: 'Japan', digits: 10, placeholder: '90 1234 5678' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea', digits: 10, placeholder: '10 1234 5678' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia', digits: 9, placeholder: '12 345 6789' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore', digits: 8, placeholder: '8123 4567' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia', digits: 11, placeholder: '812 3456 7890' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh', digits: 10, placeholder: '1712 345678' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka', digits: 9, placeholder: '77 123 4567' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal', digits: 10, placeholder: '984 1234567' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt', digits: 10, placeholder: '100 123 4567' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa', digits: 9, placeholder: '82 123 4567' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria', digits: 10, placeholder: '803 123 4567' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil', digits: 11, placeholder: '11 91234 5678' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico', digits: 10, placeholder: '55 1234 5678' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina', digits: 10, placeholder: '9 11 1234 5678' },
  { code: '+7', flag: '🇷🇺', name: 'Russia', digits: 10, placeholder: '912 345 6789' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands', digits: 9, placeholder: '6 12345678' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden', digits: 9, placeholder: '70 123 4567' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland', digits: 9, placeholder: '79 123 45 67' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar', digits: 8, placeholder: '3312 3456' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait', digits: 8, placeholder: '9123 4567' },
  { code: '+968', flag: '🇴🇲', name: 'Oman', digits: 8, placeholder: '9123 4567' },
];

export default function NewChatModal({ isOpen, onClose, onSelectUser }) {
  const [tab, setTab] = useState('contact');

  // Selected Country Object
  const [selectedCountry, setSelectedCountry] = useState(WORLD_COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [addingContact, setAddingContact] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');

  // Group Form State
  const [groupName, setGroupName] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupError, setGroupError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTab('contact');
      setSelectedCountry(WORLD_COUNTRIES[0]);
      setShowCountryDropdown(false);
      setCountrySearch('');
      setContactName('');
      setPhoneNumber('');
      setContactNote('');
      setContactError('');
      setContactSuccess('');
      setGroupName('');
      setSelectedUsers([]);
      setGroupError('');
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
    };
    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/all');
      setAllUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const maxLen = selectedCountry.digits;
    const sliced = rawVal.slice(0, maxLen);
    setPhoneNumber(sliced);
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');

    if (!phoneNumber) {
      setContactError(
        `Please enter a valid ${selectedCountry.digits}-digit phone number for ${selectedCountry.name}`
      );
      return;
    }

    setAddingContact(true);

    try {
      const fullPhone = `${selectedCountry.code}${phoneNumber}`;
      // Persist contact into MongoDB via backend API
      await api.post('/users/contacts', {
        name: contactName,
        phone: fullPhone,
        note: contactNote,
      });

      setContactSuccess(`Contact "${contactName}" (${fullPhone}) saved successfully!`);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error('Failed to save contact:', err);
      setContactError('Failed to save contact.');
    } finally {
      setAddingContact(false);
    }
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    setGroupError('');

    if (!groupName.trim()) {
      setGroupError('Please enter a group name');
      return;
    }
    if (selectedUsers.length < 1) {
      setGroupError('Select at least 1 member for the group');
      return;
    }

    setCreatingGroup(true);
    try {
      const res = await api.post('/chats/group', {
        name: groupName,
        users: JSON.stringify(selectedUsers),
      });
      onSelectUser(res.data._id);
      onClose();
    } catch (err) {
      setGroupError(err.response?.data?.message || 'Failed to create group chat');
    } finally {
      setCreatingGroup(false);
    }
  };

  const filteredCountries = WORLD_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch) ||
      c.flag.includes(countrySearch)
  );

  const filteredGroupUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(groupSearch.toLowerCase())
  );

  if (!isOpen) return null;

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
          maxWidth: '460px',
          borderRadius: '28px',
          padding: '28px',
          backgroundColor: 'var(--bg-panel)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-color)',
          position: 'relative',
        }}
      >
        {/* Absolute Top-Right Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
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
        <div style={{ marginBottom: '22px' }}>
          <h2
            className="brand-font"
            style={{
              fontSize: '1.75rem',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            New Chat
          </h2>
        </div>

        {/* ── 2 Main Choice Tabs: New Contact | New Group ── */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '20px',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('contact')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '16px',
              backgroundColor:
                tab === 'contact' ? 'var(--accent-coral)' : 'transparent',
              color: tab === 'contact' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.22s ease',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <UserPlus size={18} /> New Contact
          </button>

          <button
            type="button"
            onClick={() => setTab('group')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '16px',
              backgroundColor:
                tab === 'group' ? 'var(--accent-teal)' : 'transparent',
              color: tab === 'group' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.22s ease',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Users size={18} /> New Group
          </button>
        </div>

        {/* ── TAB 1: NEW CONTACT FORM ── */}
        {tab === 'contact' && (
          <form
            onSubmit={handleAddContactSubmit}
            className="fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {contactError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  borderRadius: '14px',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  textAlign: 'center',
                }}
              >
                {contactError}
              </div>
            )}

            {contactSuccess && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #6EE7B7',
                  color: '#065F46',
                  borderRadius: '14px',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Check size={16} /> {contactSuccess}
              </div>
            )}

            {/* Contact Name Input */}
            <div>
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Contact Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  style={{
                    paddingLeft: '46px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-main)',
                  }}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Phone Number Input with Searchable Country Picker */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  Phone Number *
                </label>
                <span
                  style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {phoneNumber.length} / {selectedCountry.digits} digits
                </span>
              </div>

              <div
                style={{ display: 'flex', gap: '8px', position: 'relative' }}
                ref={dropdownRef}
              >
                {/* Searchable Country Trigger Box */}
                <div
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  style={{
                    width: '124px',
                    padding: '12px 10px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </div>

                {/* Country Search Dropdown Popup */}
                {showCountryDropdown && (
                  <div
                    className="slide-in-up"
                    style={{
                      position: 'absolute',
                      top: '52px',
                      left: 0,
                      width: '280px',
                      maxHeight: '260px',
                      backgroundColor: 'var(--bg-panel)',
                      borderRadius: '20px',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                      border: '1px solid var(--border-color)',
                      zIndex: 50,
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {/* Alphabet Search Box */}
                    <div style={{ position: 'relative' }}>
                      <Search
                        size={14}
                        style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Type country name..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px 6px 30px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-main)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          outline: 'none',
                        }}
                        autoFocus
                      />
                    </div>

                    {/* Countries List */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      {filteredCountries.length === 0 ? (
                        <div
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          No country found
                        </div>
                      ) : (
                        filteredCountries.map((c, i) => (
                          <div
                            key={`${c.code}-${i}`}
                            onClick={() => {
                              setSelectedCountry(c);
                              setShowCountryDropdown(false);
                              setCountrySearch('');
                              setPhoneNumber((prev) => prev.slice(0, c.digits));
                            }}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              backgroundColor:
                                selectedCountry.code === c.code &&
                                selectedCountry.name === c.name
                                  ? 'var(--accent-coral-light)'
                                  : 'transparent',
                              transition: 'backgroundColor 0.15s ease',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                'var(--bg-main)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                selectedCountry.code === c.code &&
                                selectedCountry.name === c.name
                                  ? 'var(--accent-coral-light)'
                                  : 'transparent')
                            }
                          >
                            <span
                              style={{
                                fontSize: '0.84rem',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span>{c.flag}</span>
                              <span>{c.name}</span>
                            </span>
                            <span
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                fontWeight: 700,
                              }}
                            >
                              {c.code}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Phone Input with Dynamic MaxLength */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <Phone
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="tel"
                    className="input-field"
                    placeholder={selectedCountry.placeholder}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength={selectedCountry.digits}
                    style={{
                      paddingLeft: '46px',
                      borderRadius: '20px',
                      backgroundColor: 'var(--bg-main)',
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Note / Bio / Category */}
            <div>
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Note / Category{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                  (Optional)
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <FileText
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Work friend, Family, Client"
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  style={{
                    paddingLeft: '46px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-main)',
                  }}
                />
              </div>
            </div>

            {/* Save Button Only */}
            <button
              type="submit"
              disabled={addingContact}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '22px',
                fontSize: '0.96rem',
                marginTop: '6px',
              }}
            >
              {addingContact ? (
                <span
                  style={{
                    display: 'inline-flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <Loader2 size={18} className="spin-loader" /> Saving Contact...
                </span>
              ) : (
                'Save Contact'
              )}
            </button>
          </form>
        )}

        {/* ── TAB 2: NEW GROUP FORM ── */}
        {tab === 'group' && (
          <form
            onSubmit={handleCreateGroupSubmit}
            className="fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {groupError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  borderRadius: '14px',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  textAlign: 'center',
                }}
              >
                {groupError}
              </div>
            )}

            {/* Group Name Input */}
            <div>
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Group Name
              </label>
              <div style={{ position: 'relative' }}>
                <Users
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--accent-teal)',
                  }}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Design Team, Friends"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={{
                    paddingLeft: '46px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-main)',
                  }}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Member Search */}
            <div>
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Select Members ({selectedUsers.length} selected)
              </label>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
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
                  placeholder="Search members..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  style={{
                    paddingLeft: '38px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-main)',
                    fontSize: '0.84rem',
                  }}
                />
              </div>

              {/* Members Select List */}
              <div
                style={{
                  maxHeight: '170px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingRight: '4px',
                }}
              >
                {filteredGroupUsers.map((u) => {
                  const isSelected = selectedUsers.includes(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => toggleSelectUser(u._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '16px',
                        backgroundColor: isSelected
                          ? 'var(--accent-teal-light)'
                          : 'var(--bg-main)',
                        border: isSelected
                          ? '1px solid var(--accent-teal)'
                          : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <img
                          src={
                            u.profilePic ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=3F8F82&color=fff`
                          }
                          alt={u.name}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <h4
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {u.name}
                          </h4>
                          <p
                            style={{
                              fontSize: '0.76rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {u.email}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: isSelected
                            ? 'none'
                            : '2px solid var(--border-color)',
                          backgroundColor: isSelected
                            ? 'var(--accent-teal)'
                            : 'transparent',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={creatingGroup}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '22px',
                fontSize: '0.96rem',
                marginTop: '6px',
                backgroundColor: 'var(--accent-teal)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(63, 143, 130, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {creatingGroup ? (
                <span
                  style={{
                    display: 'inline-flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <Loader2 size={18} className="spin-loader" /> Creating Group...
                </span>
              ) : (
                'Create Group Chat'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
