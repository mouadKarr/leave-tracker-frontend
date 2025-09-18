<template>
  <div class="container mx-auto p-6">
    <h1 class="title">Tableau de bord des soldes de congés</h1>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Mois Début</th>
            <th>Droits</th>
            <th>Pris en Compte Paie</th>
            <th>Solde Paie</th>
            <th>Posés Non Pris en Compte Paie</th>
            <th>Reste à Prendre</th>
            <th>Unité</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(balance, index) in leaveBalances" :key="index" class="body-row">
            <td>{{ balance.type }}</td>
            <td>{{ formatDate(balance.startMonth) }}</td>
            <td>{{ balance.rights }}</td>
            <td>{{ balance.takenIntoPay }}</td>
            <td>{{ balance.paidBalance }}</td>
            <td>{{ balance.notTakenIntoPay }}</td>
            <td>
              <span :class="['badge', badgeColor(balance.remaining)]">
                {{ balance.remaining }}
              </span>
            </td>
            <td>{{ balance.unit }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="info-text">Chargement des soldes...</div>
    <div v-if="error" class="error-text">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLeaveBalances } from '@/services/leaveBalanceService'

const leaveBalances = ref([])
const loading = ref(false)
const error = ref(null)

async function fetchBalances() {
  loading.value = true
  error.value = null
  try {
    const result = await getLeaveBalances()
    leaveBalances.value = result
  } catch (err) {
    error.value = err.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

function formatDate(dateInput) {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const options = { month: 'long' }
  return date.toLocaleDateString('fr-FR', options)
}

function badgeColor(value) {
  if (value <= 0) return 'red'
  if (value <= 2) return 'yellow'
  return 'green'
}

onMounted(() => {
  fetchBalances()
})
</script>

<style scoped>
.container {
  max-width: 2000px;
  margin: auto;
  padding: 7rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  padding-top: 4rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  color: #1e40af; /* un bleu profond et pro */
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-shadow: 1px 1px 3px rgba(30, 64, 175, 0.3);
  user-select: none;
  transition: color 0.3s ease;
}

.title:hover {
  color: #2563eb; /* bleu plus clair au survol */
  cursor: default;
}

.table-wrapper {
  overflow-x: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 15px rgb(0 0 0 / 0.1);
  border: 1px solid #d1d5db;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 700px;
}

thead tr {
  background-color: #f3f4f6;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.95rem;
  color: #374151;
  vertical-align: middle;
}

tbody tr.body-row:nth-child(even) {
  background-color: #fafafa;
  transition: background-color 0.3s ease;
}

tbody tr.body-row:hover {
  background-color: #e0f2fe;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  font-weight: 600;
  border-radius: 12px;
  color: white;
  font-size: 0.85rem;
  min-width: 36px;
  user-select: none;
}

.badge.red {
  background-color: #ef4444; /* rouge */
}

.badge.yellow {
  background-color: #f59e0b; /* orange */
  color: #1f2937;
}

.badge.green {
  background-color: #22c55e; /* vert */
}

.info-text {
  margin-top: 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.error-text {
  margin-top: 1rem;
  text-align: center;
  color: #b91c1c;
  font-weight: 600;
}
</style>
