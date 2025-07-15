import axios from 'axios'

const API_URL = 'http://localhost:5032/api/auth'

export async function loginWithGoogle(idToken) {
  const res = await axios.post(`${API_URL}/google`, { idToken })
  return res.data // { token: ..., userId: ... }
}
