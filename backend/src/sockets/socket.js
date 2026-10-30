// import { Server } from "socket.io";

// let io;

// export const initSocket = (server) => {
//   io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ],
//     credentials: true,
//   },
// });

//   io.on("connection", (socket) => {
//     console.log("🟢 Restaurant Connected:", socket.id);

//     socket.on("disconnect", () => {
//       console.log("🔴 Restaurant Disconnected:", socket.id);
//     });
//   });
// };

// export const getIO = () => io;


import { Server } from "socket.io";

let io;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  "https://food-hub-2026.vercel.app",
  "https://food-hub-2026-of48.vercel.app",
  "https://customer-ruby-five.vercel.app",
  "https://customer-ysam.vercel.app",
];

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("disconnect", (reason) => {
      console.log("🔴 Client disconnected:", socket.id, reason);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initSocket(server) first."
    );
  }

  return io;
};
