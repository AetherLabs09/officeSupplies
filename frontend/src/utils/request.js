import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('Request error:', error)
    return { success: false, message: error.message }
  }
)

export default request