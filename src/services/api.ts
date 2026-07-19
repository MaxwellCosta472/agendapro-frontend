import axios, { AxiosError } from 'axios'
import { ApiError } from '../types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token JWT em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@agendamento:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trata erros globais de autenticação
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@agendamento:token')
      localStorage.removeItem('@agendamento:user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Helpers por módulo ───────────────────────────────────────────────────────

export const authApi = {
  loginClient: (data: { email: string; password: string }) =>
    api.post('/auth/client/login', data),
  loginProfessional: (data: { email: string; password: string }) =>
    api.post('/auth/professional/login', data),
  registerClient: (data: {
    name: string
    email: string
    phone: string
    password: string
    birth_date?: string
  }) => api.post('/auth/client/register', data),
}

export const appointmentsApi = {
  getAvailableSlots: (params: { date: string; service_id: string }) =>
    api.get('/appointments/available', { params }),
  create: (data: { service_id: string; date: string; start_time: string }) =>
    api.post('/appointments', data),
  myAppointments: () => api.get('/appointments/my'),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`),
  reschedule: (id: string, data: { date: string; start_time: string }) =>
    api.patch(`/appointments/${id}/reschedule`, data),
}

export const servicesApi = {
  list: (professionalId?: string) =>
    api.get('/services', { params: professionalId ? { professional_id: professionalId } : {} }),
  create: (data: { name: string; duration_minutes: number; price: number }) =>
    api.post('/services', data),
  update: (id: string, data: Partial<{ name: string; duration_minutes: number; price: number; status: string }>) =>
    api.put(`/services/${id}`, data),
  remove: (id: string) => api.delete(`/services/${id}`),
}

export const schedulesApi = {
  list: () => api.get('/schedules'),
  listClosedDays: () => api.get('/schedules/closed-days'),
  upsert: (data: { day_of_week: number; start_time: string; end_time: string }[]) =>
    api.put('/schedules/day', { day_of_week: data[0].day_of_week, periods: data.map(d => ({ start_time: d.start_time, end_time: d.end_time })) }),
  closeDay: (date: string, reason?: string) =>
    api.post('/schedules/closed-days', { date, reason }),
  openDay: (date: string) =>
    api.delete(`/schedules/closed-days/${date}`),
  blockSlot: (data: { date: string; start_time: string; end_time: string; reason?: string }) =>
    api.post('/schedules/blocked-slots', data),
  removeBlockedSlot: (id: string) =>
    api.delete(`/schedules/blocked-slots/${id}`),
}

export const clientsApi = {
  list: () => api.get('/clients'),
  ban: (clientId: string) => api.post(`/clients/${clientId}/ban`),
  unban: (clientId: string) => api.delete(`/clients/${clientId}/ban`),
}

export const professionalAppointmentsApi = {
  list: (params?: { date?: string; status?: string }) =>
    api.get('/professional/appointments', { params }),
  reschedule: (id: string, data: { date: string; start_time: string }) =>
    api.patch(`/professional/appointments/${id}/reschedule`, data),
  cancel: (id: string) =>
    api.patch(`/professional/appointments/${id}/cancel`),
}
