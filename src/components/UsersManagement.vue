<template>
    <div>
      <h2 class="mb-4">Gestion des utilisateurs</h2>
  
      <div v-if="loading" class="alert alert-info rounded">
        Chargement en cours...
      </div>
      <div v-if="error" class="alert alert-danger rounded">
        {{ error }}
      </div>
  
      <div v-if="!loading && !error">
        <div v-if="users.length === 0" class="alert alert-warning rounded">
          Aucun utilisateur trouvé.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover align-middle rounded" style="overflow: hidden;">
            <thead class="table-dark">
              <tr>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Rôle</th>
                <th style="width: 200px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.fullName }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <div v-if="isCurrentUser(user)">
                    <span class="badge" :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </div>
                  <div v-else>
                    <select
                      v-model="editedRoles[user.id]"
                      class="form-select form-select-sm rounded"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div v-if="!isCurrentUser(user)" class="d-flex gap-2">
                    <button
                      @click="saveUserRole(user)"
                      class="btn btn-sm btn-primary rounded"
                      :disabled="editedRoles[user.id] === user.role"
                      title="Enregistrer le rôle"
                    >
                      Enregistrer
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="btn btn-sm btn-danger rounded"
                      title="Supprimer cet utilisateur"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const editedRoles = ref({})
  
  const currentUserEmail = (() => {
    const token = localStorage.getItem('token')
    if (!token) return ''
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = atob(base64)
      const decoded = JSON.parse(jsonPayload)
      return decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || ''
    } catch {
      return ''
    }
  })()
  
  const apiClient = axios.create({
    baseURL: 'http://localhost:5032/api/users',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  
  function isCurrentUser(user) {
    return user.email.toLowerCase() === currentUserEmail.toLowerCase()
  }
  
  function normalizeRole(role) {
    return ['Manager', 'SuperAdmin'].includes(role) ? role : 'Employee'
  }
  
  function getRoleBadgeClass(role) {
    switch (role) {
      case 'Manager':
        return 'bg-warning text-dark'
      case 'SuperAdmin':
        return 'bg-success'
      default:
        return 'bg-secondary'
    }
  }
  
  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.get('')
      users.value = res.data.map(u => ({
        ...u,
        role: normalizeRole(u.role)
      }))
      editedRoles.value = {}
      users.value.forEach(u => {
        editedRoles.value[u.id] = u.role
      })
    } catch (err) {
      console.error(err)
      if (err.response) {
        error.value = `Erreur ${err.response.status} : ${err.response.data?.message || err.response.statusText}`
      } else {
        error.value = err.message
      }
    } finally {
      loading.value = false
    }
  }
  
  async function saveUserRole(user) {
    if (isCurrentUser(user)) {
      alert("Vous ne pouvez pas modifier votre propre rôle.")
      return
    }
    try {
      await apiClient.put(`/${user.id}/role`, { role: editedRoles.value[user.id] })
      alert(`Rôle de ${user.fullName} mis à jour.`)
      await fetchUsers()
    } catch (err) {
      alert("Erreur lors de la mise à jour du rôle.")
      await fetchUsers()
    }
  }
  
  async function deleteUser(user) {
    if (!confirm(`Confirmez la supprission de ${user.fullName}.`)) {
      return
    }
    try {
      await apiClient.delete(`/${user.id}`)
      alert(`Utilisateur ${user.fullName} supprimé.`)
      await fetchUsers()
    } catch (err) {
      alert("Erreur lors de la suppression de l'utilisateur.")
    }
  }
  
  onMounted(fetchUsers)
  </script>
  
  <style scoped>
  .table.rounded {
    border-radius: 12px;
    overflow: hidden;
  }
  
  .form-select.rounded {
    border-radius: 8px !important;
  }
  
  .btn.rounded {
    border-radius: 8px !important;
  }
  
  .badge {
    font-size: 0.9rem;
    padding: 0.4em 0.7em;
    border-radius: 0.6em;
  }
  
  .d-flex {
    display: flex;
  }
  
  .gap-2 {
    gap: 0.5rem;
  }
  </style>
  