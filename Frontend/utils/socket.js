"use client";
import { BACKEND_URL } from "@/configs/API_configs";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

module.exports = { socket };
