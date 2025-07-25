<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="p-4 bg-white rounded shadow" style="max-width: 600px; width: 100%;">
      <h1 class="mb-3 text-center text-primary">Google Sign-In</h1>

      <div class="mb-3">
        <label for="role" class="form-label">Choose your role:</label>
        <select id="role" v-model="selectedRole" class="form-select" :disabled="loading">
          <option
            v-for="role in roleOptions"
            :key="role"
            :value="role"
          >
            {{ roleLabels[role] ?? role }}
          </option>
        </select>
      </div>

      <div ref="googleButton" class="d-flex justify-content-center mb-3"></div>

      <p class="text-center" :class="messageClass">{{ message }}</p>

      <div v-if="user" class="text-center mt-4">
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
        <button @click="logout" class="btn btn-danger mt-3 w-100" :disabled="loading">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithGoogle } from '@/services/authService'
import { USER_ROLES, ROLE_OPTIONS, ROLE_LABELS } from '@/utils/constants.js'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const router = useRouter()

const message = ref('Waiting for sign-in...')
const user = ref(null)
const selectedRole = ref(USER_ROLES.EMPLOYEE) // default value from constants
const googleButton = ref(null)
const loading = ref(false)
const hasError = ref(false)

const roleLabels = ROLE_LABELS
const roleOptions = ROLE_OPTIONS

const messageClass = computed(() => {
  if (hasError.value) return 'text-danger fw-semibold'
  if (message.value.includes('Welcome')) return 'text-success fw-semibold'
  return 'text-muted'
})

// Decode JWT token payload
function decodeJwt(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = atob(base64)
  return JSON.parse(jsonPayload)
}

// Handle Google sign-in response
async function handleCredentialResponse(response) {
  if (!response.credential) {
    message.value = 'Error: No token received.'
    hasError.value = true
    return
  }
  loading.value = true
  try {
    const res = await loginWithGoogle(response.credential, selectedRole.value)
    const decoded = decodeJwt(res.token)

    user.value = {
      name: decoded.name || decoded.fullname || decoded.given_name || 'User',
      email: decoded.email || decoded.email_address || 'Email not available',
      role: decoded.role || USER_ROLES.EMPLOYEE
    }

    message.value = `Welcome ${user.value.name}!`
    hasError.value = false

    localStorage.setItem('token', res.token)
    if (res.userId) localStorage.setItem('userId', res.userId)

    // Redirect based on role
    if ([USER_ROLES.SUPERADMIN, USER_ROLES.MANAGER].includes(user.value.role)) {
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
      message.value = 'Error during sign-in, please try again.'
      console.error('Backend sign-in error:', err)
    }
  } finally {
    loading.value = false
  }
}

// Logout the user and reset state
function logout() {
  user.value = null
  hasError.value = false
  selectedRole.value = USER_ROLES.EMPLOYEE
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  message.value = 'Waiting for sign-in...'
  if (window.google) {
    window.google.accounts.id.cancel()
    window.google.accounts.id.renderButton(
      googleButton.value,
      { theme: 'outline', size: 'large' }
    )
  }
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
    message.value = 'Error: Google SDK not loaded.'
    hasError.value = true
  }
})
</script>
