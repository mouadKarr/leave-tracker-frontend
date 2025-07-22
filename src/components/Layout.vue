<template>
  <div class="d-flex min-vh-100">
    <nav class="sidebar bg-dark text-white d-flex flex-column align-items-start p-2">
      <h5 class="text-white mb-4 px-2 d-flex align-items-center">
        <span>📅</span>
        <span class="label ms-2">Leave Tracker</span>
      </h5>
      <ul class="nav flex-column w-100">
        <li class="nav-item w-100 mb-2">
          <router-link to="/" class="nav-link text-white px-3">
            🏠 <span class="label">Accueil</span>
          </router-link>
        </li>
        <li class="nav-item w-100 mb-2">
          <router-link to="/demande-conge" class="nav-link text-white px-3">
            📤 <span class="label">Demande</span>
          </router-link>
        </li>
        <li class="nav-item w-100 mb-2">
          <router-link to="/mes-demandes" class="nav-link text-white px-3">
            📄 <span class="label">Mes demandes</span>
          </router-link>
        </li>

        <li v-if="userIsManagerOrSuperAdmin" class="nav-item w-100 mb-2">
          <router-link to="/manager" class="nav-link text-white px-3">
            🛠 <span class="label">Manager</span>
          </router-link>
        </li>

        <li v-if="userIsSuperAdmin" class="nav-item w-100 mb-2">
          <router-link to="/admin/users" class="nav-link text-white px-3">
            👤 <span class="label">Gestion des utilisateurs</span>
          </router-link>
        </li>

        <li class="nav-item w-100 mt-auto">
          <button @click="logout" class="btn btn-outline-light w-100">
            🚪 <span class="label">Déconnexion</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="flex-grow-1 bg-light p-4">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref({ role: '' })

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('user')
  router.push('/login')
}

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = atob(base64)
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}

const userIsManagerOrSuperAdmin = computed(() => {
  return user.value.role === 'Manager' || user.value.role === 'SuperAdmin'
})

const userIsSuperAdmin = computed(() => user.value.role === 'SuperAdmin')

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    const decoded = decodeJwt(token)
    user.value.role =
      decoded.role ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      ''
  }
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 60px;
  height: 100vh;
  transition: width 0.3s;
  overflow-x: hidden;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;
  box-sizing: border-box;
  background-color: #212529;
  z-index: 1000;
}

.sidebar:hover {
  width: 300px;
}

.sidebar ul.nav {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  white-space: nowrap;
}

.label {
  display: none;
  transition: opacity 0.3s;
  white-space: nowrap;
  margin-left: 10px;
}

.sidebar:hover .label {
  display: inline;
  opacity: 1;
}

.nav-link {
  transition: background-color 0.3s, color 0.3s;
  border-radius: 4px;
  color: white !important;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white !important;
  text-decoration: none;
}

.nav-item.mt-auto {
  margin-top: auto;
  flex-shrink: 0;
}

.flex-grow-1 {
  margin-left: 60px;
  transition: margin-left 0.3s;
}

.sidebar:hover ~ .flex-grow-1 {
  margin-left: 300px;
}
</style>
