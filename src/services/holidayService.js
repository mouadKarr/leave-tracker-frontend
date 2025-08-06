import axios from 'axios'

const API_URL = 'http://localhost:5032/api/publicholiday'

const apiClient = axios.create({
  baseURL: API_URL,
})

export async function getPublicHolidays(countryCode, year) {
  try {
    const response = await apiClient.get(`/${countryCode}/${year}`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des jours fériés", error)
    return []
  }
}
