import "dotenv/config";
import http from "http";

import app from "./app.js";
import { initSocket } from "./sockets/socket.js";

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});