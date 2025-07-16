<template>
  <div>
    <h1>Connexion Google</h1>
    <div ref="googleButton"></div>
    <p>{{ message }}</p>

    <div v-if="user">
      <p>FullName : {{ user.name }}</p>
      <p>Email : {{ user.email }}</p>
      <button @click="logout">Déconnexion</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithGoogle } from '@/services/authService'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const router = useRouter()

const message = ref('En attente de connexion...')
const user = ref(null)
const googleButton = ref(null)

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
      const decoded = decodeJwt(res.token)

      user.value = decoded
      message.value = `Bienvenue ${decoded.name} !`

      localStorage.setItem('token', res.token)
      if (res.userId) localStorage.setItem('userId', res.userId)

      router.push('/demande-conge')
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
