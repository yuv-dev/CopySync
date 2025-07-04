// Entry point: Express + WebSocket server setup
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");

const { setupSocket } = require("./socket");

const connectDB = require("./db");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors()); // Enable Cross-Origin requests
app.use(helmet()); // Secure headers
app.use(morgan("dev")); // Log requests to console
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

const authRoutes = require("./routes/authRoutes");
const clipboardRoutes = require("./routes/clipboardRoutes");
const deviceRoutes = require("./routes/deviceRoutes");

// Define your routes here
app.use("/api/auth", authRoutes);
app.use("/api/clipboard", clipboardRoutes);
app.use("/api/devices", deviceRoutes);

// Set up routes
app.use("/", (req, res) => {
  res.write("App Connected\n");
  res.write("CopySync");
  res.end();
}); // Use the routes defined in routes.js

connectDB(); // Connect to MongoDB


setupSocket(server); // Set up WebSocket server

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server + Websocket is running on port ${PORT}`);
});
