"use client";

import React from "react";
import ShimmerLoader from "./ShimmerLoader";

const LoaderScreen = ({ activeUser, xClipboard }) => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center h-full w-full">
      {activeUser && (
        <>
          <h2 className="text-amber-400 text-2xl mb-8">Loading...</h2>
          <ShimmerLoader />
        </>
      )}
    </div>
  );
};

export default LoaderScreen;
