// ─── Enums ────────────────────────────────────────────────────────────────────

export type ServiceStatus = 'active' | 'inactive'
export type AppointmentStatus = 'scheduled' | 'cancelled' | 'expired'
export type CancelledByType = 'client' | 'professional' | 'system'
export type UserRole = 'client' | 'professional'

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Professional {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  birth_date: string | null
  created_at: string
}

export interface Service {
  id: string
  professional_id: string
  name: string
  duration_minutes: number
  price: number
  status: ServiceStatus
}

export interface ProfessionalSchedule {
  id: string
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Appointment {
  id: string
  professional_id: string
  client_id: string
  service_id: string
  date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  reschedule_count: number
  cancelled_by: CancelledByType | null
  cancelled_at: string | null
  created_at: string
  // relações expandidas (opcionais, dependendo do endpoint)
  client?: Pick<Client, 'id' | 'name' | 'phone'>
  service?: Pick<Service, 'id' | 'name' | 'duration_minutes' | 'price'>
}

export interface AvailableSlot {
  start_time: string
  end_time: string
  available: boolean
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ApiError {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
}
