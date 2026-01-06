import { getToken } from "@/lib/utils"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Something went wrong"

    return Promise.reject(new Error(message))
  }
)

export default apiClient
