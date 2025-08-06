import axios from 'axios'

const API_URL = 'http://localhost:5032/api/leave'

// Instance Axios avec gestion du token
const apiClient = axios.create({
  baseURL: API_URL,
})

// Intercepteur pour ajouter le Bearer Token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gestion des erreurs uniformisée
function handleApiError(error, customMessage) {
  console.error(customMessage, error)
  if (error.response && error.response.data && error.response.data.message) {
    throw new Error(error.response.data.message)
  }
  throw new Error('Une erreur est survenue, veuillez réessayer.')
}

// Soumettre une nouvelle demande
export async function submitLeaveRequest(data) {
  try {
    const response = await apiClient.post('', data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Erreur lors de la soumission de la demande:')
  }
}

// Récupérer toutes les demandes pour un utilisateur
export async function getUserLeaveRequests(userId) {
  try {
    const response = await apiClient.get(`/user/${userId}`)
    return response.data
  } catch (error) {
    handleApiError(error, 'Erreur lors de la récupération des demandes utilisateur:')
  }
}

// Récupérer toutes les demandes (Manager ou SuperAdmin)
export async function getAllLeaves() {
  try {
    const response = await apiClient.get('')
    return response.data
  } catch (error) {
    handleApiError(error, 'Erreur lors de la récupération de toutes les demandes:')
  }
}

// Récupérer le planning public des congés (sans token, sans restriction)
export async function getPublicLeavePlanning() {
  try {
    // Appel direct sans token à l'endpoint public
    const response = await axios.get(`${API_URL}/public-planning`)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération du planning public:', error)
    return []
  }
}

// Récupérer les données pour le calendrier (toutes les demandes, manager)
export async function getLeavesForCalendar() {
  try {
    const response = await apiClient.get('/calendar')
    return response.data
  } catch (error) {
    handleApiError(error, 'Erreur lors de la récupération des données pour le calendrier:')
  }
}

// Approuver une demande par ID (Manager)
export async function approveLeaveById(id, adminComment = '') {
  try {
    await apiClient.put(`/${id}/approve`, { adminComment })
  } catch (error) {
    handleApiError(error, `Erreur lors de l’approbation de la demande ${id}:`)
  }
}

// Rejeter une demande par ID (Manager)
export async function rejectLeaveById(id, adminComment = '') {
  try {
    await apiClient.put(`/${id}/reject`, { adminComment })
  } catch (error) {
    handleApiError(error, `Erreur lors du rejet de la demande ${id}:`)
  }
}

// Annuler une demande par ID (Employé)
export async function cancelLeaveById(id) {
  try {
    const response = await apiClient.delete(`/${id}/cancel`)
    return response.data
  } catch (error) {
    handleApiError(error, `Erreur lors de l’annulation de la demande ${id}:`)
  }
}
