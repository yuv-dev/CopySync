"use client";
import Image from "next/image";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  const router = useRouter();
  const logoutClick = async () => {
    try {
      await logout();
      router.push("/");

      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 text-black bg-amber-300 shadow-amber-50 border-b border-gray-700">
      <div className="flex items-center">
        <span className="ml-2 text-xl font-bold">ClipboardSync</span>
      </div>
      {user && (
        <div className="flex items-center">
          <span className="mr-4 ">{user?.name}</span>
          <button
            onClick={logoutClick}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
