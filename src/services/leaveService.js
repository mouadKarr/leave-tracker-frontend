import axios from 'axios'

const API_URL = 'http://localhost:5032/api/leave'

export async function submitLeaveRequest(data, token) {
  await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

export async function getUserLeaveRequests(userId, token) {
  const res = await axios.get(`${API_URL}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}
