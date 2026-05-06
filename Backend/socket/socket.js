import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

const app = express();
const httpServer = createServer(app);

// Store online users
const onlineUser = {}; // { userId: socketId }

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// get reciver socketId
export const getReciverSocketId = (reciverId) => {
  return onlineUser[reciverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    onlineUser[userId] = socket.id;
  }

  io.emit("getOnlineUser", Object.keys(onlineUser));

  // ✅ Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUser[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  // ✅ Stop typing
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUser[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  socket.on("disconnect", () => {
    delete onlineUser[userId];
    io.emit("getOnlineUser", Object.keys(onlineUser));
  });
});

export { app, httpServer };