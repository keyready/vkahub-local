import * as path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    resolve: {
        alias: [{ find: '@', replacement: path.resolve(__dirname, './src/') }],
    },
    define: {
        IS_DEV: JSON.stringify(true),
    },
    optimizeDeps: {
        exclude: ['jsencrypt'],
    },
    server: {
        port: 3001,
        proxy: {
            '/api': {
                target: 'http://localhost:5000/api',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\//, ''),
            },
        },
    },
});
