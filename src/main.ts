import { createApp } from 'vue';

import axios from 'axios';
import appEnv from 'app-env';

import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import { globalCookiesConfig } from 'vue3-cookies';

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
