import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from "path";

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        vuetify({
            autoImport: true,
        }),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/js"),
            "~": path.join(__dirname, "node_modules/"),
            '@core': path.resolve(__dirname, "resources/js/@core"),
            '@images': path.resolve(__dirname, "resources/images/"),
            '@layouts': path.resolve(__dirname, "resources/js/@layouts"),
            '@themeConfig': path.resolve(__dirname, "themeConfig.js"),
            '@core-scss': path.resolve(__dirname, "resources/styles/@core"),
            '@styles': path.resolve(__dirname, 'resources/styles/'),
            "@css": path.resolve(__dirname, "resources/css"),
            '@configured-variables': path.resolve(__dirname, 'resources/styles/variables/_template.scss'),
            // vue: 'vue/dist/vue.esm-bundler.js'
        },
    },
});
