// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000", {
//   autoConnect: true,
// });

// export default socket;


import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["polling", "websocket"],
});

export default socket;
