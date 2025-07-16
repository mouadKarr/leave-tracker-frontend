<template>
  <form @submit.prevent="submitLeave" class="leave-form">
    <input type="date" v-model="startDate" required class="input-date" />
    <input type="date" v-model="endDate" required class="input-date" />
    <textarea v-model="reason" placeholder="Motif" required class="textarea-reason"></textarea>
    <button type="submit" class="btn-submit">Demander</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { submitLeaveRequest } from '@/services/leaveService'
import '@/style/LeaveRequestForm.css'

const startDate = ref('')
const endDate = ref('')
const reason = ref('')

const submitLeave = async () => {
  try {
    const token = localStorage.getItem('token')
    await submitLeaveRequest({
      startDate: startDate.value,
      endDate: endDate.value,
      reason: reason.value
    }, token)
    alert("Demande envoyée avec succès")
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
  } catch (err) {
    console.error(err)
    alert("Erreur lors de l'envoi")
  }
}
</script>
