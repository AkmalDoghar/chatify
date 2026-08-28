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
          const response = await api.get('/auth/me');
          const freshUser = { ...response.data, token: parsedUser.token };
          setUser(freshUser);
          localStorage.setItem('chatify_user', JSON.stringify(freshUser));
          const socketInstance = initSocket();
          socketInstance.connect();
          socketInstance.emit('setup', freshUser);
          setSocket(socketInstance);
        } catch (error) {
          localStorage.removeItem('chatify_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const _connectSocket = (userData) => {
    const socketInstance = initSocket();
    socketInstance.connect();
    socketInstance.emit('setup', userData);
    setSocket(socketInstance);
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('chatify_user', JSON.stringify(userData));
    _connectSocket(userData);
    return userData;
  };

  // Step 1: Send OTP for signup
  const sendSignupOTP = async (name, email, password) => {
    const response = await api.post('/auth/signup/send-otp', { name, email, password });
    return response.data;
  };

  // Step 2: Verify OTP and create account (Redirects to login afterwards)
  const verifySignupOTP = async (email, otp) => {
    const response = await api.post('/auth/signup/verify-otp', { email, otp });
    return response.data;
  };

  // Step 1: Send OTP for password reset
  const sendResetOTP = async (email) => {
    const response = await api.post('/auth/reset/send-otp', { email });
    return response.data;
  };

  // Step 2: Verify OTP and set new password
  const verifyResetOTP = async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset/verify-otp', { email, otp, newPassword });
    return response.data;
  };

  const logout = () => {
    if (socket) socket.disconnect();
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
    <AuthContext.Provider value={{ user, socket, loading, login, sendSignupOTP, verifySignupOTP, sendResetOTP, verifyResetOTP, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
