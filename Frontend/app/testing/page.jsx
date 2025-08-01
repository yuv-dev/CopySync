"use client";
import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

import { AuthContext } from "@/context/AuthContext";
import { BACKEND_URL, CLIPBOARD_API_URI } from "@/configs/API_configs";

import CopiedTextCard from "@/components/CopiedTextCard";
import SideBar from "@/components/SideBar";
import LoaderScreen from "@/components/LoaderScreen";
import { useRouter } from "next/navigation";

import { manualReadFromClipboard } from "@/utils/manualReadFromClipboard";
import { registerDevice } from "@/utils/devicesutils";
import BottomBar from "@/components/BottomBar";
import { socket } from "@/utils/socket";
import { v4 as uuidv4 } from "uuid";

// This page is the main dashboard for the ClipSync application
const Page = () => {
  const { user, logout } = useContext(AuthContext);
  const deviceId = useRef(null);
  const lastClipboard = useRef("");
  const skipFirstRead = useRef(true);

  const [sync, setSync] = useState(true);
  const [xClipboard, setXClipboard] = useState([]); // Clipboard items fetched from the server
  const [isFetching, setIsFetching] = useState(false); // Flag to indicate if data is being fetched
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering clipboard items
  const [nextPageToken, setNextPageToken] = useState(null); // Token for pagination
  const [devices, setDevices] = useState([]); // List of devices connected to the user

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect(); // Only if app unmounts
    };
  }, []); // Empty dependency array ensures that socket is actually connected only once

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) return;

    const getDeviceId = () => {
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("deviceId", deviceId);
      }
      return deviceId;
    };
    deviceId.current = getDeviceId();
    fetchFromLocalStorage();
    const init = async () => {
      if (!user) return;
      await registerDevice();
      await fetchClipboardHistory();

      if (user && socket.connected && deviceId.current) {
        socket.emit("online-device", {
          userId: user._id,
          deviceId: deviceId.current,
        });
      }

      socket.on("device-list-update", (deviceList) => {
        // Update the devices state with the received device list
        setDevices(deviceList || []);
      });

      socket.on("clipboard-update", (data) => {
        if (data.content === lastClipboard.current) return;
        if (data.deviceId !== deviceId.current) {
          lastClipboard.current = data.content;
          const newUpdate = data;
          setXClipboard((prev) => [{ ...data }, ...prev]);
        }
      });
    };

    if (navigator.onLine) init();

    return () => {
      socket.off("device-list-update");
      socket.off("clipboard-update");
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
        //Read clipboard every second
        try {
          uploadCopiedText(); // Upload copied text to the server
        } catch (err) {
          console.log("Clipboard access failed", err);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sync]);

  /********************************************************************************************** */
  // Function to upload copied text to the server
  const uploadCopiedText = async () => {
    if (!document.hasFocus()) return;
    try {
      const current = (await navigator.clipboard.readText()).trim();
      if (skipFirstRead.current) {
        // Skip the first read to avoid initial empty clipboard value
        skipFirstRead.current = false;
        if (current && current !== lastClipboard.current) {
          lastClipboard.current = current;
          localStorage.setItem("lastClipboard", current);
        }
        return;
      }

      if (
        !current || // Check if the current clipboard value is not empty
        current === lastClipboard.current
      ) {
        return;
      }
      lastClipboard.current = current;
      localStorage.setItem("lastClipboard", current);
      setXClipboard((prev) => [
        {
          content: current,
          createdAt: new Date().toLocaleString(),
          deviceId: deviceId.current,
          fileId: "null",
          filename: "clipboard-local.txt",
        },
        ...prev,
      ]);

      const savedtext = await fetch(BACKEND_URL + "/api/clipboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("clipSync-token")
          )}`,
        },
        body: JSON.stringify({ text: current, deviceId: deviceId.current }),
      });

      //For future usage: Create Logic if somehow POST operation fails or status not 201
    } catch (error) {
      console.error("Error uploading copied text:", error);
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
        // .map(
        //   (item) => item.content
        // );
        const newToken = response.data.nextPageToken || null;

        if (isPaginated) {
          setXClipboard((prev) => [...prev, ...clipboardData]);
        } else {
          setXClipboard(clipboardData);

          if (clipboardData && clipboardData.length > 0) {
            lastClipboard.current = clipboardData[0].content;
            localStorage.setItem(
              "lastClipboard",
              JSON.stringify(clipboardData[0].content)
            );
          }
        }

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

  /********************************************************************************************** */

  //Return of Page Component
  return (
    <div className="flex flex-row w-full h-[90vh] box-border justify-between">
      {/* Side Bar ----------------------------------------- */}
      <SideBar
        setSync={setSync}
        sync={sync}
        manualReadFromClipboard={() =>
          manualReadFromClipboard(setXClipboard, lastClipboard)
        }
        isFetching={isFetching}
        fetchClipboardHistory={fetchClipboardHistory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        xClipboard={xClipboard}
        devices={devices}
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
        {xClipboard?.length === 0 ? (
          <LoaderScreen
            className="flex flex-col flex-1 rounded-lg"
            activeUser={user}
            xClipboard={xClipboard}
          />
        ) : (
          <InfiniteScroll
            dataLength={xClipboard.length}
            next={() => fetchClipboardHistory(true, searchQuery)}
            hasMore={!!nextPageToken}
            loader={<span className="glow-text">Loading...</span>}
            endMessage={
              <p className="text-amber-400 align-middle text-center ">
                That's all Folks!
              </p>
            }
            className="flex flex-col flex-1 rounded-lg w-full"
            style={{ height: "100%", overflowY: "auto" }}
            scrollableTarget="scrollableDiv"
          >
            {xClipboard
              .filter((item) =>
                item.content.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <div
                  key={index}
                  className=" bg-gray-700 text-white rounded mb-3 w-full "
                >
                  <CopiedTextCard item={item} />
                </div>
              ))}
          </InfiniteScroll>
        )}
        {/* //Fallback for infinite scroll */}
        {!!nextPageToken && !isFetching && (
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
