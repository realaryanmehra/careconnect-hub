import { io } from 'socket.io-client';

// Use the backend URL (default is http://localhost:5000)
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true
});

socket.on('connect', () => {
  console.log('✅ Connected to real-time server');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from real-time server');
});
