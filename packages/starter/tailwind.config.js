import { tailwindPreset } from "@clubmed/trident-ui/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [tailwindPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "**/node_modules/@clubmed/trident-ui/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
