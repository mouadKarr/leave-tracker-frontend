<script setup>
import { ref, onMounted } from 'vue'
import { getAllLeaves, approveLeaveById, rejectLeaveById } from '@/services/leaveService'
import { USER_ROLES, LEAVE_STATUSES, LEAVE_STATUS_LABELS, LEAVE_STATUS_CLASSES } from '@/utils/constants'

// ✅ Decode token to get email and role
function decodeToken() {
  const token = localStorage.getItem('token')
  if (!token) return {}
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.email || null,
      role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null
    }
  } catch (e) {
    console.error('JWT decoding error:', e)
    return {}
  }
}

const { email: currentEmail, role: currentRole } = decodeToken()

// ✅ Check permissions
if (![USER_ROLES.MANAGER, USER_ROLES.SUPERADMIN].includes(currentRole)) {
  alert("Access denied: you don't have the necessary rights.")
  window.location.href = '/'
}

const leaveRequests = ref([])
const loading = ref(true)
const error = ref(null)
const actionLoadingId = ref(null)

// Normalize email for comparison
function normalizeEmail(email) {
  return (email ?? '').toLowerCase().trim()
}

// Compare two emails
function isSameEmail(email1, email2) {
  return normalizeEmail(email1) === normalizeEmail(email2)
}

// Disable action buttons for managers on their own requests
function isActionDisabled(email) {
  return currentRole === USER_ROLES.MANAGER && isSameEmail(email, currentEmail)
}

// Fetch all leave requests
async function fetchLeaves() {
  loading.value = true
  error.value = null
  try {
    const res = await getAllLeaves()
    leaveRequests.value = Array.isArray(res) ? res : res?.$values ?? []
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || "Error loading leave requests."
  } finally {
    loading.value = false
  }
}

onMounted(fetchLeaves)

// Format a date string for display
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d) ? '' : d.toLocaleDateString('fr-FR')
}

// ✅ Use constants for status classes
function statusClass(status) {
  return `badge ${LEAVE_STATUS_CLASSES[status] || 'bg-secondary'}`
}

// Get status label text
function statusText(status) {
  return LEAVE_STATUS_LABELS[status] || 'Unknown'
}

// Text shown when actions are disabled
function actionStatusText(status) {
  if (status === LEAVE_STATUSES.APPROVED) return 'Already approved'
  if (status === LEAVE_STATUSES.REJECTED) return 'Already rejected'
  return '-'
}

// ✅ Actions: approve or reject leave requests
async function handleApprove(id) {
  if (!confirm("Do you confirm the approval of this request?")) return
  actionLoadingId.value = id
  try {
    await approveLeaveById(id)
    await fetchLeaves()
  } catch (error) {
    alert("Error approving the request.")
    console.error(error)
  } finally {
    actionLoadingId.value = null
  }
}

async function handleReject(id) {
  if (!confirm("Do you confirm the rejection of this request?")) return
  actionLoadingId.value = id
  try {
    await rejectLeaveById(id)
    await fetchLeaves()
  } catch (error) {
    alert("Error rejecting the request.")
    console.error(error)
  } finally {
    actionLoadingId.value = null
  }
}
</script>

<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-center">Manager Dashboard</h2>

    <div v-if="loading" class="text-center fs-5 py-5">Loading requests...</div>
    <div v-else-if="error" class="alert alert-danger text-center">{{ error }}</div>
    <div v-else-if="leaveRequests.length === 0" class="text-center fs-5 py-5 text-muted">
      No requests found.
    </div>

    <div v-else class="table-responsive shadow rounded">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-primary text-center">
          <tr>
            <th>Employee</th>
            <th>Dates</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="leave in leaveRequests" :key="leave.id" class="align-middle">
            <td class="fw-semibold">{{ leave.userFullName ?? 'Unknown' }}</td>
            <td>{{ formatDate(leave.startDate) }} → {{ formatDate(leave.endDate) }}</td>
            <td>{{ leave.reason }}</td>
            <td class="text-center">
              <span :class="statusClass(leave.status)">
                {{ statusText(leave.status) }}
              </span>
            </td>
            <td class="text-center">
              <button
                v-if="leave.status === LEAVE_STATUSES.PENDING"
                @click="handleApprove(leave.id)"
                class="btn btn-success btn-sm me-2"
                :disabled="isActionDisabled(leave.userEmail) || actionLoadingId === leave.id"
                title="Approve request"
              >
                <span v-if="actionLoadingId === leave.id" class="spinner-border spinner-border-sm"></span>
                <span v-else>Approve</span>
              </button>
              <button
                v-if="leave.status === LEAVE_STATUSES.PENDING"
                @click="handleReject(leave.id)"
                class="btn btn-danger btn-sm"
                :disabled="isActionDisabled(leave.userEmail) || actionLoadingId === leave.id"
                title="Reject request"
              >
                <span v-if="actionLoadingId === leave.id" class="spinner-border spinner-border-sm"></span>
                <span v-else>Reject</span>
              </button>
              <span v-else class="fst-italic text-muted">
                {{ actionStatusText(leave.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-primary {
  background-color: #0d6efd !important;
  color: white;
}

.table-striped > tbody > tr:nth-of-type(odd) {
  background-color: #f8f9fa;
}

.table-hover > tbody > tr:hover {
  background-color: #e2e6ea;
  cursor: pointer;
}

.btn-sm {
  min-width: 85px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.btn-sm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fst-italic {
  font-style: italic;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
