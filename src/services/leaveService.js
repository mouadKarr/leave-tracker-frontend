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

// Submit a new leave request
export async function submitLeaveRequest(data) {
  try {
    const response = await apiClient.post('', data)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la soumission de la demande:', error)
    throw error
  }
}

// Get all leave requests for a user
export async function getUserLeaveRequests(userId) {
  try {
    const response = await apiClient.get(`/user/${userId}`)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes utilisateur:', error)
    throw error
  }
}

// Get all leave requests (manager)
export async function getAllLeaves() {
  try {
    const response = await apiClient.get('')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les demandes:', error)
    throw error
  }
}

// Approve a leave request by ID
export async function approveLeaveById(id) {
  try {
    await apiClient.put(`/${id}/approve`)
  } catch (error) {
    console.error(`Erreur lors de l’approbation de la demande ${id}:`, error)
    throw error
  }
}

// Reject a leave request by ID
export async function rejectLeaveById(id) {
  try {
    await apiClient.put(`/${id}/reject`)
  } catch (error) {
    console.error(`Erreur lors du rejet de la demande ${id}:`, error)
    throw error
  }
}

// Cancel a leave request by ID
export async function cancelLeaveById(id) {
  try {
    const response = await apiClient.delete(`/${id}/cancel`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de l’annulation de la demande ${id}:`, error)
    throw error
  }
}
