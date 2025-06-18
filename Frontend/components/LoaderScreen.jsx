"use client";

import React, { useEffect, useState } from "react";
import CopiedText from "./CopiedText";
import ShimmerLoader from "./ShimmerLoader";

const LoaderScreen = () => {
  const [offlineData, setOfflineData] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("clipboardHistory");
    if (saved) {
      setOfflineData(JSON.parse(saved));
    }
  }, []);

  if (offlineData.length > 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-start h-full w-full">
        {offlineData.map((item, index) => (
          <div
            key={index}
            className="bg-gray-700 text-white p-2 rounded mb-2 w-full"
          >
            <CopiedText item={item} />
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="flex flex-col flex-1 items-center justify-start h-full w-full">
        <h2 className="text-amber-400 text-2xl mb-8">Loading...</h2>
        <ShimmerLoader />
      </div>
    );
  }
};

export default LoaderScreen;
