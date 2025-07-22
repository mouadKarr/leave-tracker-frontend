import 'bootstrap/dist/css/bootstrap.min.css'
import { createApp } from 'vue'
import App from './App.vue'
import GoogleLoginPlugin from 'vue3-google-login'
import router from './router'


// Create a Vue application instance using the root component
const app = createApp(App)

// Register the Google Login plugin with the Vue app and pass the Google Client ID from environment variables
app.use(GoogleLoginPlugin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
})

app.use(router)

// Mount the Vue app to the DOM element with id "app"
app.mount('#app')
