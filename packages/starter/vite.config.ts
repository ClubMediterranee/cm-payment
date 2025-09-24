import {type PluginOption} from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import {join} from 'node:path'
import dotenv from "dotenv-flow";
import basicSsl from "@vitejs/plugin-basic-ssl";
import {defineConfig} from "vitest/config";

const root = import.meta.dirname

dotenv.config({
  path: join(root, './config'),
});

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tsconfigPaths({
      projects: [join(root, '../../tsconfig.app.json')],
    }),
    process.env.NODE_ENV !== "test" ? (basicSsl as any)() : undefined
  ] as PluginOption[],
  server: {
    host: process.env.HOST
  }
})
