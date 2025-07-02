"use client";
import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

import { AuthContext } from "@/context/AuthContext";
import { BACKEND_URL, CLIPBOARD_API_URI } from "@/configs/API_configs";

import CopiedText from "@/components/CopiedText";
import SideBar from "@/components/SideBar";
import LoaderScreen from "@/components/LoaderScreen";
import { useRouter } from "next/navigation";

import { manualReadFromClipboard } from "@/utils/manualReadFromClipboard";
import { registerDevice } from "@/utils/devicesutils";
import BottomBar from "@/components/BottomBar";
import { socket } from "@/utils/socket";

// This page is the main dashboard for the ClipSync application
const Page = () => {
  const { user, logout } = useContext(AuthContext);
  const [sync, setSync] = useState(true);
  const lastClipboard = useRef("");
  const skipFirstRead = useRef(true);

  const [pausedClipboardValue, setPausedClipboardValue] = useState(null);
  const [xClipboard, setXClipboard] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isRemoteLoaded, setIsRemoteLoaded] = useState(false);

  useEffect(() => {
    
    fetchFromLocalStorage();
    fetchClipboardHistory();
    registerDevice();

    if (user) {
      socket.emit("register-device", { userId: user.id });
    }

    const currentDeviceId = localStorage.getItem("deviceId");
    if (!currentDeviceId) {
      return;
    }
    socket.on("clipboard-update", (data) => {
      if (data.deviceId !== currentDeviceId) {
        // Push new text to UI (e.g., add to clipboard state)
        setXClipboard((prev) => [data.text, ...prev]);
        lastClipboard.current = data.text;
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem("clipboardHistory", JSON.stringify(xClipboard));
  }, [xClipboard]);

  useEffect(() => {
    localStorage.setItem("lastClipboard", lastClipboard.current);
  }, [lastClipboard.current]);

  useEffect(() => {
    let interval;
    if (!navigator.clipboard) {
      console.warn("Clipboard API not supported");
      return;
    }

    if (sync) {
      skipFirstRead.current = true;
      interval = setInterval(async () => {
        try {
          uploadCopiedText();
        } catch (err) {
          console.log("Clipboard access failed", err);
        }
      }, 1000);
    } else {
      setupPausedClipboardValue();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sync]);

  // Function to upload copied text to the server
  const uploadCopiedText = async () => {
    if (!document.hasFocus()) return;

    const current = await navigator.clipboard.readText();

    if (skipFirstRead.current) {
      skipFirstRead.current = false;
      if (current && current !== lastClipboard.current) {
        lastClipboard.current = current;
        localStorage.setItem("lastClipboard", current);
      }
      return;
    }

    if (
      current &&
      current !== lastClipboard.current &&
      current !== pausedClipboardValue
    ) {
      lastClipboard.current = current;
      localStorage.setItem("lastClipboard", current);
      setXClipboard((prev) => [current, ...prev]);

      const savedtext = await fetch(BACKEND_URL + "/api/clipboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("clipSync-token")
          )}`,
        },
        body: JSON.stringify({ text: current }),
      });
    }
  };

  // Function to read the clipboard value when sync is paused
  const setupPausedClipboardValue = async () => {
    try {
      const current = await navigator.clipboard.readText();
      setPausedClipboardValue(current);
    } catch (err) {
      console.warn("Clipboard read for paused state failed", err);
    }
  };

  // Function to fetch initial clipboard history
  const fetchClipboardHistory = async (
    isPaginated = false,
    searchQuery = ""
  ) => {
    if (user && user.driveRefreshToken && !isFetching) {
      setIsFetching(true);
      try {
        const response = await axios.get(
          `${CLIPBOARD_API_URI}?pageToken=${
            isPaginated ? nextPageToken : ""
          }&keyword=${searchQuery || ""}`,
          {
            headers: {
              Authorization: `Bearer ${JSON.parse(
                localStorage.getItem("clipSync-token")
              )}`,
            },
          }
        );

        const clipboardData = response.data.clipboardData;
        const newToken = response.data.nextPageToken || null;

        if (isPaginated) {
          setXClipboard((prev) => [...prev, ...clipboardData]);
        } else {
          setXClipboard(clipboardData);

          if (clipboardData && clipboardData.length > 0) {
            lastClipboard.current = clipboardData[0];
            localStorage.setItem(
              "lastClipboard",
              JSON.stringify(clipboardData[0])
            );
          }
        }

        setHasMore(!!newToken);

        localStorage.setItem("clipboardHistory", JSON.stringify(clipboardData));

        setNextPageToken(newToken || null);
      } catch (error) {
        if (error?.response?.data?.message == "Token expired") {
          // If the token is expired, logout the user
          logout();
          const router = useRouter();

          router.push("/");

          return;
        }

        if (localStorage.getItem("clipboardHistory")) {
          // If fetching fails, try to load from localStorage
          fetchFromLocalStorage();
        } else {
          // If localStorage is empty, clear the clipboard history
          setXClipboard([]);
          lastClipboard.current = "";
          localStorage.removeItem("clipboardHistory");
          localStorage.removeItem("lastClipboard");
        }
        console.error("fetching clipboard history failed:", error);
      } finally {
        setIsFetching(false);
        setIsRemoteLoaded(true);
      }
    }
  };

  const fetchFromLocalStorage = () => {
    //Fetching initial clipboard history from localStorage
    const saved = localStorage.getItem("clipboardHistory");
    const lastClip = localStorage.getItem("lastClipboard");
    if (saved) setXClipboard(JSON.parse(saved));
    if (lastClip && user) lastClipboard.current = lastClip;
  };

  //Return of Page Component
  return (
    <div className="flex flex-row w-full h-[90vh] box-border justify-between">
      {/* Side Bar ----------------------------------------- */}
      <SideBar
        setSync={setSync}
        sync={sync}
        manualReadFromClipboard={manualReadFromClipboard}
        isFetching={isFetching}
        fetchClipboardHistory={fetchClipboardHistory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        xClipboard={xClipboard}
        isRemoteLoaded={isRemoteLoaded}
      />

      {/* BottomBar--------------------------------------------- */}
      <BottomBar
        sync={sync}
        setSync={setSync}
        manualReadFromClipboard={() =>
          manualReadFromClipboard(setXClipboard, lastClipboard)
        }
        fetchClipboardHistory={fetchClipboardHistory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        xClipboard={xClipboard}
      />

      {/* Content--------------------------------------------> */}
      <div
        id="scrollableDiv"
        className="flex flex-col w-full md:w-3/4 items-center bg-gray-800 p-4 rounded-lg shadow-md  overflow-y-auto"
      >
        {!isRemoteLoaded ? (
          <LoaderScreen
            className="flex flex-col flex-1 rounded-lg"
            activeUser={user}
            xClipboard={xClipboard}
          />
        ) : (
          <InfiniteScroll
            dataLength={xClipboard.length}
            next={() => fetchClipboardHistory(true, searchQuery)}
            hasMore={hasMore}
            loader={<span className="glow-text">Loading...</span>}
            endMessage={
              <p className="text-amber-400 align-middle text-center ">
                You've seen all clips!
              </p>
            }
            className="flex flex-col flex-1 rounded-lg"
            style={{ height: "100%", overflowY: "auto" }}
            scrollableTarget="scrollableDiv"
          >
            {xClipboard
              .filter((item) =>
                item.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <div
                  key={index}
                  className=" bg-gray-700 text-white p-2 rounded mb-2 w-full "
                >
                  <CopiedText item={item} />
                </div>
              ))}
          </InfiniteScroll>
        )}
        {/* //Fallback for infinite scroll */}
        {hasMore && !isFetching && (
          <button
            onClick={() => fetchClipboardHistory(true, searchQuery)}
            className="mt-4 p-2 bg-blue-500 text-white hover:bg-blue-700 rounded"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default Page;
