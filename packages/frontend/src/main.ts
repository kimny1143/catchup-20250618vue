import { createApp } from 'vue'
import App from './App.vue'
import { Toast, options } from './plugins/toast'

const app = createApp(App)
app.use(Toast, options)
app.mount('#app')