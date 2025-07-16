<template>
  <div class="container py-5">
    <div class="card shadow-lg">
      <div class="card-header bg-primary text-white">
        <h3 class="mb-0">Mes demandes de congé</h3>
      </div>
      <div class="card-body">
        <div v-if="leaveRequests.length">
          <div class="table-responsive">
            <table class="table table-hover align-middle text-center">
              <thead class="table-light">
                <tr>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leave in leaveRequests" :key="leave.id">
                  <td>{{ formatDate(leave.startDate) }}</td>
                  <td>{{ formatDate(leave.endDate) }}</td>
                  <td>
                    <span class="badge" :class="statusClass(leave.status)">
                      {{ statusLabels[leave.status] }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-center text-muted py-4">
          <i class="bi bi-info-circle me-2"></i>
          Aucune demande de congé pour l’instant.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserLeaveRequests } from '@/services/leaveService'

const leaveRequests = ref([])

const statusLabels = {
  0: 'En attente',
  1: 'Validé',
  2: 'Rejeté'
}

function statusClass(status) {
  switch (status) {
    case 0:
      return 'bg-warning text-dark'
    case 1:
      return 'bg-success'
    case 2:
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')

  try {
    const result = await getUserLeaveRequests(userId, token)
    // certains backends retournent leurs listes dans result.$values
    leaveRequests.value = result.$values ?? result
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de congé:', error)
  }
})
</script>
