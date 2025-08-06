<script setup>
import { ref, onMounted } from 'vue'
import { getPublicLeavePlanning } from '@/services/leaveService'
import { getPublicHolidays } from '@/services/holidayService'
import { getUsers } from '@/services/userService'

// Reactive state variables
const users = ref([])
const daysInMonth = ref([])
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const publicHolidays = ref([])

// Generate all days of a given month/year
function generateDays(year, month) {
  const days = []
  const date = new Date(year, month - 1, 1)
  while (date.getMonth() === month - 1) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

// Get absence status for a given day
function getDayStatus(absences, day) {
  for (const absence of absences) {
    if (day >= absence.start && day <= absence.end) {
      return absence.status
    }
  }
  return null
}

// Format date as YYYY-MM-DD
function formatDateToYMD(date) {
  return date.toISOString().split('T')[0]
}

// Map status to CSS classes for coloring
const statusColors = {
  Approved: 'bg-success text-white',
  Pending: 'bg-warning text-dark',
  Rejected: 'bg-danger text-white'
}

// Detect weekends
function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

// Load leave planning and public holidays
async function loadPlanning() {
  daysInMonth.value = generateDays(selectedYear.value, selectedMonth.value)
  const allUsers = await getUsers()
  const [leaves, holidays] = await Promise.all([
    getPublicLeavePlanning(),
    getPublicHolidays('FR', selectedYear.value)
  ])

  publicHolidays.value = holidays.map(h => ({
    date: new Date(h.date),
    name: h.localName
  }))

  const filteredLeaves = leaves.filter(l => {
    const start = new Date(l.startDate)
    const end = new Date(l.endDate)
    return (
      start.getMonth() + 1 === selectedMonth.value ||
      end.getMonth() + 1 === selectedMonth.value ||
      (start.getMonth() + 1 < selectedMonth.value && end.getMonth() + 1 > selectedMonth.value)
    )
  })

  const grouped = {}
  filteredLeaves.forEach(l => {
    if (!grouped[l.userFullName]) grouped[l.userFullName] = []
    grouped[l.userFullName].push({
      start: new Date(l.startDate),
      end: new Date(l.endDate),
      status: l.status
    })
  })

  users.value = allUsers.map(user => ({
    name: user.fullName,
    absences: grouped[user.fullName] || []
  }))
}

onMounted(loadPlanning)

function isPublicHoliday(date) {
  return publicHolidays.value.some(h => formatDateToYMD(h.date) === formatDateToYMD(date))
}
</script>

<template>
    <div class="container-fluid my-4" style="min-height: 92vh;">
      <div class="card shadow-sm">
        <!-- Header -->
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 class="mb-0">Leave Planning</h4>
          <div class="d-flex">
            <select v-model="selectedYear" class="form-select me-2" @change="loadPlanning">
              <option v-for="y in [2024,2025,2026,2027,2028,2029,2030]" :key="y" :value="y">{{ y }}</option>
            </select>
            <select v-model="selectedMonth" class="form-select" @change="loadPlanning">
              <option v-for="m in 12" :key="m" :value="m">
                {{ new Date(0, m - 1).toLocaleString('fr', { month: 'long' }) }}
              </option>
            </select>
          </div>
        </div>
  
        <!-- Table -->
        <div class="card-body p-0" style="overflow-x: auto;">
          <table class="table table-bordered table-sm text-center align-middle mb-0" style="table-layout: auto; min-width: 1200px;">
            <thead class="table-light">
              <!-- Ligne 1 : Jours de la semaine -->
              <tr>
                <th class="text-start" style="min-width: 150px;">Employé</th>
                <th
                  v-for="day in daysInMonth"
                  :key="'weekday-' + day.toISOString()"
                  :class="isWeekend(day) ? 'bg-light text-muted' : ''"
                  style="min-width: 32px;"
                >
                  {{ day.toLocaleDateString('fr-FR', { weekday: 'short' }) }}
                </th>
              </tr>
  
              <!-- Ligne 2 : Numéros de jour -->
              <tr>
                <th class="text-start"></th>
                <th
                  v-for="day in daysInMonth"
                  :key="'day-' + day.toISOString()"
                  :class="isWeekend(day) ? 'bg-light text-muted' : ''"
                  style="min-width: 32px;"
                >
                  {{ day.getDate() }}
                </th>
              </tr>
            </thead>
  
            <tbody>
              <tr v-for="user in users" :key="user.name">
                <td class="fw-bold text-start" style="min-width: 150px;">{{ user.name }}</td>
                <td
                  v-for="day in daysInMonth"
                  :key="day.toISOString()"
                  :class="[
                    isPublicHoliday(day)
                        ? 'bg-info text-white' // priorité absolue
                        : statusColors[getDayStatus(user.absences, day)] || '',
                    !isPublicHoliday(day) && isWeekend(day) ? 'bg-light text-muted' : ''
                    ]"
                  :title="(() => {
                    const holiday = publicHolidays.find(h => formatDateToYMD(h.date) === formatDateToYMD(day))
                    return holiday ? holiday.name : ''
                  })()"
                  style="min-width: 32px; height: 32px;"
                >
                  <template v-if="publicHolidays.some(h => formatDateToYMD(h.date) === formatDateToYMD(day))">
                    JF
                  </template>
                  <template v-else>
                    {{ getDayStatus(user.absences, day) === 'Approved' ? 'A' :
                       getDayStatus(user.absences, day) === 'Pending' ? 'P' :
                       getDayStatus(user.absences, day) === 'Rejected' ? 'R' : '' }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Legend -->
        <div class="card-footer d-flex flex-wrap gap-2">
          <span class="badge bg-success">Approved</span>
          <span class="badge bg-warning text-dark">Pending</span>
          <span class="badge bg-danger">Rejected</span>
          <span class="badge bg-info text-white">Public Holiday</span>
          <span class="badge bg-light text-muted border">Weekend</span>
        </div>
      </div>
    </div>
  </template>
  
