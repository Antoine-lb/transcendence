import { createApp } from "vue";
import { createPinia } from "pinia";
import Notifications from '@kyvg/vue3-notification'

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router).use(Notifications);
app.mount("#app");
