<script setup>
import { ref, onMounted } from 'vue'
import { getAllLeaves, approveLeaveById, rejectLeaveById } from '@/services/leaveService'

function getCurrentUserEmail() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ??
           decoded.email ?? null
  } catch (e) {
    console.error('Erreur décodage JWT:', e)
    return null
  }
}

function getCurrentUserRole() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.role ??
           decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null
  } catch (e) {
    console.error('Erreur décodage JWT:', e)
    return null
  }
}

const currentEmail = getCurrentUserEmail()
const currentRole = getCurrentUserRole()

if (currentRole !== 'Manager' && currentRole !== 'SuperAdmin') {
  alert("Accès refusé : vous n'avez pas les droits nécessaires.")
  window.location.href = '/'
}

const leaveRequests = ref([])
const loading = ref(true)

function normalizeEmail(email) {
  return (email ?? '').toLowerCase().trim()
}

function isSameEmail(email1, email2) {
  return normalizeEmail(email1) === normalizeEmail(email2)
}

function isActionDisabled(email) {
  return (
    currentRole === 'Manager' && isSameEmail(email, currentEmail)
  )
}

async function fetchLeaves() {
  loading.value = true
  try {
    const res = await getAllLeaves()
    leaveRequests.value = Array.isArray(res) ? res : res?.$values ?? []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLeaves)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d) ? '' : d.toLocaleDateString('fr-FR')
}

function statusText(status) {
  return {
    Pending: 'En attente',
    Approved: 'Approuvé',
    Rejected: 'Rejeté'
  }[status] ?? 'Inconnu'
}

function statusClass(status) {
  return {
    Pending: 'badge bg-warning text-dark',
    Approved: 'badge bg-success',
    Rejected: 'badge bg-danger'
  }[status] ?? 'badge bg-secondary'
}

function actionStatusText(status) {
  if (status === 'Approved') return 'Déjà approuvé'
  if (status === 'Rejected') return 'Déjà rejeté'
  return '-'
}

async function handleApprove(id) {
  try {
    await approveLeaveById(id)
    await fetchLeaves()
  } catch (error) {
    alert("Erreur lors de l'approbation de la demande.")
    console.error(error)
  }
}

async function handleReject(id) {
  try {
    await rejectLeaveById(id)
    await fetchLeaves()
  } catch (error) {
    alert("Erreur lors du rejet de la demande.")
    console.error(error)
  }
}
</script>

<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-center">Tableau de bord du manager</h2>

    <div v-if="loading" class="text-center fs-5 py-5">Chargement des demandes...</div>
    <div v-else-if="leaveRequests.length === 0" class="text-center fs-5 py-5 text-muted">
      Aucune demande trouvée.
    </div>

    <div v-else class="table-responsive shadow rounded">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-primary text-center">
          <tr>
            <th>Employé</th>
            <th>Dates</th>
            <th>Motif</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="leave in leaveRequests" :key="leave.id" class="align-middle">
            <td class="fw-semibold">{{ leave.userFullName ?? 'Inconnu' }}</td>
            <td>{{ formatDate(leave.startDate) }} → {{ formatDate(leave.endDate) }}</td>
            <td>{{ leave.reason}}</td>
            <td class="text-center">
              <span :class="statusClass(leave.status)">
                {{ statusText(leave.status) }}
              </span>
            </td>
            <td class="text-center">
              <button
                v-if="leave.status === 'Pending'"
                @click="handleApprove(leave.id)"
                class="btn btn-success btn-sm me-2"
                :disabled="isActionDisabled(leave.userEmail)"
                title="Approuver la demande"
              >
                Approuver
              </button>
              <button
                v-if="leave.status === 'Pending'"
                @click="handleReject(leave.id)"
                class="btn btn-danger btn-sm"
                :disabled="isActionDisabled(leave.userEmail)"
                title="Rejeter la demande"
              >
                Rejeter
              </button>
              <span v-else class="fst-italic text-muted">
                {{ actionStatusText(leave.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-primary {
  background-color: #0d6efd !important;
  color: white;
}

.table-striped > tbody > tr:nth-of-type(odd) {
  background-color: #f8f9fa;
}

.table-hover > tbody > tr:hover {
  background-color: #e2e6ea;
  cursor: pointer;
}

.btn-sm {
  min-width: 85px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.btn-sm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fst-italic {
  font-style: italic;
}
</style>
