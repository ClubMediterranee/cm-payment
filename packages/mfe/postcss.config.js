import autoprefixer from 'autoprefixer';
import tailwindcss from '@tailwindcss/postcss';

import hostScope from './postcss/hostScope.js';

export default {
  plugins: [tailwindcss, hostScope(), autoprefixer()],
};
