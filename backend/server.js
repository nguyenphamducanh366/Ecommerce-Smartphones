import express from "express";
import ejs from "ejs";
import cors from "cors";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import router from "./routers/index.js";
import mongoose from "mongoose";
import { createServer } from "http"; // Thêm http để tạo server
import { Server } from "socket.io"; // Thêm Socket.IO

// Đọc các biến môi trường từ file .env
dotenv.config();

const app = express();
const httpServer = createServer(app); // Tạo HTTP server từ Express
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL, // Đảm bảo khớp với frontend (http://localhost:5173)
    methods: ["GET", "POST"],
  },
}); // Khởi tạo Socket.IO

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  })
);

// Template engine
app.set("engine", "ejs");
app.set("views", "./views");

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // Router
    app.use("/", router);

    // Start server
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`Server đang chạy ở port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Export io để sử dụng ở các file khác
export { io };
