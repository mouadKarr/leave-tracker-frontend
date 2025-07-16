<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <form
      @submit.prevent="submitLeave"
      class="p-4 bg-white rounded shadow w-100"
      style="max-width: 500px;"
    >
      <h3 class="mb-4 text-center text-primary">Demande de Congé</h3>

      <div class="mb-3">
        <label for="startDate" class="form-label">📅 Date de début</label>
        <input
          type="date"
          id="startDate"
          v-model="startDate"
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
          required
          class="form-control"
          rows="4"
        ></textarea>
      </div>

      <!-- Envoyer -->
      <button type="submit" class="btn btn-primary w-100">
        📤 Envoyer la demande
      </button>

      <!-- Consulter mes demandes -->
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

const submitLeave = async () => {
  try {
    const token = localStorage.getItem('token')
    await submitLeaveRequest({
      startDate: startDate.value,
      endDate: endDate.value,
      reason: reason.value,
    }, token)
    alert("✅ Demande envoyée avec succès")
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
  } catch (err) {
    console.error(err)
    alert("❌ Erreur lors de l'envoi")
  }
}

const goToMyRequests = () => {
  router.push('/mes-demandes')
}
</script>
