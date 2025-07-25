<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <form
      @submit.prevent="submitLeave"
      class="p-4 bg-white rounded shadow w-100"
      style="max-width: 800px;"
      novalidate
    >
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
          :disabled="loading"
        />
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
          :disabled="loading"
        />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { submitLeaveRequest } from '@/services/leaveService'

const router = useRouter()
const startDate = ref('')
const endDate = ref('')
const reason = ref('')
const loading = ref(false)

const today = new Date().toISOString().split('T')[0]

async function submitLeave() {
  if (!startDate.value || !endDate.value) {
    alert("❗ Veuillez renseigner les dates de début et de fin.")
    return
  }

  if (endDate.value < startDate.value) {
    alert("❗ La date de fin ne peut pas être avant la date de début.")
    return
  }

  loading.value = true
  try {
    await submitLeaveRequest({
      startDate: startDate.value,
      endDate: endDate.value,
      reason: reason.value.trim(),
    })
    alert("✅ Demande envoyée avec succès")
    // Reset form
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
  } catch (err) {
    console.error(err)
    alert("❌ Erreur lors de l'envoi de la demande, veuillez réessayer.")
  } finally {
    loading.value = false
  }
}

function goToMyRequests() {
  router.push('/mes-demandes')
}
</script>
