import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useState, useEffect } from "react";
import { FaSearch, FaSync } from "react-icons/fa";

const SideBar = ({
  setSync,
  sync,
  manualReadFromClipboard,
  isFetching,
  fetchClipboardHistory,
  searchQuery,
  setSearchQuery,
  xClipboard,
  isRemoteLoaded,
}) => {
  const [offlineData, setOfflineData] = useState([]);
  const route = useRouter();

  useEffect(() => {
    // Safe to use localStorage inside useEffect (runs only on client)
    const saved = localStorage.getItem("clipboardHistory");
    if (saved) {
      setOfflineData(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="flex flex-col w-1/4 border-r-2 p-4">
      <h1 className="text-4xl text-amber-400 border-b-2 border-gray-200 text-center">
        Dashboard
      </h1>

      {/* Toggle Switch */}
      <div className="flex items-center mt-6 justify-between">
        <span className="mr-4 text-2xl">Sync Status</span>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={sync}
            onChange={() => setSync((p) => !p)}
            className="hidden"
          />
          <span className="w-23 h-11 bg-white rounded shadow-inner relative  ">
            <span
              className={`absolute top-0.5 left-0.5 w-10 h-10 text-sm font-bold bg-amber-300 rounded shadow transform transition-transform duration-300 ease-in-out  ${
                sync ? "translate-x-12" : "translate-x-0"
              }  flex items-center justify-center text-black`}
            >
              <span>{sync ? "ON" : "OFF"}</span>
            </span>
          </span>
        </label>
      </div>

      {/* Manual Box */}
      <div className="flex flex-col mt-6 border-2 border-gray-300 p-4 rounded-lg">
        {/* Manual Copy */}
        <button
          onClick={() => manualReadFromClipboard(setXClipboard, lastClipboard)}
          className="p-2 bg-blue-500 text-white hover:bg-blue-700"
        >
          Manual Read Clipboard
        </button>

        {/* Manual Sync */}
        <button
          onClick={() => {
            console.log("Manual Sync clicked", isFetching);
            if (!isFetching) fetchClipboardHistory();
          }}
          className="mt-2 p-2 bg-amber-500 text-white hover:bg-amber-600 text-align-center flex items-center justify-center"
          style={{ width: "100%" }}
        >
          <span>Manual Sync </span>
          <span className={isFetching ? "ml-2 animate-spin" : "ml-2"}>
            <FaSync />
          </span>
        </button>
      </div>

      {/* Search Box */}
      <div className="flex items-center relative mt-4">
        <input
          type="text"
          placeholder="Search clipboard..."
          className="p-2 w-full border rounded mt-2 mb-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FaSearch
          className="absolute right-2 top-4 text-2xl text-white"
          onClick={() => {
            fetchClipboardHistory(false, searchQuery);
          }}
        />
      </div>

      {/* Clip Counter */}
      <span className="text-amber-400 text-2xl ">
        Clip Counter :{" "}
        {isRemoteLoaded
          ? xClipboard.filter((item) =>
              item.toLowerCase().includes(searchQuery.toLowerCase())
            ).length
          : offlineData
          ? offlineData.filter((item) =>
              item.toLowerCase().includes(searchQuery.toLowerCase())
            ).length
          : 0}
      </span>

      {/* Device Page Routing */}
      <Link href="/dashboard/device-manager">
      <button className="w-full mt-6 p-2 bg-blue-500 text-white hover:bg-blue-700">
        Synced Devices
      </button>
      </Link>
    </div>
  );
};

export default SideBar;
