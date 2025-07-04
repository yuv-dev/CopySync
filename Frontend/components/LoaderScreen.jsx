"use client";

import React, { use, useContext, useEffect, useState } from "react";
import CopiedText from "./CopiedText";
import ShimmerLoader from "./ShimmerLoader";

const LoaderScreen = ({ activeUser, xClipboard }) => {
  if (xClipboard && xClipboard.length > 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-start h-full w-full">
        {xClipboard.map((item, index) => (
          <div
            key={index}
            className="bg-gray-700 text-white p-2 rounded mb-2 w-full"
          >
            <CopiedText item={item} />
          </div>
        ))}
      </div>
    );
  } 
  else {
    return (
      <div className="flex flex-col flex-1 items-center justify-center h-full w-full">
        {activeUser ? (
          <>
            <h2 className="text-amber-400 text-2xl mb-8">Loading...</h2>
            <ShimmerLoader />
          </>
        ) : (
          <span className="text-amber-400 text-2xl mb-8 text-center ">
            Please log in to view your clipboard history.
          </span>
        )}
      </div>
    );
  }
};

export default LoaderScreen;
