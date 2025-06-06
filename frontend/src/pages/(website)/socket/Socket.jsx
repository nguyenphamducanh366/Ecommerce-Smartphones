import io from "socket.io-client";

const Socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"], 
});

Socket.on("connect", () => {
  console.log("Connected to socket server");
});

Socket.on("disconnect", () => {
  console.log("Disconnected from socket server");
});

Socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

export default Socket;