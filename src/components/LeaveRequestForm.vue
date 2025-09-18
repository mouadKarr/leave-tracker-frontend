<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <form
      @submit.prevent="submitLeave"
      class="p-4 bg-white rounded shadow w-100"
      style="max-width: 800px;"
      novalidate
    >
      <div v-if="errorMessage" class="alert alert-danger mb-3" style="white-space: pre-line;">
        {{ errorMessage }}
      </div>

      <h3 class="mb-4 text-center text-primary">Demande de Congé</h3>

      <!-- Date de début -->
      <div class="mb-3">
        <label for="startDate" class="form-label">📅 Date de début</label>
        <input
          type="date"
          id="startDate"
          v-model="startDate"
          :min="today"
          required
          class="form-control"
          :class="startDateClass"
          :disabled="loading"
        />
        <small v-if="startDate && getPublicHolidaysNearDate(startDate).length" class="text-muted mt-1 d-block">
          ⚠️ Jours fériés proches :
          <ul class="mb-0 ps-3">
            <li
              v-for="h in getPublicHolidaysNearDate(startDate)"
              :key="h.date"
              style="color:gray; font-size: 0.9em"
            >
              {{ formatDateToYMD(h.date) }} - {{ h.name }}
            </li>
          </ul>
        </small>
      </div>

      <!-- Date de fin -->
      <div class="mb-3">
        <label for="endDate" class="form-label">📅 Date de fin</label>
        <input
          type="date"
          id="endDate"
          v-model="endDate"
          :min="startDate || today"
          required
          class="form-control"
          :class="endDateClass"
          :disabled="loading"
        />
        <small v-if="endDate && getPublicHolidaysNearDate(endDate).length" class="text-muted mt-1 d-block">
          ⚠️ Jours fériés proches :
          <ul class="mb-0 ps-3">
            <li
              v-for="h in getPublicHolidaysNearDate(endDate)"
              :key="h.date"
              style="color:gray; font-size: 0.9em"
            >
              {{ formatDateToYMD(h.date) }} - {{ h.name }}
            </li>
          </ul>
        </small>
      </div>
      <div class="mb-3">
        <label for="leaveType" class="form-label">🏷️ Type de congé</label>
        <select
          id="leaveType"
          v-model="leaveType"
          class="form-select"
          :disabled="loading"
          required
        >
          <option value="Congés Payés Acquis">Congés Payés Acquis</option>
          <option value="RTT/JRS/JRC">RTT/JRS/JRC</option>
        </select>
      </div>
      <!-- Motif -->
      <div class="mb-3">
        <label for="reason" class="form-label">✏️ Motif</label>
        <textarea
          id="reason"
          v-model="reason"
          placeholder="Ex: Vacances, rendez-vous médical..."
          class="form-control"
          rows="4"
          :disabled="loading"
        ></textarea>
      </div>

      <!-- Boutons -->
      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        📤 Envoyer la demande
      </button>

      <button
        type="button"
        class="btn btn-outline-secondary mt-3 w-100"
        @click="goToMyRequests"
        :disabled="loading"
      >
        📄 Consulter mes demandes
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { submitLeaveRequest } from '@/services/leaveService'
import { getPublicHolidays } from '@/services/holidayService'

const router = useRouter()

const startDate = ref('')
const endDate = ref('')
const reason = ref('')
const loading = ref(false)
const errorMessage = ref('')
const publicHolidays = ref([])
const leaveType = ref('')

const today = new Date().toISOString().split('T')[0]

// Format yyyy-mm-dd
function formatDateToYMD(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

onMounted(async () => {
  const year = new Date().getFullYear()
  publicHolidays.value = await getPublicHolidays('FR', year)
})

function isPublicHoliday(dateStr) {
  const formatted = formatDateToYMD(dateStr)
  return publicHolidays.value.some(h => formatDateToYMD(h.date) === formatted)
}

function isWeekend(dateStr) {
  const day = new Date(dateStr).getDay()
  return day === 0 || day === 6
}

function getPublicHolidaysNearDate(dateStr) {
  const target = new Date(dateStr)
  return publicHolidays.value.filter(h => {
    const diff = Math.abs(new Date(h.date) - target)
    return diff / (1000 * 60 * 60 * 24) <= 7
  })
}

// Classes pour mise en forme visuelle
const startDateClass = computed(() => (isPublicHoliday(startDate.value) ? 'is-holiday' : ''))
const endDateClass = computed(() => (isPublicHoliday(endDate.value) ? 'is-holiday' : ''))

// Vérifications dynamiques
watch([startDate, endDate], async ([start, end]) => {
  if (!start || !end) return

  const yearStart = new Date(start).getFullYear()
  const yearEnd = new Date(end).getFullYear()

  if (yearStart !== yearEnd) {
    const holidaysStart = await getPublicHolidays('FR', yearStart)
    const holidaysEnd = await getPublicHolidays('FR', yearEnd)
    publicHolidays.value = [...holidaysStart, ...holidaysEnd]
  }

  if (isWeekend(start)) {
    errorMessage.value = "⚠️ La date de début est un week-end."
  } else if (isPublicHoliday(start)) {
    errorMessage.value = "⚠️ La date de début est un jour férié."
  } else if (isWeekend(end)) {
    errorMessage.value = "⚠️ La date de fin est un week-end."
  } else if (isPublicHoliday(end)) {
    errorMessage.value = "⚠️ La date de fin est un jour férié."
  } else {
    errorMessage.value = ''
  }
})

async function submitLeave() {
  errorMessage.value = ''

  if (!startDate.value || !endDate.value) {
    errorMessage.value = "❗ Veuillez renseigner les dates de début et de fin."
    return
  }

  if (!leaveType.value) {
    errorMessage.value = "❗ Veuillez sélectionner un type de congé."
    return
  }

  if (endDate.value < startDate.value) {
    errorMessage.value = "❗ La date de fin ne peut pas être avant la date de début."
    return
  }

  loading.value = true
  try {
    await submitLeaveRequest({
      startDate: startDate.value,
      endDate: endDate.value,
      reason: reason.value.trim(),
      leaveType: leaveType.value
    })
    alert("✅ Demande envoyée avec succès.")
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
    leaveType.value = ''
  } catch (err) {
    const backendMessage = err?.response?.data?.message
    errorMessage.value = backendMessage || "❌ Erreur lors de l'envoi de la demande."
  } finally {
    loading.value = false
  }
}

function goToMyRequests() {
  router.push('/mes-demandes')
}
</script>

<style scoped>
input[type='date'].is-holiday {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>
