import axios from 'axios'

const API_URL = 'http://localhost:5032/api/auth'

// Google login with selected role (Employee, Manager, SuperAdmin)
export async function loginWithGoogle(idToken, role) {
  try {
    const res = await axios.post(`${API_URL}/google`, { idToken, role })
    return res.data
  } catch (err) {
    console.error('Erreur dans authService:', err)
    throw err
  }
}

// Retrieve the logged-in user's email from the JWT token
export function getCurrentUserEmail() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email || null
  } catch (e) {
    console.error('Erreur décodage JWT:', e)
    return null
  }
}

// Retrieve the logged-in user's role from the JWT token
export function getCurrentUserRole() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role || null
  } catch (e) {
    console.error('Erreur décodage JWT:', e)
    return null
  }
}
