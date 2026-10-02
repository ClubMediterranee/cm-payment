import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

import hostScope from './postcss/hostScope.js';

export default {
  plugins: [tailwindcss(), hostScope(), autoprefixer()],
};
