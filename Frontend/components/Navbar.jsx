"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { FaUserAstronaut, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const activeUser = useRef(user);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const logoutClick = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="w-full bg-amber-300 shadow-md text-black z-50">
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <div className="flex items-center">
          <Link href={"/dashboard"}>
            <span className="text-xl font-bold">
              Clipboard<span className="text-2xl text-white">Sync</span>
            </span>
          </Link>
        </div>

        {/* Menu Links */}
        <div className="hidden sm:flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 font-medium hover:bg-amber-400 rounded"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/device-manager"
            className="px-4 py-2 font-medium hover:bg-amber-400 rounded"
          >
            Device Manager
          </Link>
        </div>

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center gap-2">
            <FaUserAstronaut className="text-xl" />

            <span className="hidden sm:inline font-medium">{user.name}</span>
            <button
              onClick={logoutClick}
              className="flex items-center gap-1 px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold hidden sm:block">Guest</span>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Sign In
            </button>
          </div>
        )}
        {/* Hamburger menu (mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="ml-4  sm:hidden text-2xl focus:outline-none"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Second Row: Menu Links */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden sm:flex sm:flex-row sm:items-center sm:justify-center ${
          menuOpen ? "max-h-40 pb-3 px-4" : "max-h-0"
        }`}
      >
        <Link
          href="/dashboard"
          className="block sm:inline-block px-4 py-2 font-medium hover:bg-amber-400 rounded"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/device-manager"
          className="block sm:inline-block px-4 py-2 font-medium hover:bg-amber-400 rounded"
        >
          Device Manager
        </Link>
      </div>
    </nav>
  );
}
