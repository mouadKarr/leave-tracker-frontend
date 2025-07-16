<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="p-4 bg-white rounded shadow" style="max-width: 400px; width: 100%;">
      <h1 class="mb-4 text-center text-primary">Connexion Google</h1>

      <div ref="googleButton" class="d-flex justify-content-center mb-3"></div>

      <p class="text-center" :class="messageClass">{{ message }}</p>

      <div v-if="user" class="text-center mt-4">
        <p><strong>FullName :</strong> {{ user.name }}</p>
        <p><strong>Email :</strong> {{ user.email }}</p>
        <button @click="logout" class="btn btn-danger mt-3 w-100">Déconnexion</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithGoogle } from '@/services/authService'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const router = useRouter()

const message = ref('En attente de connexion...')
const user = ref(null)
const googleButton = ref(null)

const messageClass = computed(() => {
  if (message.value.includes('Bienvenue')) return 'text-success fw-semibold'
  if (message.value.includes('Erreur')) return 'text-danger fw-semibold'
  return 'text-muted'
})

function decodeJwt(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = atob(base64)
  return JSON.parse(jsonPayload)
}

async function handleCredentialResponse(response) {
  if (response.credential) {
    try {
      const res = await loginWithGoogle(response.credential)
      console.log('Réponse loginWithGoogle:', res)
      const decoded = decodeJwt(res.token)
      console.log('Decoded JWT:', decoded)

      user.value = {
        name: decoded.name || decoded.fullname || decoded.given_name || 'Utilisateur',
        email: decoded.email || decoded.email_address || 'Email non disponible',
      }
      message.value = `Bienvenue ${user.value.name} !`

      localStorage.setItem('token', res.token)
      if (res.userId) localStorage.setItem('userId', res.userId)

      router.push('/')
    } catch (err) {
      console.error('❌ Erreur lors de la connexion backend:', err)
      message.value = 'Erreur lors de la connexion, veuillez réessayer.'
    }
  } else {
    message.value = 'Erreur : Aucun jeton reçu.'
  }
}

function logout() {
  user.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  message.value = 'En attente de connexion...'
}

onMounted(() => {
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    })
    window.google.accounts.id.renderButton(
      googleButton.value,
      { theme: 'outline', size: 'large' }
    )
  } else {
    message.value = 'Erreur : SDK Google non chargé.'
  }
})
</script>

<style scoped>
/* Tu peux personnaliser davantage ici */
</style>
