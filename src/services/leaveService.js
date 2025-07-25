import axios from 'axios'

const API_URL = 'http://localhost:5032/api/leave'

// Create an axios instance with automatic token handling
const apiClient = axios.create({
  baseURL: API_URL,
})

// Interceptor to add Bearer token on every request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Generic error handler for consistent frontend behavior
function handleApiError(error, customMessage) {
  console.error(customMessage, error)
  if (error.response && error.response.data && error.response.data.message) {
    throw new Error(error.response.data.message)
  }
  throw new Error('Une erreur est survenue, veuillez réessayer.')
}

// Submit a new leave request
export async function submitLeaveRequest(data) {
  try {
    const response = await apiClient.post('', data)
    return response.data
  } catch (error) {
    handleApiError(error, 'Erreur lors de la soumission de la demande:')
  }
}

// Get all leave requests for a user
export async function getUserLeaveRequests(userId) {
  try {
    const response = await apiClient.get(`/user/${userId}`)
    return response.data
  } catch (error) {
    handleApiError(error, 'Erreur lors de la récupération des demandes utilisateur:')
  }
}

// Get all leave requests (manager or super admin)
export async function getAllLeaves() {
  try {
    const response = await apiClient.get('')
    return response.data
  } catch (error) {
    handleApiError(error, 'Erreur lors de la récupération de toutes les demandes:')
  }
}

// Approve a leave request by ID
export async function approveLeaveById(id) {
  try {
    await apiClient.put(`/${id}/approve`)
  } catch (error) {
    handleApiError(error, `Erreur lors de l’approbation de la demande ${id}:`)
  }
}

// Reject a leave request by ID
export async function rejectLeaveById(id) {
  try {
    await apiClient.put(`/${id}/reject`)
  } catch (error) {
    handleApiError(error, `Erreur lors du rejet de la demande ${id}:`)
  }
}

// Cancel a leave request by ID
export async function cancelLeaveById(id) {
  try {
    const response = await apiClient.delete(`/${id}/cancel`)
    return response.data
  } catch (error) {
    handleApiError(error, `Erreur lors de l’annulation de la demande ${id}:`)
  }
}
