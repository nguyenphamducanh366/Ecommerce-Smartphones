import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: mode === "development" ? {
      proxy: {
        "/api": "http://localhost:5000", // Proxy các yêu cầu API đến backend
      },
    } : {},
    build: {
      // Đảm bảo thư mục đầu ra build nằm bên ngoài thư mục frontend
      outDir: "../dist", 
    },
  };
});
