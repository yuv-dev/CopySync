"use client";
import Image from "next/image";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUser,
  FaUserAlt,
  FaUserAltSlash,
  FaUserAstronaut,
  FaUserCircle,
  FaUserSlash,
} from "react-icons/fa";

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
    <nav className="flex items-center justify-between h-[60px] p-4 text-black bg-amber-300 shadow-amber-50 border-b border-gray-700">
      <div className="flex items-center">
        <span className="ml-2 text-xl font-bold">
          Clipboard<span className="text-3xl">Sync</span>
        </span>
      </div>
      <div className="flex items-end space-x-4 gap-1 px-4  w-[400px] justify-center">
        <Link
          href="/dashboard"
          className="text-lg font-semibold   hover:bg-amber-400 p-4"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/device-manager"
          className="text-lg font-semibold   hover:bg-amber-400 p-4"
        >
          Device Manager
        </Link>
      </div>
      {user ? (
        <div className="flex items-center align-center  justify-end ">
          {user?.picture ? (
            // <Image
            //   src={user?.picture}
            //   alt="User Avatar"
            //   width={40}
            //   height={40}
            //   className="rounded-full mr-2"
            // />
            <FaUserAlt />
          ) : (
            <>
              <FaUserAstronaut />
            </>
          )}
          <span className="mr-4 font-semibold"> {user?.name}</span>
          <button
            onClick={logoutClick}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <span className="mr-4 font-bold ">Guest</span>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            SignIn
          </button>
        </div>
      )}
    </nav>
  );
}
