import { getDeviceId } from "@/utils/devicesutils";

const SyncedDevices = ({ devices }) => {
  const deviceId = getDeviceId();

  return (
    <div className="bg-gray-900 rounded mt-0 overflow-y-auto p-4">
      <h2 className="text-md text-gray-400 font-semibold">Active Devices</h2>
      <ul className="mt-2 space-y-2">
        {devices && devices.length !== 0 ? (
          devices.map((d, idx) => (
            <li key={idx} className="text-xs p-2 bg-black rounded">
              <span
                className={`${d.deviceId === deviceId ? "text-green-600" : ""}`}
              >
                {d.deviceId}
              </span>
            </li>
          ))
        ) : (
          <span className="text-sm text-gray-500">
            No active devices found.
          </span>
        )}
      </ul>
    </div>
  );
};

export default SyncedDevices;
