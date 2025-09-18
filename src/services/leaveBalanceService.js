import axios from 'axios'

const API_URL = 'http://localhost:5032/api/leave'

const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function getLeaveBalances() {
  try {
    const response = await apiClient.get('/balance')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des soldes de congés', error)
    return []
  }
}
