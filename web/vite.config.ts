import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

const midnightRoot = path.resolve(__dirname, 'node_modules/@midnight-ntwrk');
const midnightPackages = fs.readdirSync(midnightRoot);

/** Pin leaf packages to web/node_modules (avoids ../node_modules duplicates from @api imports). */
const midnightAliases = Object.fromEntries(
  midnightPackages
    .filter((pkg) => pkg !== 'midnight-js-protocol')
    .map((pkg) => [`@midnight-ntwrk/${pkg}`, path.join(midnightRoot, pkg)]),
);

const devPort = Number(process.env.PORT) || 3010;

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  // react() after wasm/TLA — otherwise Fast Refresh preamble can break (getRefreshReg).
  plugins: [wasm(), topLevelAwait(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@contracts': path.resolve(__dirname, '../contracts'),
      '@api': path.resolve(__dirname, '../api/src'),
      buffer: 'buffer/',
      ...midnightAliases,
    },
    dedupe: midnightPackages.map((pkg) => `@midnight-ntwrk/${pkg}`),
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.wasm'],
    mainFields: ['browser', 'module', 'main'],
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true,
      extensions: ['.js', '.cjs'],
      ignoreDynamicRequires: true,
    },
  },
  server: {
    // Unique port: 3000/3001 collide when multiple Midnight dApps run (breaks HMR WS).
    port: devPort,
    strictPort: true,
    host: '127.0.0.1',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: devPort,
      clientPort: Number(process.env.HMR_CLIENT_PORT) || devPort,
    },
    fs: { allow: ['..'] },
  },
  optimizeDeps: {
    include: [
      'buffer',
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/ledger-v8',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-http-client-proof-provider',
    ],
    esbuildOptions: {
      target: 'esnext',
      supported: { 'top-level-await': true },
      platform: 'browser',
      format: 'esm',
      define: { global: 'globalThis' },
      loader: { '.wasm': 'binary' },
    },
  },
});
