<template>
    <div>
      <h2 class="mb-4">User Management</h2>
  
      <!-- Messages -->
      <div v-if="loading" class="alert alert-info rounded">Loading...</div>
      <div v-if="error" class="alert alert-danger rounded">{{ error }}</div>
  
      <div v-if="!loading && !error">
        <div v-if="users.length === 0" class="alert alert-warning rounded">
          No users found.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover align-middle rounded">
            <thead class="table-dark">
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style="width: 200px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.fullName }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <!-- Show a badge if it's the current logged-in user -->
                  <div v-if="isCurrentUser(user)">
                    <span class="badge" :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </div>
                  <!-- Otherwise, allow role change -->
                  <div v-else>
                    <select
                      v-model="editedRoles[user.id]"
                      class="form-select form-select-sm rounded"
                    >
                      <option v-for="role in ROLE_OPTIONS" :key="role" :value="role">
                        {{ role }}
                      </option>
                    </select>
                  </div>
                </td>
                <td>
                  <div v-if="!isCurrentUser(user)" class="d-flex gap-2">
                    <button
                      @click="saveUserRole(user)"
                      class="btn btn-sm btn-primary rounded"
                      :disabled="editedRoles[user.id] === user.role"
                      title="Save role"
                    >
                      Save
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="btn btn-sm btn-danger rounded"
                      title="Delete this user"
                    >
                      Delete
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
  import { USER_ROLES, ROLE_OPTIONS, ROLE_BADGE_CLASSES } from '@/utils/constants'
  
  // ✅ States
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const editedRoles = ref({})
  
  // ✅ Get current user email from JWT token
  const currentUserEmail = (() => {
    const token = localStorage.getItem('token')
    if (!token) return ''
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.email || ''
    } catch {
      return ''
    }
  })()
  
  // ✅ Axios instance with authorization token
  const apiClient = axios.create({
    baseURL: 'http://localhost:5032/api/users'
  })
  apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  
  // ✅ Utility functions
  function isCurrentUser(user) {
    return user.email.toLowerCase() === currentUserEmail.toLowerCase()
  }
  
  function normalizeRole(role) {
    return ROLE_OPTIONS.includes(role) ? role : USER_ROLES.EMPLOYEE
  }
  
  function getRoleBadgeClass(role) {
    return ROLE_BADGE_CLASSES[role] || ROLE_BADGE_CLASSES[USER_ROLES.EMPLOYEE]
  }
  
  // ✅ Fetch all users from API
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
        error.value = `Error ${err.response.status}: ${err.response.data?.message || err.response.statusText}`
      } else {
        error.value = err.message
      }
    } finally {
      loading.value = false
    }
  }
  
  // ✅ Update user role
  async function saveUserRole(user) {
    if (isCurrentUser(user)) {
      alert("You cannot change your own role.")
      return
    }
    try {
      await apiClient.put(`/${user.id}/role`, { role: editedRoles.value[user.id] })
      alert(`Role for ${user.fullName} updated.`)
      await fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || "Error updating role.")
      await fetchUsers()
    }
  }
  
  // ✅ Delete user
  async function deleteUser(user) {
    if (!confirm(`Confirm deletion of ${user.fullName}?`)) return
    try {
      await apiClient.delete(`/${user.id}`)
      alert(`User ${user.fullName} deleted.`)
      await fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user.")
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
  