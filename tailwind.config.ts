import { tailwindPreset } from '@clubmed/trident-ui/tailwind';
import type { Config } from 'tailwindcss';

const config = {
  presets: [tailwindPreset],
  content: [
    './doc/**/*.mdx',
    './packages/**/*.{ts,tsx,mdx,css}',
    'node_modules/@clubmed/trident-ui/**/*.{js,css}',
  ],
} satisfies Config;

export default config;
