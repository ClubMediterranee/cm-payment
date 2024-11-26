import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "load-client": path.resolve(__dirname, "src/scripts/load-client.js"),
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.facadeModuleId?.includes("src/scripts")
            ? "public/[name].js"
            : "[name].js";
        },
      },
    },
  },
  plugins: [react(), basicSsl()],
  server: {
    host: "cm-payment",
  },
});
