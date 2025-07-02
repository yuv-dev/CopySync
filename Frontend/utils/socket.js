// socket.js
"use client";
import { BACKEND_URL } from "@/configs/API_configs";
import { io } from "socket.io-client";
export const socket = io(BACKEND_URL); // Update with backend URL
