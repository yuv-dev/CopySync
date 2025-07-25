//All the functions of the Clipboard page
import axios from "axios";
import { BACKEND_URL, CLIPBOARD_API_URI } from "@/configs/API_configs";

export const uploadCopiedTextFunc = async ({
  lastClipboard,
  pausedClipboardValue,
  setXClipboard,
  getDeviceId,
  skipFirstRead,
  xClipboard,
}) => {
  if (!document.hasFocus()) return;

  const current = await navigator.clipboard.readText();

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
    current &&
    current !== lastClipboard.current &&
    current !== pausedClipboardValue
  ) {
    const deviceId = getDeviceId();
    await fetch(BACKEND_URL + "/api/clipboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("clipSync-token")
        )}`,
      },
      body: JSON.stringify({ text: current, deviceId }),
    });

    lastClipboard.current = current;
    localStorage.setItem("lastClipboard", current);
    setXClipboard((prev) => [current, ...prev]);
  }
};

export const setupPausedClipboardValueFunc = async (
  setPausedClipboardValue
) => {
  try {
    const current = await navigator.clipboard.readText();
    setPausedClipboardValue(current);
  } catch (err) {
    console.warn("Clipboard read for paused state failed", err);
  }
};

export const fetchFromLocalStorageFunc = ({
  setXClipboard,
  lastClipboard,
  user,
}) => {
  const saved = localStorage.getItem("clipboardHistory");
  const lastClip = localStorage.getItem("lastClipboard");
  if (saved) setXClipboard(JSON.parse(saved));
  if (lastClip && user) lastClipboard.current = lastClip;
};

export const fetchClipboardHistoryFunc = async ({
  user,
  nextPageToken,
  isFetching,
  setIsFetching,
  setXClipboard,
  setHasMore,
  lastClipboard,
  setNextPageToken,
  logout,
  fetchFromLocalStorage,
  setIsRemoteLoaded,
  isPaginated = false,
  searchQuery = "",
  router,
}) => {
  if (user && user.driveRefreshToken && !isFetching) {
    setIsFetching(true);
    try {
      const response = await axios.get(
        `${CLIPBOARD_API_URI}?pageToken=${
          isPaginated ? nextPageToken : ""
        }&keyword=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(
              localStorage.getItem("clipSync-token")
            )}`,
          },
        }
      );

      const clipboardData = response.data.clipboardData || [];
      const newToken = response.data.nextPageToken || null;

      if (isPaginated) {
        setXClipboard((prev) => [...prev, ...clipboardData]);
      } else {
        setXClipboard(clipboardData);
        if (clipboardData.length > 0) {
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
      if (error?.response?.data?.message === "Token expired") {
        logout();
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
      console.error("Fetching clipboard history failed:", error);
    } finally {
      setIsFetching(false);
      setIsRemoteLoaded(true);
    }
  }
};
