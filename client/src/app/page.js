'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/ChatList';
import ChatArea from '../components/ChatArea';
import UserProfileModal from '../components/UserProfileModal';
import NewChatModal from '../components/NewChatModal';
import api from '../utils/api';

export default function MainPage() {
  const { user, socket, loading } = useAuth();
  const router = useRouter();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [fetchingChats, setFetchingChats] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/chats');
      setChats(res.data);
    } catch (err) {
      console.error('Failed to fetch user chats:', err);
    } finally {
      setFetchingChats(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Listen to socket events for user status updates and incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleStatusChanged = ({ userId, status, lastSeen }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          const updatedParticipants = chat.participants.map((p) => {
            if (p._id === userId) {
              return { ...p, status, lastSeen: lastSeen || p.lastSeen };
            }
            return p;
          });
          return { ...chat, participants: updatedParticipants };
        })
      );

      setActiveChat((prevActive) => {
        if (!prevActive) return null;
        const updatedParticipants = prevActive.participants.map((p) => {
          if (p._id === userId) {
            return { ...p, status, lastSeen: lastSeen || p.lastSeen };
          }
          return p;
        });
        return { ...prevActive, participants: updatedParticipants };
      });
    };

    const handleMessageReceived = (newMessage) => {
      // Re-fetch or update chat list so lastMessage & unread count update dynamically
      fetchChats();
    };

    socket.on('user_status_changed', handleStatusChanged);
    socket.on('message_received', handleMessageReceived);

    return () => {
      socket.off('user_status_changed', handleStatusChanged);
      socket.off('message_received', handleMessageReceived);
    };
  }, [socket, fetchChats]);

  // Handle selecting or creating a chat
  const handleSelectUserToChat = async (targetUserId) => {
    try {
      const res = await api.post('/chats', { userId: targetUserId });
      const targetChat = res.data;

      // Add to chats list if not already present
      setChats((prev) => {
        const exists = prev.some((c) => c._id === targetChat._id);
        return exists ? prev : [targetChat, ...prev];
      });

      setActiveChat(targetChat);
    } catch (err) {
      console.error('Failed to access or create chat:', err);
    }
  };

  if (loading || (!user && fetchingChats)) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--bg-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          color: 'var(--accent-coral)',
          fontStyle: 'italic',
        }}
      >
        Loading Chatify...
      </div>
    );
  }

  return (
    <main style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar Chat List */}
      <ChatList
        chats={chats}
        activeChat={activeChat}
        onSelectChat={(chat) => {
          setActiveChat(chat);
          // Clear unread count locally when chat is clicked
          setChats((prev) =>
            prev.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c))
          );
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNewChat={() => setIsNewChatOpen(true)}
      />

      {/* Main Chat Conversation Window */}
      <ChatArea chat={activeChat} socket={socket} />

      {/* Modals */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleSelectUserToChat}
      />
    </main>
  );
}
