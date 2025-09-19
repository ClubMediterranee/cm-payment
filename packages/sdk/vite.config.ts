import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const env = loadEnv("development", process.cwd());
  return {
    build: {
      minify: "esbuild",
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        fileName: (format) => `cmpayment.${format}.js`,
        formats: ["es"],
      },
      rollupOptions: {
        external: ["react", "react-dom", "react/jsx-runtime"],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
          format: "es",
        },
      },
    },
    plugins: [react(), basicSsl(), visualizer({ open: true })],
    server: {
      host: "cm-payment",
    },
  };
});
