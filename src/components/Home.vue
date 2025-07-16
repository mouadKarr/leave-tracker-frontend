<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div class="text-center p-5 bg-white shadow rounded" style="max-width: 600px;">
        <div style="font-size: 4rem;">📅</div>
        <h2 class="text-primary mt-3">Bienvenue{{ user.name ? `, ${user.name}` : '' }} !</h2>
  
        <div v-if="user.email || user.role" class="mt-4 text-start">
          <p><strong>Email :</strong> {{ user.email || 'Non disponible' }}</p>
          <p v-if="user.role"><strong>Rôle :</strong> {{ user.role }}</p>
        </div>
  
        <p class="text-muted mt-3 fs-5">
          Cette plateforme vous permet de gérer facilement vos demandes de congés.
        </p>
        <p class="text-secondary fst-italic mt-2">
          Utilisez le menu à gauche pour faire une demande ou consulter vos demandes existantes.
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const user = ref({
    name: '',
    email: '',
    role: ''
  })
  
  function decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return {}
    }
  }
  
  onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    const decoded = decodeJwt(token)
    console.log('JWT décodé:', decoded)

    user.value.name =
      decoded.name || 
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/name'] || 
      ''
    
    user.value.email = 
      decoded.email || 
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/emailaddress'] || 
      ''
    
    user.value.role = 
      decoded.role || 
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
      ''
  }
})
  </script>
  