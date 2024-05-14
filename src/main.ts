import { createApp } from 'vue';

import axios from 'axios';
import appEnv from 'app-env';

import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import { globalCookiesConfig } from 'vue3-cookies';
import mixpanel from 'mixpanel-browser';
import Hotjar from '@hotjar/browser';

import App from './App.vue';
import router from './routes';

import 'primevue/resources/themes/aura-dark-purple/theme.css';
import 'primeicons/primeicons.css';
import './style.scss';

axios.defaults.headers.common['Client-ID'] = appEnv.VITE_TWITCH_CLIENT_ID;

globalCookiesConfig({
  expireTimes: '1d',
});

const app = createApp(App);

app.use(PrimeVue, { ripple: true });
app.use(ToastService);
app.use(router);

app.mount('#app');

mixpanel.init(appEnv.VITE_MIXPANEL_PROJECT_TOKEN, {
  persistence: 'localStorage',
  persistence_name: 'lf',
  track_pageview: true,
});

Hotjar.init(appEnv.VITE_HOTJAR_SITE_ID, 6);
