import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./database/db.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoute from "./routes/messageRoutes.js";
import userRoute from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, httpServer } from "./socket/socket.js";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://chat-app-phi-five-19.vercel.app",
    credentials: true,
  }),
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/user", userRoute);

app.get("/", (req, res) => {
  res.send("Server Working ✅");
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Running on http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
});
