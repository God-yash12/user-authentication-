import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error.response?.data?.message || error.message)
  }
)