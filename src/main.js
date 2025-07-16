// Import Vue's createApp function to create a new Vue application
import { createApp } from 'vue'


// Import global styles
import './style.css'

// Import the root App component
import App from './App.vue'

// Import the Google Login plugin for Vue 3
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
