<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <form
      @submit.prevent="submitLeave"
      class="p-4 bg-white rounded shadow w-100"
      style="max-width: 800px;"
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
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary w-100">📤 Envoyer la demande</button>

      <button
        type="button"
        class="btn btn-outline-secondary mt-3 w-100"
        @click="goToMyRequests"
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

const today = new Date().toISOString().split('T')[0]

async function submitLeave() {
  if (endDate.value < startDate.value) {
    alert("❗ La date de fin ne peut pas être avant la date de début.")
    return
  }
  try {
    await submitLeaveRequest({
      startDate: startDate.value,
      endDate: endDate.value,
      reason: reason.value,
    })
    alert("✅ Demande envoyée avec succès")
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
  } catch (err) {
    console.error(err)
    alert("❌ Erreur lors de l'envoi")
  }
}

function goToMyRequests() {
  router.push('/mes-demandes')
}
</script>
