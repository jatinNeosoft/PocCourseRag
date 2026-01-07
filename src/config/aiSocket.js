import { io } from "socket.io-client";

let socket = null;

export function connectAiSocket({ token, onToken, onDone, onError }) {
  if (socket) return socket; // singleton
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    auth: {
      token:`Bearer ${token}`,
    },
  });

  socket.on("connected", () => {
    console.log("✅ AI socket connected");
  });

  socket.on("ai:token", (token) => {
    onToken?.(token);
  });

  socket.on("ai:done", () => {
     console.log("response completedddddddddddddddd");
     
    onDone?.();
  });

  socket.on("ai:error", (err) => {
    onError?.(err);
  });

  socket.on("disconnect", () => {
    console.log("❌ AI socket disconnected");
  });

  return socket;
}

export function sendAiMessage(payload) {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  socket.emit("ai:ask", payload);
}

export function stopAiMessage() {
  if (!socket) return;
  socket.emit("ai:stop");
}
