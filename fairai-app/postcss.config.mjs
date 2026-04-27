/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 doesn't use the old postcss plugin
    // but some tools may still read this config
  },
};

export default config;
