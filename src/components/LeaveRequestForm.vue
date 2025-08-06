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
            <li v-for="h in getPublicHolidaysNearDate(startDate)" :key="h.date" style="color:gray; font-size: 0.9em">
              {{ formatDateToYMD(h.date) }} - {{ h.name }}
            </li>
          </ul>
        </small>
      </div>

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
            <li v-for="h in getPublicHolidaysNearDate(endDate)" :key="h.date" style="color:gray; font-size: 0.9em">
              {{ formatDateToYMD(h.date) }} - {{ h.name }}
            </li>
          </ul>
        </small>
      </div>

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
const publicHolidays = ref([])
const errorMessage = ref('')

const today = new Date().toISOString().split('T')[0]

function formatDateToYMD(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(async () => {
  publicHolidays.value = await getPublicHolidays('FR', new Date().getFullYear())
})

const isPublicHoliday = (dateStr) => {
  const formatted = formatDateToYMD(dateStr)
  return publicHolidays.value.some(h => formatDateToYMD(h.date) === formatted)
}

const getPublicHolidaysInRange = (start, end) => {
  if (!start || !end) return []
  let currentDate = new Date(start)
  const lastDate = new Date(end)
  const matched = []

  while (currentDate <= lastDate) {
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const formatted = formatDateToYMD(currentDate)
      const holiday = publicHolidays.value.find(h => formatDateToYMD(h.date) === formatted)
      if (holiday) matched.push(holiday)
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return matched
}

const getPublicHolidaysNearDate = (dateStr) => {
  if (!dateStr) return []
  const date = new Date(dateStr)
  return publicHolidays.value.filter(h => {
    const d = new Date(h.date)
    const diffDays = Math.abs((d - date) / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  })
}

const startDateClass = computed(() => (isPublicHoliday(startDate.value) ? 'is-holiday' : ''))
const endDateClass = computed(() => (isPublicHoliday(endDate.value) ? 'is-holiday' : ''))

function isWeekend(date) {
  const d = new Date(date)
  const day = d.getDay()
  return day === 0 || day === 6
}

function hasWeekendInRange(start, end) {
  let currentDate = new Date(start)
  const lastDate = new Date(end)

  while (currentDate <= lastDate) {
    if (isWeekend(currentDate)) {
      return true
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return false
}

watch(startDate, async (newVal) => {
  if (newVal) {
    const year = new Date(newVal).getFullYear()
    publicHolidays.value = await getPublicHolidays('FR', year)

    if (isPublicHoliday(newVal)) {
      errorMessage.value = "⚠️ La date de début est un jour férié."
    } else if (isWeekend(newVal)) {
      errorMessage.value = "⚠️ La date de début est un week-end."
    } else {
      errorMessage.value = ''
    }
  }
})

watch(endDate, async (newVal) => {
  if (newVal) {
    const year = new Date(newVal).getFullYear()
    if (year !== new Date(startDate.value).getFullYear()) {
      publicHolidays.value = await getPublicHolidays('FR', year)
    }

    if (isPublicHoliday(newVal)) {
      errorMessage.value = "⚠️ La date de fin est un jour férié."
    } else if (isWeekend(newVal)) {
      errorMessage.value = "⚠️ La date de fin est un week-end."
    } else {
      errorMessage.value = ''
    }
  }
})

async function submitLeave() {
  errorMessage.value = ''

  if (!startDate.value || !endDate.value) {
    errorMessage.value = "❗ Veuillez renseigner les dates de début et de fin."
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
    })
    alert(`✅ Demande envoyée avec succès.`)
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
  } catch (err) {
    console.error('Erreur lors de la soumission:', err)
    const backendMessage = err?.response?.data?.message
    errorMessage.value = backendMessage || "❌ Erreur lors de l'envoi de la demande, veuillez réessayer."
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
