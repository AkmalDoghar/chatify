"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import SidebarNav from "../components/SidebarNav";
import ChatList from "../components/ChatList";
import GroupsView from "../components/GroupsView";
import CallsView from "../components/CallsView";
import StatusView from "../components/StatusView";
import SettingsView from "../components/SettingsView";
import ChatArea from "../components/ChatArea";
import UserProfileModal from "../components/UserProfileModal";
import NewChatModal from "../components/NewChatModal";
import SavedContactsModal from "../components/SavedContactsModal";
import api from "../utils/api";

export default function MainPage() {
  const { user, socket, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("chats"); // 'chats' | 'groups' | 'calls' | 'status' | 'settings'
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [fetchingChats, setFetchingChats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/chats");
      setChats(res.data);
    } catch (err) {
      console.error("Failed to fetch user chats:", err);
    } finally {
      setFetchingChats(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

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
        }),
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

    const handleMessageReceived = () => {
      fetchChats();
    };

    socket.on("user_status_changed", handleStatusChanged);
    socket.on("message_received", handleMessageReceived);

    return () => {
      socket.off("user_status_changed", handleStatusChanged);
      socket.off("message_received", handleMessageReceived);
    };
  }, [socket, fetchChats]);

  const handleSelectUserToChat = async (target) => {
    try {
      let targetChat = null;

      if (typeof target === "object" && target !== null) {
        if (target.isGroupChat || target.participants) {
          targetChat = target;
        } else if (target.userId) {
          target = target.userId;
        } else {
          // Virtual chat for custom saved contact
          targetChat = {
            _id: `contact_${target._id || Date.now()}`,
            isGroupChat: false,
            participants: [
              user,
              {
                _id: `user_${target._id || Date.now()}`,
                name: target.name,
                profilePic: target.profilePic || "",
                status: "offline",
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        }
      }

      if (!targetChat && typeof target === "string") {
        // First check if chat with user already exists in current chats state
        const existingChat = chats.find(
          (c) => !c.isGroupChat && c.participants?.some((p) => p._id === target)
        );

        if (existingChat) {
          targetChat = existingChat;
        } else {
          const res = await api.post("/chats", { userId: target });
          targetChat = res.data;
        }
      }

      if (targetChat) {
        setChats((prev) => {
          const exists = prev.some((c) => c._id === targetChat._id);
          return exists ? prev : [targetChat, ...prev];
        });
        setActiveChat(targetChat);
        setActiveTab("chats");
      }
    } catch (err) {
      console.error("Failed to access or create chat:", err);
    }
  };

  const totalUnreadCount = chats.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0,
  );

  if (loading || (!user && fetchingChats)) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "var(--bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-serif)",
          fontSize: "1.5rem",
          color: "var(--accent-coral)",
          fontStyle: "italic",
        }}
      >
        Loading Chatify...
      </div>
    );
  }

  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Primary Vertical / Mobile Bottom Navigation Rail */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        unreadCount={totalUnreadCount}
      />

      {/* Secondary Panel depending on active tab */}
      {activeTab === "chats" && (
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onSelectChat={(chat) => {
            setActiveChat(chat);
            setChats((prev) =>
              prev.map((c) =>
                c._id === chat._id ? { ...c, unreadCount: 0 } : c,
              ),
            );
          }}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenContacts={() => setIsContactsOpen(true)}
        />
      )}

      {activeTab === "groups" && (
        <GroupsView
          chats={chats}
          activeChat={activeChat}
          onSelectChat={(chat) => {
            setActiveChat(chat);
            setActiveTab("chats");
          }}
          onOpenNewChat={() => setIsNewChatOpen(true)}
        />
      )}

      {activeTab === "status" && (
        <StatusView
          chats={chats}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {activeTab === "calls" && (
        <CallsView chats={chats} onOpenNewChat={() => setIsNewChatOpen(true)} />
      )}

      {activeTab === "settings" && (
        <SettingsView onOpenProfile={() => setIsProfileOpen(true)} />
      )}

      {/* Active Conversation Main Area */}
      <ChatArea
        chat={activeChat}
        socket={socket}
        onBack={() => setActiveChat(null)}
      />

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleSelectUserToChat}
      />
      <SavedContactsModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
        onSelectUser={handleSelectUserToChat}
      />
    </main>
  );
}
