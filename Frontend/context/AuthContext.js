"use client";
import { createContext, useState, useEffect } from "react";
import axios from "../utils/api";
import { LOGIN_API_URI, CLIPBOARD_API_URI } from "@/configs/API_configs";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (credential) => {
    try {
      const res = await axios.post(LOGIN_API_URI, { credential });
      // Step: redirect to Google Drive consent screen
      if (res.data.authUrl) {
        window.location.href = res.data.authUrl;
      }

      setUser(res.data.user);

      localStorage.setItem("clipSync-user", JSON.stringify(res.data.user));
      localStorage.setItem("clipSync-token", JSON.stringify(res.data.token));
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    console.log("Logout");
    setUser(null);
    localStorage.removeItem("clipSync-user");
    localStorage.removeItem("clipSync-token");
    localStorage.removeItem("clipboardHistory");
    localStorage.removeItem("lastClipboard");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("clipSync-user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
