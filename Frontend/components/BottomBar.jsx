"use client";
import React, { useEffect, useState } from "react";

const BottomBar = ({
  sync,
  setSync,
  manualReadFromClipboard,
  fetchClipboardHistory,
  searchQuery,
  setSearchQuery,
  xClipboard,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide up animation after slight delay
    const timeout = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-2 flex flex-col md:hidden shadow-inner border-t border-gray-700 transition-transform duration-500 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* First Row of Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <button
          onClick={() => setSync((prev) => !prev)}
          className="text-xs sm:text-sm bg-amber-500 rounded py-2 w-full"
        >
          {sync ? "Sync: ON" : "Sync: OFF"}
        </button>
        <button
          onClick={manualReadFromClipboard}
          className="text-xs sm:text-sm bg-blue-500 rounded py-2 w-full"
        >
          Manual Read
        </button>
        <button
          onClick={() => fetchClipboardHistory()}
          className="text-xs sm:text-sm bg-green-600 rounded py-2 w-full"
        >
          Sync Now
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-2 py-1 text-black rounded text-sm bg-white"
        />
        <button
          onClick={() => fetchClipboardHistory()}
          className="text-xs sm:text-sm bg-indigo-500 px-3 py-1 rounded"
        >
          {
            xClipboard.filter((item) =>
              item.toLowerCase().includes(searchQuery.toLowerCase())
            ).length
          }
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
