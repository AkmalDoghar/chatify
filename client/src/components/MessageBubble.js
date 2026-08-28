'use client';

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isSent, isLastInGroup = true }) {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isRead = message.readBy && message.readBy.length > 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSent ? 'flex-end' : 'flex-start',
        marginBottom: isLastInGroup ? '12px' : '4px',
        maxWidth: '75%',
        alignSelf: isSent ? 'flex-end' : 'flex-start',
      }}
      className="fade-in"
    >
      <div
        className={isSent ? 'message-bubble-sent' : 'message-bubble-received'}
        style={{
          padding: '12px 16px',
          wordBreak: 'break-word',
          fontSize: '0.95rem',
          lineHeight: '1.45',
          position: 'relative',
        }}
      >
        {/* Image Attachment */}
        {message.messageType === 'image' && message.content && (
          <div style={{ marginBottom: message.content && !message.content.startsWith('http') ? '8px' : '0' }}>
            <img
              src={message.content}
              alt="Uploaded content"
              style={{
                maxWidth: '100%',
                maxHeight: '280px',
                borderRadius: '12px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Text Content */}
        {message.messageType !== 'image' && message.content && (
          <div>{message.content}</div>
        )}
        {message.messageType === 'image' && message.caption && (
          <div style={{ marginTop: '6px' }}>{message.caption}</div>
        )}

        {/* Message Meta Info (Time & Read Receipts) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '4px',
            marginTop: '4px',
            fontSize: '0.72rem',
            color: isSent ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-muted)',
          }}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isSent && (
            <span style={{ display: 'inline-flex', alignItems: 'center' }} title={isRead ? 'Seen' : 'Sent'}>
              {isRead ? (
                <CheckCheck size={14} color="#72F2DA" />
              ) : (
                <Check size={14} color="rgba(255, 255, 255, 0.85)" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
