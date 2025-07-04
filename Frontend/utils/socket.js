"use client";
import { BACKEND_URL } from "@/configs/API_configs";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000"); // Update with backend URL

module.exports = { socket };
