import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      fileName: (format) => `cmpayment.${format}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        entryFileNames: (chunk) => {
          return chunk.facadeModuleId?.includes("src/scripts")
            ? "public/[name].js"
            : "[name].js";
        },
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        format: "umd",
      },
    },
  },
  plugins: [react(), basicSsl(), visualizer({ open: true })],
  server: {
    host: "cm-payment",
  },
});
