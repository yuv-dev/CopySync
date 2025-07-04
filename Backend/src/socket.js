const { Server } = require("socket.io");

const activeUsers = new Map(); // userId => [socketId]
const connectedDevices = new Map(); // socketId => { userId, deviceId }

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  function emitDeviceList(userId) {
    const devices = connectedDevices.get(userId) || [];
    console.log(`Emitting device list for user ${userId}:`, devices);
    io.to(userId).emit("device-list-update", devices); // <=== emit to room
  }

  io.on("connection", (socket) => {
    //Register online device event
    // This event is triggered when a device comes online
    socket.on("online-device", (data) => {
      console.log(`Socket connected: ${socket.id}`);
      const { userId, deviceId } = data;
      if (!userId || !deviceId) {
        console.error("Invalid data received in online-device event:", data);
        return;
      }
      socket.join(userId); // Join the room with userId
      socket.data = { userId, deviceId }; // Store deviceId in socket data

      const devices = connectedDevices.get(userId) || [];

      connectedDevices.set(userId, [
        ...devices,
        { socketId: socket.id, deviceId },
      ]);

      console.log(connectedDevices);

      emitDeviceList(userId); // Emit the updated device list to the user
    });

    //Logout device event
    socket.on("logout-device", ({ userId, deviceId }) => {
      // socket.leave(userId);
      // const current = connectedDevices.get(userId) || [];
      // connectedDevices.set(
      //   userId,
      //   current.filter((d) => d.deviceId !== deviceId)
      // );
      // emitDeviceList(userId); // Emit the updated device list to the user
    });

    //Disconnect event
    socket.on("disconnect", () => {
      const { userId, deviceId } = socket.data || {};
      const current = connectedDevices.get(userId) || [];
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

  // Expose emitter
  global.io = io;
};

module.exports = { setupSocket, connectedDevices };
