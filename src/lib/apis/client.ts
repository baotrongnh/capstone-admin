import axios from "axios"
import { endpoints } from "./endpoints"

export const apiClient = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
     withCredentials: true
})

apiClient.interceptors.request.use((config) => {
     const accessToken = typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null
     if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
     }
     return config
})

apiClient.interceptors.response.use(undefined, async (error) => {
     const originalRequest = error.config

     // Skip refresh logic for auth endpoints (login, register, etc.) to avoid
     // premature page reloads that swallow error toasts and network responses.
     const isAuthEndpoint = originalRequest?.url?.includes('/auth/')

     if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true

          const refreshToken = localStorage.getItem('adminRefreshToken')
          if (!refreshToken) {
               const redirectUrl = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
               localStorage.clear()
               window.location.href = redirectUrl
               return Promise.reject(error)
          }

          try {
               const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoints.auth}/refresh`,
                    { refreshToken }
               )
               const newTokens = data.data.tokens
               localStorage.setItem('adminAccessToken', newTokens.accessToken)
               localStorage.setItem('adminRefreshToken', newTokens.refreshToken)
               originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
               return apiClient(originalRequest)
          } catch {
               localStorage.clear()
               window.location.href = '/'
               return Promise.reject(error)
          }
     }

     return Promise.reject(error)
})
