import { defineConfig } from 'vite';
import oxlintPlugin from 'vite-plugin-oxlint';

export default defineConfig({
    root: './src',
    base: './',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: './src/index.html',
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    plugins: [
        oxlintPlugin({
            dir: 'src',
        }),
    ],
    resolve: {
        alias: {
            '@': '/src',
            '@party': '/party',
        },
    },
    optimizeDeps: {
        include: ['three', 'globe.gl', 'tmi.js'],
    },
});
