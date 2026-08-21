import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  },
});

  io.on("connection", (socket) => {
    console.log("🟢 Restaurant Connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Restaurant Disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;