import { i18n } from '@/i18n'
import { WidgetJsPlugin } from '@widget-js/vue3'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@widget-js/vue3/dist/style.css'
import 'virtual:uno.css'
import '@/assets/main.css'

const app = createApp(App)

app.use(router)
  .use(i18n)
  .use(WidgetJsPlugin)
app.mount('#app')
