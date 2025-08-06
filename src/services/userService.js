import axios from 'axios'

const API_URL = 'http://localhost:5032/api/users'

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

export async function getUsers() {
  try {
    const response = await apiClient.get('')
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs", error)
    return []
  }
}
