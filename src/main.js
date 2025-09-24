import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './assets/styles/base.css';

const app = createApp(App);

app.use(createPinia());

app.mount('#app');
