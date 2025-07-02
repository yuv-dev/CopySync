const { Server } = require("socket.io");

const activeUsers = new Map(); // userId => [socketId]
const socketDeviceMap = new Map(); // socketId => { userId, deviceId }

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register-device", ({ userId, deviceId }) => {
      if (!activeUsers.has(userId)) activeUsers.set(userId, []);
      activeUsers.get(userId).push(socket.id);
      socketDeviceMap.set(socket.id, { userId, deviceId });
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      const info = socketDeviceMap.get(socket.id);
      if (info) {
        const { userId } = info;
        activeUsers.set(
          userId,
          activeUsers.get(userId).filter((id) => id !== socket.id)
        );
        socket.leave(userId);
      }
      socketDeviceMap.delete(socket.id);
    });
  });

  // Expose emitter
  global.io = io;
}

module.exports = { setupSocket };
