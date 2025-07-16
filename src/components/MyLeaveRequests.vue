<template>
  <div v-if="leaveRequests.length">
    <h2>Mes demandes de congé</h2>
    <ul>
      <li v-for="leave in leaveRequests" :key="leave.id">
        Du {{ leave.startDate }} au {{ leave.endDate }} - {{ leave.status }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserLeaveRequests } from '@/services/leaveService'

const leaveRequests = ref([])

onMounted(async () => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')
  leaveRequests.value = await getUserLeaveRequests(userId, token)
})
</script>
