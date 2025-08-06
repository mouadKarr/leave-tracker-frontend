import 'bootstrap/dist/css/bootstrap.min.css'
import { createApp } from 'vue'
import App from './App.vue'
import GoogleLoginPlugin from 'vue3-google-login'
import router from './router'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css' // ✅ Styles nécessaires

const app = createApp(App)

// ✅ Google Login
app.use(GoogleLoginPlugin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
})

// ✅ Router
app.use(router)

// ✅ VCalendar
app.use(VCalendar, {})

// ✅ Monter l'application
app.mount('#app')
