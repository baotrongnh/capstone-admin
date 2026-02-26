import axios from "axios"

export const apiClient = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
     withCredentials: true
})

apiClient.interceptors.request.use(
     async (config) => {
          // const { data: { session } } = await supabase.auth.getSession()

          // if (session?.access_token) {
          //      config.headers.Authorization = `Bearer ${session.access_token}`
          // }

          return config
     },
     async (error) => {
          return Promise.reject(error)
     }
)

apiClient.interceptors.response.use(undefined, async (error) => {
     if (error.response?.status === 401) {
          // await refreshToken();
          return apiClient(error.config); // Retry original request
     }

     throw error;
})
