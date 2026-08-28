import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const socketUrl = typeof window !== 'undefined'
      ? `http://${window.location.hostname}:5000`
      : (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    socket = io(socketUrl, {
      autoConnect: false,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const getSocket = () => socket;
