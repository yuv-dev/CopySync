import { getDeviceId } from "@/utils/devicesutils";

const SyncedDevices = ({ devices }) => {
  const deviceId = getDeviceId();
  if (!devices || devices.length === 0) {
    return (
      <div className="bg-white p-4 rounded-md shadow mt-4">
        <h2 className="text-xl font-semibold">Active Devices</h2>
        <p className="mt-2 text-sm text-gray-500">No active devices found.</p>
      </div>
    );
  }
  return (
    <div className="bg-gray-900 rounded mt-4 h-[300px] overflow-y-auto p-4">
      <h2 className="text-md text-gray-400 font-semibold">Active Devices</h2>
      <ul className="mt-2">
        {devices.map((d, idx) => (
          <li key={idx} className="text-sm">
            {d.deviceId}
            {d.deviceId === deviceId && (
              <span className="text-green-600 ml-2">(This Device)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SyncedDevices;
