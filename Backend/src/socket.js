const { Server } = require("socket.io");

const connectedDevices = new Map(); // user => { socketid, deviceId }
let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });
  global.io = io; // Expose emitter

  // Emit the list of connected devices for the user
  function emitDeviceList(userId) {
    if (!userId) return;
    const devices = connectedDevices.get(userId) || [];
    console.log(`Emitting device list for user ${userId}:`, devices);
    console.log("Current rooms:", global.io.sockets.adapter.rooms);

    io.to(userId).emit("device-list-update", devices); // <=== emit to room
  }

  try {
    io.on("connection", (socket) => {
      
      // This event is triggered when a device comes online
      socket.on("online-device", (data) => {
        const { userId, deviceId } = data;
        if (!userId || !deviceId) {
          console.log("Invalid data received in online-device event:", data);
          return;
        }
        socket.join(userId); // Join the room with userId
        socket.data = { userId, deviceId }; // Store deviceId in socket data

        const devices = connectedDevices.get(userId) || [];
        const existingDevice = devices.find((d) => d.deviceId === deviceId);

        if (!existingDevice) {
          connectedDevices.set(userId, [
            ...devices,
            { socketId: socket.id, deviceId },
          ]);
        }
        if (userId) {
          emitDeviceList(userId); // Emit the updated device list to the user
        }
        console.log("socket56", global.io.sockets.adapter.rooms.get(userId));
      });

      //Disconnect event
      socket.on("disconnect", () => {
        const { userId, deviceId } = socket.data || {};
        if (!userId || !deviceId) {
          console.log(
            "Socket disconnected without userId or deviceId:",
            socket.id
          );
          return;
        }

        const current = connectedDevices.get(userId) || [];
        if (current.length === 0) return;
        console.log(
          `Socket disconnected: ${socket.id}, User: ${userId}, Device: ${deviceId}`
        );
        connectedDevices.set(
          userId,
          current.filter((d) => d.deviceId !== deviceId)
        );
        emitDeviceList(userId); // Emit the updated device list to the user

        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  } catch (err) {
    console.log("Error in socket", err);
  }
};

// Export this function so it can be used anywhere after setupSocket is called
function emitClipboardUpdate(userId, data) {
  if (!io) {
    console.error("Socket.io not initialized!");
    return;
  }
  io.to(userId).emit("clipboard-update", data);
}

module.exports = { setupSocket, connectedDevices, emitClipboardUpdate };
