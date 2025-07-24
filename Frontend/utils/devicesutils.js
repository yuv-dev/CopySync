import { v4 as uuidv4 } from "uuid";
import { DEVICE_API_URI } from "@/configs/API_configs";

export const getDeviceId = () => {
  if (typeof window === "undefined") return null;

  const deviceId = localStorage.getItem("deviceId");
  if (deviceId) {
    return deviceId;
  } else {
    const deviceId = uuidv4();
    localStorage.setItem("deviceId", deviceId);
    return deviceId;
  }
};

export const getDeviceName = () => {
  const deviceName = localStorage.getItem("deviceName");
  if (deviceName) {
    return deviceName;
  } else {
    const deviceName = `Device-${getDeviceId()}`;
    localStorage.setItem("deviceName", deviceName);
    return deviceName;
  }
};

export const getDeviceType = () => {
  const userAgent = navigator.userAgent;

  // Check for mobile or tablet devices
  if (/mobile/i.test(userAgent)) {
    return "Mobile";
  } else if (/tablet/i.test(userAgent)) {
    return "Tablet";
  } else {
    return "Desktop";
  }
};

//   Register the device with the backend
export const registerDevice = async () => {
  const deviceId = getDeviceId();
  const userAgent = navigator?.userAgent;
  const platform = navigator?.userAgentData?.platform;
  const deviceType = getDeviceType();
  const lastRegistered = localStorage.getItem("clipSync-device-last-register");
  if (!deviceId) return;
  // If already registered recently (e.g. in the last hour), skip
  // if (
  //   lastRegistered &&
  //   Date.now() - parseInt(lastRegistered) < 1000 * 60 * 60
  // ) {
  //   console.log("Device already registered recently, skipping registration.");
  //   return;
  // }

  try {
    const response = await fetch(DEVICE_API_URI + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("clipSync-token")
        )}`,
      },
      body: JSON.stringify({
        deviceId,
        deviceType: `${deviceType}-Web Browser`,
        userAgent,
        platform,
      }),
    });

    if (response.status === 200) {
      localStorage.setItem("clipSync-device-last-register", `${Date.now()}`);
    }
  } catch (err) {
    console.error("Device registration failed:", err);
  }
};

// Unregister the device from the backend
export const unregisterDevice = async (deviceId) => {
  try {
    const response = await fetch(DEVICE_API_URI + "/unregister", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("clipSync-token")
        )}`,
      },
      body: JSON.stringify({ deviceId }),
    });

    return response;
  } catch (err) {
    console.warn("Device unregistration failed:", err);
  }
};

import axios from "axios";

export const getAllDeviceList = async () => {
  const response = await axios.get(DEVICE_API_URI + "/all", {
    headers: {
      Authorization: `Bearer ${JSON.parse(
        localStorage.getItem("clipSync-token")
      )}`,
    },
  });
  if (response.status !== 200) {
    console.error("Failed to fetch devices");
    return;
  }
  return response.data;
};
