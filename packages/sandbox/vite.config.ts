import {defineConfig, type PluginOption} from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import {join} from 'node:path'

const root = import.meta.dirname
console.log(join(root, '../../tsconfig.json'))
// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@clubmed/payment-sdk": join(root, "../payment-sdk/dist"),
    }
  },
  plugins: [
    react(),
    tsconfigPaths({
      projects: [join(root, '../../tsconfig.app.json')],
    })
  ] as PluginOption[],
})
