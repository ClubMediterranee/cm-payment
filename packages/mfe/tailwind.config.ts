import { tailwindPreset } from '@clubmed/trident-ui/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [tailwindPreset],
  content: [
    './src/**/*.{ts,tsx}',
    '../sdk/src/**/*.{ts,tsx}',
    '!../sdk/src/**/*.{spec,stories}.{ts,tsx}',
    '**/node_modules/@clubmed/trident-ui/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
