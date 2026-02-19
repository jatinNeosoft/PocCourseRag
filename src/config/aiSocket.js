// config/aiSocket.js
import { io } from 'socket.io-client';

let socket = null;

export function connectAiSocket({
  token,
  onToken,
  onDone,
  onUserTranscript,
  onAudioChunk,
  onAudioComplete,
  onError,
}) {
  if (socket?.connected) {
    console.log('✅ Socket already connected');
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  // Text chat events
  socket.on('ai:token', onToken);
  socket.on('ai:done', onDone);

  // Audio chat events
  socket.on('ai:user_transcript', ({ text }) => {
    onUserTranscript?.(text);
  });

  socket.on('ai:audio_chunk', (data) => {
    onAudioChunk?.(data);
  });

  socket.on('ai:audio_complete', () => {
    console.log("🎬 Audio stream complete");
    console.log(onAudioComplete,"onAudioComplete");
    
    onAudioComplete?.();
  });

  socket.on('ai:error', ({ message }) => {
    onError?.(message);
  });

  return socket;
}

export function sendAiMessage({ courseId, question }) {
  if (!socket?.connected) {
    console.error('❌ Socket not connected');
    return;
  }

  socket.emit('ai:ask', { courseId, question });
}

export function sendAudioChunk(base64Audio) {
  if (!socket?.connected) {
    console.error('❌ Socket not connected');
    return;
  }

  socket.emit('ai:audio_chunk', { audio: base64Audio });
}

export function endAudioStream(courseId) {
  if (!socket?.connected) {
    console.error('❌ Socket not connected');
    return;
  }

  socket.emit('ai:audio_end', { courseId });
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}