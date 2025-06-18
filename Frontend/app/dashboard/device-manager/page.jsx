"use client";

import React, { useEffect, useState } from "react";
import {
  getAllDeviceList,
  registerDevice,
  unregisterDevice,
} from "@/utils/devicesutils";
// This page allows users to manage their devices connected to ClipSync.

const page = () => {
  const [devices, setDevices] = useState([]);
  const [thisDevice, setThisDevice] = useState(null);

  useEffect(() => {
    setThisDevice(localStorage.getItem("deviceId"));
    if (!thisDevice) {
      registerDevice();
      setThisDevice(localStorage.getItem("deviceId"));
    }
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      const response = await getAllDeviceList();
      setDevices(response || []);
    };
    fetchDevices();
  }, []);

  const removeDevice = async (deviceId) => {
    try {
      const response = await unregisterDevice(deviceId);
      if (response.status === 200) {
        setDevices(devices.filter((device) => device.deviceId !== deviceId));
      } else {
        console.error("Failed to remove device");
      }
    } catch (error) {
      console.error("Error removing device:", error);
    }
  };

  return (
    <div className="p-4 m-4  rounded-2xl bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-center text-amber-400">
        Device Manager
      </h1>
      <p className="mb-4  text-gray-300 text-center">
        Manage your devices connected to ClipSync. You can remove any device
        that you no longer use.
      </p>
      <ul>
        {devices.map((device) => (
          <li
            key={device.deviceId}
            className="flex justify-between mb-4 p-4 rounded-md bg-gray-700"
          >
            <div>
              <p>
                <strong className="device-info">Device:</strong>{" "}
                {device.deviceId}
                {thisDevice && thisDevice === device.deviceId && (
                  <span className="text-green-500 ml-2">(This Device)</span>
                )}
              </p>
              <p>
                <strong className="device-info">Device Type:</strong>{" "}
                {device.deviceType}
              </p>
              <p>
                <strong className="device-info">Device Platform:</strong>{" "}
                {device.platform}
              </p>
              <p>
                <strong className="device-info">Last Seen:</strong>{" "}
                {new Date(device.lastSeen).toLocaleString()}
              </p>
            </div>
            {thisDevice && thisDevice !== device.deviceId && (
              <button
                onClick={() => removeDevice(device.deviceId)}
                className="bg-red-500 hover:bg-red-600 p-1 h-fit rounded self-center cursor-pointer"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default page;
