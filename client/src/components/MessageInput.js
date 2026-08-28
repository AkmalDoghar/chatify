'use client';

import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function MessageInput({ onSendMessage, onTyping, onStopTyping }) {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      if (onTyping) onTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (onStopTyping) onStopTyping();
    }, 2000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !selectedImage) || uploading) return;

    if (isTyping) {
      setIsTyping(false);
      if (onStopTyping) onStopTyping();
    }

    let messageType = 'text';
    let messageContent = text.trim();

    if (selectedImage) {
      setUploading(true);
      try {
        const response = await api.post('/upload', { image: selectedImage });
        messageContent = response.data.url;
        messageType = 'image';
      } catch (err) {
        console.error('Failed to upload image:', err);
        messageContent = selectedImage;
        messageType = 'image';
      } finally {
        setUploading(false);
      }
    }

    onSendMessage({
      content: messageContent,
      messageType: messageType,
    });

    setText('');
    setSelectedImage(null);
  };

  return (
    <div
      style={{
        padding: '16px 24px',
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      {selectedImage && (
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '10px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid var(--accent-coral)',
          }}
        >
          <img src={selectedImage} alt="Preview" style={{ height: '70px', borderRadius: '10px', display: 'block' }} />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Attach Image"
        >
          <ImageIcon size={20} />
        </button>

        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          className="input-field"
          style={{
            flex: 1,
            borderRadius: '24px',
            padding: '12px 20px',
            backgroundColor: 'var(--bg-main)',
            border: '1.5px solid var(--border-color)',
          }}
        />

        <button
          type="submit"
          disabled={uploading || (!text.trim() && !selectedImage)}
          className="btn-primary"
          style={{
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            padding: 0,
            opacity: (!text.trim() && !selectedImage) || uploading ? 0.5 : 1,
            cursor: (!text.trim() && !selectedImage) || uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
