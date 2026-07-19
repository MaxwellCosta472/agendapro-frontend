import { create } from 'zustand'
import { AuthUser } from '../types'

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
}

// Carrega dados persistidos do localStorage
const storedToken = localStorage.getItem('@agendamento:token')
const storedUser = localStorage.getItem('@agendamento:user')

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,

  login: (token, user) => {
    localStorage.setItem('@agendamento:token', token)
    localStorage.setItem('@agendamento:user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('@agendamento:token')
    localStorage.removeItem('@agendamento:user')
    set({ token: null, user: null, isAuthenticated: false })
  },

  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state
      const updated = { ...state.user, ...partial }
      localStorage.setItem('@agendamento:user', JSON.stringify(updated))
      return { user: updated }
    })
  },
}))
