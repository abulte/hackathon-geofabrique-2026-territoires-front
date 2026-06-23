import { createApp } from 'vue'
import VueDsfr from '@gouvminint/vue-dsfr'
import router from './router'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/dist/vue-dsfr.css'
import App from './App.vue'

createApp(App).use(VueDsfr).use(router).mount('#app')
