const app = require("./app");
const { port } = require("./src/config");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
  // Client connected

  socket.on("disconnect", () => {
    // Client disconnected
  });
});

// Export io để dùng trong controllers
global.io = io;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
