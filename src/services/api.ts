import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://agendapro-backend-wuh1.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@agendamento:token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@agendamento:token')
      localStorage.removeItem('@agendamento:user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  clientLogin: (data: { email: string; password: string }) =>
    api.post('/auth/client/login', data),
  clientRegister: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post('/auth/client/register', data),
  professionalLogin: (data: { email: string; password: string }) =>
    api.post('/auth/professional/login', data),
  // aliases para compatibilidade
  loginClient: (data: { email: string; password: string }) => api.post('/auth/client/login', data),
  loginProfessional: (data: { email: string; password: string }) => api.post('/auth/professional/login', data),
  registerClient: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post('/auth/client/register', data),
}

export const appointmentsApi = {
  getAvailableSlots: (params: { date: string; service_id: string; professional_id?: string }) =>
    api.get('/appointments/available', { params }),
  create: (data: { service_id: string; date: string; start_time: string; professional_id?: string }) =>
    api.post('/appointments', data),
  list: () => api.get('/appointments/my'),
  myAppointments: () => api.get('/appointments/my'),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`),
  reschedule: (id: string, data: { date: string; start_time: string }) =>
    api.patch(`/appointments/${id}/reschedule`, data),
  listProfessional: (params?: { date?: string; status?: string }) =>
    api.get('/professional/appointments', { params }),
}

export const servicesApi = {
  list: (professionalId?: string) =>
    api.get('/services', { params: professionalId ? { professional_id: professionalId } : {} }),
  listMine: () => api.get('/services/mine'),
  create: (data: { name: string; duration_minutes: number; price: number; description?: string }) =>
    api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  remove: (id: string) => api.delete(`/services/${id}`),
}

export const schedulesApi = {
  getWeekly: () => api.get('/schedules'),
  list: () => api.get('/schedules'),
  getClosedDays: () => api.get('/schedules/closed-days'),
  listClosedDays: () => api.get('/schedules/closed-days'),
  getBlockedSlots: () => api.get('/schedules/blocked-slots'),
  updateWeekly: (dayOfWeek: number, data: { start_time: string; end_time: string; is_active: boolean }) =>
    api.put('/schedules/day', { day_of_week: dayOfWeek, is_active: data.is_active, start_time: data.start_time, end_time: data.end_time }),
  upsert: (data: any[]) =>
    api.put('/schedules/day', { day_of_week: data[0].day_of_week, periods: data }),
  addClosedDay: (data: { date: string; reason?: string }) =>
    api.post('/schedules/closed-days', data),
  closeDay: (date: string, reason?: string) =>
    api.post('/schedules/closed-days', { date, reason }),
  removeClosedDay: (id: string) =>
    api.delete(`/schedules/closed-days/${id}`),
  openDay: (date: string) => api.delete(`/schedules/closed-days/${date}`),
  addBlockedSlot: (data: { date: string; start_time: string; end_time: string; reason?: string }) =>
    api.post('/schedules/blocked-slots', data),
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
  cancel: (id: string) => api.patch(`/professional/appointments/${id}/cancel`),
}
