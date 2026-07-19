import { useState, useEffect } from 'react'
import { appointmentsApi } from '../services/api'
import { Appointment, AvailableSlot } from '../types'

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchMyAppointments(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const response = await appointmentsApi.myAppointments()
      setAppointments(response.data)
    } catch {
      setError('Não foi possível carregar seus agendamentos.')
    } finally {
      setLoading(false)
    }
  }

  async function getAvailableSlots(
    date: string,
    serviceId: string
  ): Promise<AvailableSlot[]> {
    const response = await appointmentsApi.getAvailableSlots({
      date,
      service_id: serviceId,
    })
    return response.data
  }

  async function createAppointment(data: {
    service_id: string
    date: string
    start_time: string
  }): Promise<Appointment> {
    const response = await appointmentsApi.create(data)
    await fetchMyAppointments()
    return response.data
  }

  async function cancelAppointment(id: string): Promise<void> {
    await appointmentsApi.cancel(id)
    await fetchMyAppointments()
  }

  async function rescheduleAppointment(
    id: string,
    data: { date: string; start_time: string }
  ): Promise<void> {
    await appointmentsApi.reschedule(id, data)
    await fetchMyAppointments()
  }

  useEffect(() => {
    fetchMyAppointments()
  }, [])

  return {
    appointments,
    loading,
    error,
    fetchMyAppointments,
    getAvailableSlots,
    createAppointment,
    cancelAppointment,
    rescheduleAppointment,
  }
}
