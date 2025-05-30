"use client";
import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import CopiedText from "@/components/CopiedText";
import { CLIPBOARD_API_URI } from "@/configs/API_configs";
import { FaSync } from "react-icons/fa";

const Page = () => {
  const { user, logout } = useContext(AuthContext);
  const [sync, setSync] = useState(true);
  const lastClipboard = useRef("");
  const skipFirstRead = useRef(true);

  const [pausedClipboardValue, setPausedClipboardValue] = useState(null);
  const [xClipboard, setXClipboard] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchInitialClipboardHistory();
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

            const savedtext = await fetch(
              "http://localhost:5000/api/clipboard",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${JSON.parse(
                    localStorage.getItem("clipSync-token")
                  )}`,
                },
                body: JSON.stringify({ text: current }),
              }
            );
          }
        } catch (err) {
          console.warn("Clipboard access failed", err);
        }
      }, 1000);
    } else {
      setupPausedClipboardValue();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sync]);

  const setupPausedClipboardValue = async () => {
    try {
      const current = await navigator.clipboard.readText();
      setPausedClipboardValue(current);
    } catch (err) {
      console.warn("Clipboard read for paused state failed", err);
    }
  };

  const fetchInitialClipboardHistory = async () => {
    setIsFetching(true);
    console.log("Fetching initial clipboard history...", isFetching);
    if (user && user.driveRefreshToken) {
      try {
        const response = await axios.get(CLIPBOARD_API_URI, {
          headers: {
            Authorization: `Bearer ${JSON.parse(
              localStorage.getItem("clipSync-token")
            )}`,
          },
        });

        setXClipboard(response.data);
        if (response.data.length > 0) {
          lastClipboard.current = response[0];
          localStorage.setItem("lastClipboard", response.data[0]);
        }

        localStorage.setItem("clipboardHistory", JSON.stringify(response.data));
        setIsFetching(false);
        console.log(
          "Clipboard history fetched and saved to localStorage.",
          isFetching
        );

        return;
      } catch (error) {
        console.error("fetching clipboard history failed:", error);
      }
    }

    //Fetching initial clipboard history from localStorage
    const saved = localStorage.getItem("clipboardHistory");
    const lastClip = localStorage.getItem("lastClipboard");
    if (saved) setXClipboard(JSON.parse(saved));
    if (lastClip && user) lastClipboard.current = lastClip;
  };

  const manualRead = async () => {
    try {
      const current = await navigator.clipboard.readText();
      if (current && current !== lastClipboard.current) {
        lastClipboard.current = current;
        localStorage.setItem("lastClipboard", current);
        setXClipboard((prev) => [current, ...prev]);

        await fetch("/api/clipboard", {
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
    } catch (err) {
      console.warn("Manual clipboard access failed", err);
    }
  };

  return (
    <div className="flex flex-row w-full h-[90vh] box-border justify-between">
      {/* Side Bar */}
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
        {/* Manual Copy */}
        <button
          onClick={manualRead}
          className="mt-4 p-2 bg-blue-500 text-white hover:bg-blue-700"
        >
          Manual Read Clipboard
        </button>

        {/* Manual Copy */}
        <button
          onClick={() => {
            console.log("Manual Sync clicked", isFetching);
            if (!isFetching) fetchInitialClipboardHistory();
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

      {/* Content--------------------------------------------> */}
      <div className="flex flex-col w-3/4 items-center px-4 bg-gray-800 p-4 rounded-lg shadow-md m-4 overflow-y-auto">
        {xClipboard.map((item, index) => (
          <div
            key={index}
            className="bg-gray-700 text-white p-2 rounded mb-2 w-full"
          >
            <CopiedText item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
