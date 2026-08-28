'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import StatusIndicator from './StatusIndicator';
import api from '../utils/api';

export default function ChatArea({ chat, socket }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const getRecipient = () => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find((p) => p._id !== user?._id) || chat.participants[0];
  };

  const recipient = getRecipient();

  // Scroll to bottom of message list
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Fetch chat message history & setup socket listeners
  useEffect(() => {
    if (!chat?._id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/${chat._id}`);
        setMessages(res.data);

        // Mark messages as read
        await api.put(`/messages/read/${chat._id}`);
        if (socket) {
          socket.emit('mark_as_read', { chatId: chat._id, userId: user._id });
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 100);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('join_chat', chat._id);

      const handleMessageReceived = (newMessage) => {
        if (newMessage.chatId?._id === chat._id || newMessage.chatId === chat._id) {
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();

          // Mark newly received message as read
          api.put(`/messages/read/${chat._id}`);
          socket.emit('mark_as_read', { chatId: chat._id, userId: user._id });
        }
      };

      const handleTyping = ({ room, user: typingUserData }) => {
        if (room === chat._id && typingUserData?._id !== user?._id) {
          setTypingUser(typingUserData.name);
        }
      };

      const handleStopTyping = ({ room }) => {
        if (room === chat._id) {
          setTypingUser(null);
        }
      };

      const handleMessagesRead = ({ chatId }) => {
        if (chatId === chat._id) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.sender._id === user._id) {
                return { ...msg, readBy: [...(msg.readBy || []), 'read'] };
              }
              return msg;
            })
          );
        }
      };

      socket.on('message_received', handleMessageReceived);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);
      socket.on('messages_read', handleMessagesRead);

      return () => {
        socket.emit('leave_chat', chat._id);
        socket.off('message_received', handleMessageReceived);
        socket.off('typing', handleTyping);
        socket.off('stop_typing', handleStopTyping);
        socket.off('messages_read', handleMessagesRead);
      };
    }
  }, [chat?._id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async ({ content, messageType }) => {
    try {
      const res = await api.post('/messages', {
        content,
        chatId: chat._id,
        messageType,
      });

      const sentMsg = res.data;
      setMessages((prev) => [...prev, sentMsg]);
      scrollToBottom();

      if (socket) {
        socket.emit('send_message', sentMsg);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTypingStart = () => {
    if (socket && chat?._id) {
      socket.emit('typing', { room: chat._id, user: { _id: user._id, name: user.name } });
    }
  };

  const handleTypingStop = () => {
    if (socket && chat?._id) {
      socket.emit('stop_typing', { room: chat._id, user: { _id: user._id, name: user.name } });
    }
  };

  if (!chat) {
    return (
      <div
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: 'var(--bg-main)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-coral-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-coral)',
          }}
        >
          <MessageSquare size={40} />
        </div>
        <h2 className="brand-font" style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
          Welcome to Chatify
        </h2>
        <p style={{ fontSize: '0.95rem', maxWidth: '340px', textAlign: 'center' }}>
          Select a conversation from the sidebar or click '+' to start a new chat with your contacts.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-main)',
      }}
    >
      {/* Active Chat Header */}
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={
              chat.isGroupChat
                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.chatName)}&background=3F8F82&color=fff`
                : recipient?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient?.name || 'U')}&background=E2725B&color=fff`
            }
            alt={recipient?.name}
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
          />

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {chat.isGroupChat ? chat.chatName : recipient?.name}
            </h3>
            {typingUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-coral)' }}>
                <span className="typing-dots">
                  <span></span><span></span><span></span>
                </span>
                <span>{typingUser} is typing...</span>
              </div>
            ) : !chat.isGroupChat && recipient ? (
              <StatusIndicator status={recipient.status} lastSeen={recipient.lastSeen} />
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {chat.participants?.length} members
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '6px' }}>
            <Phone size={19} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '6px' }}>
            <Video size={19} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '6px' }}>
            <MoreVertical size={19} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
            <p className="brand-font" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
              Say Hello! 👋
            </p>
            <p style={{ fontSize: '0.85rem' }}>Send a message to start this conversation.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSent = msg.sender?._id === user._id || msg.sender === user._id;
            return (
              <MessageBubble
                key={msg._id || index}
                message={msg}
                isSent={isSent}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTypingStart}
        onStopTyping={handleTypingStop}
      />
    </div>
  );
}
