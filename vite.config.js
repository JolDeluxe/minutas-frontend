import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        injectManifest: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,webp,woff2,svg}'],
          globIgnores: [
            '**/node_modules/**/*',
            'sw.js',
            '**/MaterialSymbolsRounded*.woff2',
          ],
        },
        manifest: false,
        includeAssets: ['img/**/*.webp', 'img/**/*.png'],
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
    ],

    server: {
      host: true,
      port: parseInt(env.PORT) || 5173,
      strictPort: true,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components/ui/z_index.html': path.resolve(__dirname, './src/components/ui/z_index.js'),
      },
    },
  };
});