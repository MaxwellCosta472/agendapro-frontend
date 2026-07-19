import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'
import { AxiosError } from 'axios'
import { ApiError } from '../types'

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  async function loginClient(email: string, password: string): Promise<void> {
    try {
      const response = await authApi.loginClient({ email, password })
      login(response.data.token, response.data.user)
    } catch (err) {
      const error = err as AxiosError<ApiError>
      throw new Error(error.response?.data?.message ?? 'Erro ao fazer login')
    }
  }

  async function loginProfessional(email: string, password: string): Promise<void> {
    try {
      const response = await authApi.loginProfessional({ email, password })
      login(response.data.token, response.data.user)
    } catch (err) {
      const error = err as AxiosError<ApiError>
      throw new Error(error.response?.data?.message ?? 'Erro ao fazer login')
    }
  }

  return {
    user,
    isAuthenticated,
    isProfessional: user?.role === 'professional',
    isClient: user?.role === 'client',
    loginClient,
    loginProfessional,
    logout,
  }
}
