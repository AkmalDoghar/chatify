'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, CheckCheck, Play, Pause, Mic, Trash2, Copy, Forward, Star, Info } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

// ─────────────────────────────────────────────
// Main MessageBubble
// ─────────────────────────────────────────────
export default function MessageBubble({ message, isSent, isLastInGroup = true, onDelete, onReact }) {
  const { user } = useAuth();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);

  const formatTime = (dateStr) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isRead = message.readBy && message.readBy.length > 1;
  const isDeleted = message.messageType === 'deleted';

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowContextMenu(false);
        setShowEmojiPicker(false);
      }
    };
    if (showContextMenu || showEmojiPicker) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [showContextMenu, showEmojiPicker]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 280);
    setMenuPos({ x, y });
    setShowContextMenu(true);
    setShowEmojiPicker(false);
  };

  const handleCopy = () => {
    if (message.content) navigator.clipboard.writeText(message.content);
    setShowContextMenu(false);
  };

  const handleDelete = async () => {
    setShowContextMenu(false);
    try {
      await api.put(`/messages/delete/${message._id}`);
      if (onDelete) onDelete(message._id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleReact = async (emoji) => {
    setShowContextMenu(false);
    setShowEmojiPicker(false);
    try {
      const res = await api.put(`/messages/reaction/${message._id}`, { emoji });
      if (onReact) onReact(message._id, res.data.reactions);
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  // Group reactions by emoji
  const groupedReactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || []);
    acc[r.emoji].push(r.userName || 'Someone');
    return acc;
  }, {});

  return (
    <>
      <div
        ref={wrapRef}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isSent ? 'flex-end' : 'flex-start',
          marginBottom: isLastInGroup ? '16px' : '4px',
          maxWidth: '75%',
          alignSelf: isSent ? 'flex-end' : 'flex-start',
          position: 'relative',
        }}
        className="fade-in"
      >
        {/* Quick emoji reaction bar — shown on hover, below the bubble */}
        {!isDeleted && hovered && (
          <div style={{
            position: 'absolute',
            bottom: '-24px',
            [isSent ? 'right' : 'left']: 0,
            display: 'flex',
            gap: '4px',
            zIndex: 10,
            animation: 'fadeIn 0.18s ease',
          }}>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                  backgroundColor: 'var(--bg-panel)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                  cursor: 'pointer', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={isDeleted ? '' : isSent ? 'message-bubble-sent' : 'message-bubble-received'}
          style={{
            padding: message.messageType === 'voice' ? '0' : isDeleted ? '10px 16px' : '12px 16px',
            wordBreak: 'break-word',
            fontSize: '0.95rem',
            lineHeight: '1.45',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'context-menu',
            ...(isDeleted ? {
              backgroundColor: 'transparent',
              border: '1.5px dashed var(--border-color)',
              borderRadius: '16px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            } : message.messageType === 'voice' ? {
              background: isSent
                ? 'linear-gradient(135deg, #54c250 0%, #3F8F82 100%)'
                : 'var(--bg-panel)',
              border: isSent ? 'none' : '1px solid var(--border-color)',
              borderRadius: isSent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              boxShadow: isSent ? '0 4px 14px rgba(84,194,80,0.22)' : 'var(--shadow-sm)',
            } : {}),
          }}
        >
          {/* Deleted state */}
          {isDeleted && (
            <span style={{ fontSize: '0.88rem' }}>🚫 This message was deleted</span>
          )}

          {/* IMAGE */}
          {!isDeleted && message.messageType === 'image' && message.content && (
            <div>
              <img
                src={message.content}
                alt="Uploaded"
                style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '12px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* TEXT */}
          {!isDeleted && message.messageType !== 'image' && message.messageType !== 'voice' && message.content && (
            <div>{message.content}</div>
          )}

          {/* VOICE */}
          {!isDeleted && message.messageType === 'voice' && message.content && (
            <VoicePlayer audioUrl={message.content} isSent={isSent} />
          )}

          {/* Timestamp + read receipt */}
          {!isDeleted && message.messageType !== 'voice' && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              gap: '4px', marginTop: '6px', fontSize: '0.72rem',
              color: isSent ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
            }}>
              <span>{formatTime(message.createdAt)}</span>
              {isSent && (
                <span title={isRead ? 'Seen' : 'Sent'}>
                  {isRead ? <CheckCheck size={14} color="#72F2DA" /> : <Check size={14} color="rgba(255,255,255,0.75)" />}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reactions row */}
        {Object.keys(groupedReactions).length > 0 && (
          <div style={{
            display: 'flex', gap: '4px', flexWrap: 'wrap',
            marginTop: '4px',
            justifyContent: isSent ? 'flex-end' : 'flex-start',
          }}>
            {Object.entries(groupedReactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                title={users.join(', ')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '3px',
                  padding: '2px 8px', borderRadius: '12px', border: 'none',
                  backgroundColor: 'var(--bg-panel)',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  color: 'var(--text-primary)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span>{emoji}</span>
                {users.length > 1 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{users.length}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Context Menu (Portal-like fixed position) ── */}
      {showContextMenu && (
        <div ref={menuRef}>
          <ContextMenu
            x={menuPos.x}
            y={menuPos.y}
            isSent={isSent}
            isDeleted={isDeleted}
            messageType={message.messageType}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onReact={(emoji) => handleReact(emoji)}
            onClose={() => setShowContextMenu(false)}
          />
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Context Menu
// ─────────────────────────────────────────────
function ContextMenu({ x, y, isSent, isDeleted, messageType, onCopy, onDelete, onReact, onClose }) {
  const [showEmojiRow, setShowEmojiRow] = useState(false);

  const menuItems = [
    ...(showEmojiRow ? [] : [
      {
        icon: '😊',
        label: 'React',
        action: () => setShowEmojiRow(true),
        color: 'var(--text-primary)',
      },
    ]),
    ...(messageType === 'text' && !isDeleted ? [{
      icon: <Copy size={15} />,
      label: 'Copy Text',
      action: onCopy,
      color: 'var(--text-primary)',
    }] : []),
    {
      icon: <Star size={15} />,
      label: 'Star Message',
      action: onClose,
      color: '#F59E0B',
    },
    {
      icon: <Forward size={15} />,
      label: 'Forward',
      action: onClose,
      color: 'var(--accent-teal)',
    },
    {
      icon: <Info size={15} />,
      label: 'Message Info',
      action: onClose,
      color: '#8B5CF6',
    },
    ...(isSent && !isDeleted ? [{
      icon: <Trash2 size={15} />,
      label: 'Delete',
      action: onDelete,
      color: '#EF4444',
      danger: true,
    }] : []),
  ];

  return (
    <div style={{
      position: 'fixed',
      top: y,
      left: x,
      zIndex: 9999,
      backgroundColor: 'var(--bg-panel)',
      borderRadius: '18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      border: '1px solid var(--border-color)',
      padding: '8px',
      minWidth: '190px',
      animation: 'slideInUp 0.18s ease',
    }}>
      {/* Emoji row */}
      {showEmojiRow ? (
        <div style={{ padding: '8px 4px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', paddingLeft: '6px' }}>
            React with
          </p>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            {QUICK_EMOJIS.map((emoji) => (
              <button key={emoji} onClick={() => onReact(emoji)} style={{
                width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                background: 'var(--bg-main)', cursor: 'pointer', fontSize: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.15s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button onClick={() => setShowEmojiRow(false)} style={{
            marginTop: '8px', width: '100%', border: 'none', background: 'none',
            fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer',
          }}>
            ← Back
          </button>
        </div>
      ) : (
        menuItems.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            style={{
              width: '100%', padding: '10px 14px', border: 'none', background: 'none',
              textAlign: 'left', borderRadius: '12px',
              fontSize: '0.88rem', fontWeight: 600,
              color: item.danger ? '#EF4444' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = item.danger ? '#FEF2F2' : 'var(--bg-main)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
              {typeof item.icon === 'string' ? <span style={{ fontSize: '16px' }}>{item.icon}</span> : item.icon}
            </span>
            {item.label}
          </button>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Voice Player — with duration fix
// ─────────────────────────────────────────────
function VoicePlayer({ audioUrl, isSent }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const getDuration = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        setIsLoaded(true);
      } else {
        // Chromium blob duration fix: seek to end then back
        audio.currentTime = 1e10;
      }
    };

    const onTimeUpdate = () => {
      if (!isFinite(audio.duration)) return;
      setDuration(audio.duration);
      // Reset to start after the seeking trick
      audio.currentTime = 0;
      audio.removeEventListener('timeupdate', onTimeUpdate);
      setIsLoaded(true);
    };

    audio.addEventListener('loadedmetadata', getDuration);
    audio.addEventListener('timeupdate', onTimeUpdate);

    const tick = () => {
      setCurrentTime(audio.currentTime);
      if (!audio.paused) animFrameRef.current = requestAnimationFrame(tick);
    };
    audio.onplay = () => { animFrameRef.current = requestAnimationFrame(tick); };
    audio.onended = () => {
      cancelAnimationFrame(animFrameRef.current);
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.onpause = () => cancelAnimationFrame(animFrameRef.current);

    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.pause();
      cancelAnimationFrame(animFrameRef.current);
      audio.removeEventListener('loadedmetadata', getDuration);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setCurrentTime(audio.currentTime);
  };

  const formatDur = (s) => {
    if (!s || !isFinite(s) || s <= 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const BAR_COUNT = 28;
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const seed = (audioUrl.charCodeAt(i % audioUrl.length) + i * 17) % 100;
    return Math.max(15, Math.min(85, seed));
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px', minWidth: '240px', maxWidth: '320px',
    }}>
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        style={{
          width: '44px', height: '44px', borderRadius: '50%', border: 'none',
          flexShrink: 0, cursor: isLoaded ? 'pointer' : 'wait',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isSent ? 'rgba(255,255,255,0.22)' : 'linear-gradient(135deg,#54c250,#3F8F82)',
          color: '#fff',
          boxShadow: isSent ? '0 2px 8px rgba(0,0,0,0.15)' : '0 4px 14px rgba(84,194,80,0.4)',
          opacity: isLoaded ? 1 : 0.55,
          transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => isLoaded && (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" style={{ marginLeft: '2px' }} />}
      </button>

      {/* Waveform + time */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div onClick={handleSeek} style={{
          height: '36px', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer',
        }}>
          {bars.map((h, i) => {
            const played = (i / BAR_COUNT) * 100 <= progress;
            return (
              <div key={i} style={{
                flex: 1, height: `${h}%`, borderRadius: '3px',
                backgroundColor: played
                  ? isSent ? 'rgba(255,255,255,0.95)' : '#54c250'
                  : isSent ? 'rgba(255,255,255,0.3)' : 'rgba(84,194,80,0.25)',
                transition: 'background-color 0.12s, transform 0.1s',
                transform: isPlaying && played ? 'scaleY(1.1)' : 'scaleY(1)',
              }} />
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600,
            color: isSent ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
          }}>
            <Mic size={10} /> Voice
          </span>
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace',
            color: isSent ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)',
          }}>
            {isLoaded ? `${formatDur(currentTime)} / ${formatDur(duration)}` : 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
}
