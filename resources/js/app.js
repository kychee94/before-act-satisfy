import './bootstrap';
import '../css/app.css';
import '../css/vuetify-theme.css'
import '@mdi/font/css/materialdesignicons.css'

import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { createVuetify, useTheme } from 'vuetify'
import * as components from 'vuetify/components'; 
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import {IconEye, IconEyeClosed} from '@tabler/icons-vue'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
                mdi,
                tabler: {
                    component: props => {
                        // Map icon names to components
                        const icons = {
                            eye: IconEye,
                            eye_off: IconEyeClosed,
                            // Add more icons as needed
                        }
                        const IconComponent = icons[props.icon]
                        return h(IconComponent, {
                            size: 24, // Default size
                            ...props,
                        })
                    }
                }
            },
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#7367F0',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#FF4C51',
                },
                variables: {
                },
            },
        },
    },
})

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.vue`,
            import.meta.glob('./pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(vuetify)
            .use(ZiggyVue)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
