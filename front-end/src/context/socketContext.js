import { createContext } from 'react';
import socketio from 'socket.io-client';

const url = '' || 'http://localhost:8888';
export const socket = socketio.connect(url);
export const SocketContext = createContext();
