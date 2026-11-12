// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.lilinst.com',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
});
