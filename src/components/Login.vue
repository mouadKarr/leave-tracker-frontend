<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="p-4 bg-white rounded shadow" style="max-width: 600px; width: 100%;">
      <h1 class="mb-3 text-center text-primary">Connexion Google</h1>

      <div class="mb-3">
        <label for="role" class="form-label">Choisissez votre rôle :</label>
        <select id="role" v-model="selectedRole" class="form-select" :disabled="loading">
          <option value="Employee">Employé</option>
          <option value="Manager">Gestionnaire</option>
          <option value="SuperAdmin">Super Administrateur</option>
        </select>
      </div>

      <div ref="googleButton" class="d-flex justify-content-center mb-3"></div>

      <p class="text-center" :class="messageClass">{{ message }}</p>

      <div v-if="user" class="text-center mt-4">
        <p><strong>Nom :</strong> {{ user.name }}</p>
        <p><strong>Email :</strong> {{ user.email }}</p>
        <p><strong>Rôle :</strong> {{ user.role }}</p>
        <button @click="logout" class="btn btn-danger mt-3 w-100" :disabled="loading">Déconnexion</button>
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
const selectedRole = ref('Employee')
const googleButton = ref(null)
const loading = ref(false)
const hasError = ref(false)

const messageClass = computed(() => {
  if (hasError.value) return 'text-danger fw-semibold'
  if (message.value.includes('Bienvenue')) return 'text-success fw-semibold'
  return 'text-muted'
})

function decodeJwt(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = atob(base64)
  return JSON.parse(jsonPayload)
}

async function handleCredentialResponse(response) {
  if (!response.credential) {
    message.value = 'Erreur : Aucun jeton reçu.'
    return
  }
  loading.value = true
  try {
    const res = await loginWithGoogle(response.credential, selectedRole.value)
    const decoded = decodeJwt(res.token)

    user.value = {
      name: decoded.name || decoded.fullname || decoded.given_name || 'Utilisateur',
      email: decoded.email || decoded.email_address || 'Email non disponible',
      role: decoded.role || 'Employee'
    }

    message.value = `Bienvenue ${user.value.name} !`
    hasError.value = false

    localStorage.setItem('token', res.token)
    if (res.userId) localStorage.setItem('userId', res.userId)

    if (user.value.role === 'SuperAdmin' || user.value.role === 'Manager') {
      router.push('/Home')
    } else {
      router.push('/')
    }
  } catch (err) {
    hasError.value = true
    if (err.response && err.response.status === 409) {
      message.value = err.response.data.message
      alert(message.value)
    } else {
      message.value = 'Erreur lors de la connexion, veuillez réessayer.'
      console.error('Erreur connexion backend:', err)
    }
  } finally {
    loading.value = false
  }
}

function logout() {
  user.value = null
  hasError.value = false
  selectedRole.value = 'Employee'
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  message.value = 'En attente de connexion...'
}

onMounted(() => {
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse
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
