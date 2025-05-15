import react from "@vitejs/plugin-react";
import fs from "fs";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // This will allow you to access the server from another device
    port: 3001,
    open: true,
    https: {
      key: fs.readFileSync(
        //"/Users/dilanlakmal/Downloads/YQMS-Latest-main/192.165.2.175-key.pem"

        "/Users/dilanlakmal/Downloads/YQMS-V0.1-main/192.165.2.175-key.pem"
      ),
      cert: fs.readFileSync(
        //"/Users/dilanlakmal/Downloads/YQMS-Latest-main/192.165.2.175.pem"
        "/Users/dilanlakmal/Downloads/YQMS-V0.1-main/192.165.2.175.pem"
      ),
    },
  },
});
