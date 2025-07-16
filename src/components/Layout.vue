<template>
    <div class="d-flex min-vh-100">
      <!-- Sidebar hoverable -->
      <nav
        class="sidebar bg-dark text-white d-flex flex-column align-items-start p-2"
      >
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
          <li class="nav-item w-100 mt-auto">
            <button @click="logout" class="btn btn-outline-light w-100">
              🚪 <span class="label">Déconnexion</span>
            </button>
          </li>
        </ul>
      </nav>
  
      <!-- Contenu principal -->
      <div class="flex-grow-1 bg-light p-4">
        <router-view />
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .sidebar {
    width: 60px;
    transition: width 0.3s;
    overflow-x: hidden;
  }
  
  .sidebar:hover {
    width: 200px;
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
  </style>
  