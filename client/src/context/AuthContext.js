'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { initSocket } from '../utils/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('chatify_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Verify with backend
          const response = await api.get('/auth/me');
          const freshUser = { ...response.data, token: parsedUser.token };
          setUser(freshUser);
          localStorage.setItem('chatify_user', JSON.stringify(freshUser));

          // Setup socket connection
          const socketInstance = initSocket();
          socketInstance.connect();
          socketInstance.emit('setup', freshUser);
          setSocket(socketInstance);
        } catch (error) {
          console.error('Session verification failed:', error);
          localStorage.removeItem('chatify_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('chatify_user', JSON.stringify(userData));

    // Connect socket
    const socketInstance = initSocket();
    socketInstance.connect();
    socketInstance.emit('setup', userData);
    setSocket(socketInstance);

    return userData;
  };

  const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('chatify_user', JSON.stringify(userData));

    // Connect socket
    const socketInstance = initSocket();
    socketInstance.connect();
    socketInstance.emit('setup', userData);
    setSocket(socketInstance);

    return userData;
  };

  const logout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem('chatify_user');
    setUser(null);
    setSocket(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem('chatify_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        socket,
        loading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
