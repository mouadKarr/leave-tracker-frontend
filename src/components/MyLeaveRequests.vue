<template>
  <div class="container py-5">
    <div class="card shadow-lg">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h3 class="mb-0">My Leave Requests</h3>
        <span v-if="loading" class="spinner-border spinner-border-sm text-light"></span>
      </div>

      <div class="card-body">
        <!-- List of leave requests -->
        <div v-if="leaveRequests.length">
          <div class="table-responsive">
            <table class="table table-hover align-middle text-center">
              <thead class="table-light">
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leave in leaveRequests" :key="leave.id">
                  <td>{{ formatDate(leave.startDate) }}</td>
                  <td>{{ formatDate(leave.endDate) }}</td>
                  <td>{{ leave.reason }}</td>
                  <td>
                    <span class="badge" :class="statusClass(leave.status)">
                      {{ LEAVE_STATUS_LABELS[leave.status] ?? 'Unknown' }}
                    </span>
                  </td>
                  <td>
                    <button
                      v-if="leave.status === LEAVE_STATUSES.PENDING"
                      @click="cancelLeave(leave.id)"
                      class="btn btn-sm btn-danger w-100"
                      :disabled="loadingActionId === leave.id"
                    >
                      <span v-if="loadingActionId === leave.id" class="spinner-border spinner-border-sm"></span>
                      <span v-else>Cancel</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No leave requests -->
        <div v-else class="text-center text-muted py-4">
          <i class="bi bi-info-circle me-2"></i>
          No leave requests yet.
        </div>

        <!-- Error message -->
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserLeaveRequests, cancelLeaveById } from '@/services/leaveService'
import { LEAVE_STATUSES, LEAVE_STATUS_LABELS, LEAVE_STATUS_CLASSES } from '@/utils/constants'

const leaveRequests = ref([])
const loading = ref(false)
const loadingActionId = ref(null)
const error = ref(null)

// ✅ Use constants for labels and CSS classes
function statusClass(status) {
  return LEAVE_STATUS_CLASSES[status] || 'bg-secondary'
}

// Format a date string to French locale date format
function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

// Fetch leave requests for the current user
async function fetchLeaves() {
  loading.value = true
  error.value = null
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) throw new Error("User not authenticated.")
    const result = await getUserLeaveRequests(userId)
    leaveRequests.value = result.$values ?? result
  } catch (err) {
    console.error('Error fetching leave requests:', err)
    error.value = err.response?.data?.message || "Unable to fetch leave requests."
  } finally {
    loading.value = false
  }
}

// Cancel a leave request by ID
async function cancelLeave(id) {
  if (!confirm("Do you want to cancel this leave request?")) return
  loadingActionId.value = id
  try {
    await cancelLeaveById(id)
    leaveRequests.value = leaveRequests.value.filter(l => l.id !== id)
  } catch (err) {
    console.error("Error cancelling leave request:", err)
    alert(err.response?.data?.message || "Unable to cancel the leave request.")
  } finally {
    loadingActionId.value = null
  }
}

onMounted(fetchLeaves)
</script>

<style scoped>
.badge {
  font-size: 0.85rem;
  padding: 0.4em 0.7em;
  border-radius: 0.6em;
}
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
