import axios from 'axios'

const API_URL = 'http://localhost:5032/api/auth'

// Google login with selected role (Employee, Manager, SuperAdmin)
export async function loginWithGoogle(idToken, role) {
  try {
    const res = await axios.post(`${API_URL}/google`, { idToken, role })
    const { token, userId } = res.data

    // ✅ Sauvegarde du token JWT et userId
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)

    return { token, userId }
  } catch (err) {
    console.error('Erreur dans loginWithGoogle:', err)
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message)
    }
    throw new Error('Une erreur est survenue lors de la connexion.')
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

// Get current userId stored locally
export function getCurrentUserId() {
  return localStorage.getItem('userId')
}

// Logout user
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
}
