"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { useRouter } from "next/navigation";

import { AuthContext } from "../../context/AuthContext";
import { BACKEND_URL, CLIPBOARD_API_URI } from "@/configs/API_configs";

import CopiedText from "@/components/CopiedText";
import SideBar from "@/components/SideBar";
import LoaderScreen from "@/components/LoaderScreen";
import BottomBar from "@/components/BottomBar";

import { manualReadFromClipboard } from "@/utils/manualReadFromClipboard";
import { registerDevice } from "@/utils/devicesutils";

const throttle = (fn, limit) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
};

const Page = () => {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const [sync, setSync] = useState(false);
  const [pausedClipboardValue, setPausedClipboardValue] = useState(null);
  const [xClipboard, setXClipboard] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isRemoteLoaded, setIsRemoteLoaded] = useState(false);

  const lastClipboard = useRef("");
  const activeUser = useRef("");
  const skipFirstRead = useRef(true);
  const xClipboardRef = useRef([]);

  useEffect(() => {
    lastClipboard.current = localStorage.getItem("lastClipboard");
    activeUser.current = user;
  }, []);

  // Sync clipboard with localStorage
  useEffect(() => {
    localStorage.setItem("clipboardHistory", JSON.stringify(xClipboard));
    xClipboardRef.current =
      xClipboard && xClipboard.length > 0 ? xClipboard[0] : "";
  }, [xClipboard]);

  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem("clipboardHistory");
    const lastSaved = localStorage.getItem("lastClipboard");
    if (saved) setXClipboard(JSON.parse(saved));
    if (lastSaved) lastClipboard.current = lastSaved;

    if (user) {
      fetchClipboardHistory().then(() => {
        setSync(true); // Start syncing after fetching initial data
        registerDevice();
      });
    }
  }, [user]);

  const uploadCopiedText = useCallback(async () => {
    if (!document.hasFocus()) return;
    try {
      const current = await navigator.clipboard.readText();
      const cleanedCurrent = current?.trim();
      if (!cleanedCurrent) return;

      if (skipFirstRead.current) {
        skipFirstRead.current = false;
        lastClipboard.current = cleanedCurrent;
        localStorage.setItem("lastClipboard", cleanedCurrent);
        return;
      }

      if (
        cleanedCurrent === lastClipboard.current ||
        cleanedCurrent === pausedClipboardValue ||
        cleanedCurrent === xClipboardRef.current
      )
        return;

      //upload to server
      await fetch(`${BACKEND_URL}/api/clipboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("clipSync-token")
          )}`,
        },
        body: JSON.stringify({ text: cleanedCurrent }),
      });

      console.log("Uploading clipboard text...3");
      lastClipboard.current = cleanedCurrent;
      localStorage.setItem("lastClipboard", cleanedCurrent);

      setXClipboard((prev) => [cleanedCurrent, ...prev]);
      console.log("Uploading clipboard text...4");
    } catch (err) {
      console.error("Clipboard upload failed:", err);
    }
  }, [pausedClipboardValue]);

  // Sync clipboard interval
  useEffect(() => {
    if (!navigator.clipboard)
      return console.warn("Clipboard API not supported");

    let interval;
    if (sync) {
      skipFirstRead.current = true;
      const intervalUpload = throttle(uploadCopiedText, 1000);

      interval = setInterval(() => {
        intervalUpload();
      }, 1000);
    } else {
      setupPausedClipboardValue();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sync, uploadCopiedText]);

  const setupPausedClipboardValue = useCallback(async () => {
    try {
      const current = await navigator.clipboard.readText();
      setPausedClipboardValue(current);
    } catch (err) {
      console.warn("Clipboard read (paused) failed", err);
    }
  }, []);

  const fetchClipboardHistory = useCallback(
    async (isPaginated = false, search = "") => {
      if (!user?.driveRefreshToken || isFetching) return;

      setIsFetching(true);
      try {
        const res = await axios.get(
          `${CLIPBOARD_API_URI}?pageToken=${
            isPaginated ? nextPageToken : ""
          }&keyword=${search}`,
          {
            headers: {
              Authorization: `Bearer ${JSON.parse(
                localStorage.getItem("clipSync-token")
              )}`,
            },
          }
        );

        const { clipboardData, nextPageToken: newToken } = res.data;
        setXClipboard((prev) =>
          isPaginated ? [...prev, ...clipboardData] : clipboardData
        );
        setNextPageToken(newToken || null);
        setHasMore(!!newToken);

        if (clipboardData?.length > 0) {
          lastClipboard.current = clipboardData[0];
          localStorage.setItem("lastClipboard", clipboardData[0]);
          localStorage.setItem(
            "clipboardHistory",
            JSON.stringify(clipboardData)
          );
        } else {
          localStorage.setItem("clipboardHistory", JSON.stringify([]));
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        if (err?.response?.data?.message === "Token expired") {
          logout();
          router.push("/");
        } else {
          const saved = localStorage.getItem("clipboardHistory");
          setXClipboard(saved ? JSON.parse(saved) : []);
        }
      } finally {
        setIsFetching(false);
        setIsRemoteLoaded(true);
      }
    },
    [user, isFetching, nextPageToken, logout, router]
  );

  return (
    <div className="flex flex-row w-full h-[90vh] box-border justify-between">
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

      <BottomBar
        sync={sync}
        setSync={setSync}
        manualReadFromClipboard={() =>
          manualReadFromClipboard(setXClipboard, lastClipboard)
        }
        fetchClipboardHistory={fetchClipboardHistory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div
        id="scrollableDiv"
        className="flex flex-col w-full md:w-3/4 items-center bg-gray-800 p-4 md:pb-4 pb-36 overflow-y-auto"
      >
        {!isRemoteLoaded ? (
          <LoaderScreen
            className="flex flex-col flex-1 rounded-lg"
            activeUser={activeUser}
            xClipboard={xClipboardRef.current}
          />
        ) : (
          <InfiniteScroll
            dataLength={xClipboard.length}
            next={() => fetchClipboardHistory(true, searchQuery)}
            hasMore={hasMore}
            loader={<span className="glow-text">Loading...</span>}
            endMessage={
              <p className="text-amber-400 text-center">
                You've seen all clips!
              </p>
            }
            className="flex flex-col flex-1 rounded-lg w-full"
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
                  className="bg-gray-700 text-white p-2 rounded mb-2 w-full"
                >
                  <CopiedText item={item} />
                </div>
              ))}
          </InfiniteScroll>
        )}

        {user && hasMore && !isFetching && xClipboard.length > 0 && (
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
