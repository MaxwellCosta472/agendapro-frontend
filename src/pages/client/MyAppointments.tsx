import { useNavigate } from 'react-router-dom'
import { useAppointments } from '../../hooks/useAppointments'
import { Button, Spinner, StatusBadge, PageHeader, BottomNav } from '../../components/ui'
import { Appointment } from '../../types'

export function MyAppointments() {
  const navigate = useNavigate()
  const { appointments, loading, cancelAppointment, rescheduleAppointment } = useAppointments()

  async function handleCancel(id: string) {
    if (!confirm('Cancelar este agendamento?')) return
    try { await cancelAppointment(id) } catch (e: any) { alert(e.message) }
  }

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      <PageHeader title="Meus agendamentos" subtitle="Gerencie seus horários" onBack={() => navigate('/cliente')} />

      <div style={{ padding: '0 20px 100px' }}>
        {loading ? <Spinner /> : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📅</p>
            <p style={{ color: '#6b6b8a', marginBottom: 24 }}>Nenhum agendamento ainda</p>
            <Button onClick={() => navigate('/cliente/agendar')}>Fazer agendamento</Button>
          </div>
        ) : appointments.map((a: any) => (
          <div key={a.id} style={{ background: 'white', border: '1.5px solid #e8e4f3', borderRadius: 20, padding: '16px 20px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>{a.service_name}</p>
                <p style={{ fontSize: 12, color: '#a0a0b8', marginTop: 3 }}>
                  {new Date(a.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
                <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 2 }}>{a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>

            {a.status === 'scheduled' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="outline" style={{ flex: 1, height: 38, fontSize: 12 }} onClick={() => handleCancel(a.id)}>Cancelar</Button>
                {a.reschedule_count < 2 && (
                  <Button style={{ flex: 1, height: 38, fontSize: 12 }} onClick={() => navigate('/cliente/agendar')}>Reagendar</Button>
                )}
              </div>
            )}

            {a.reschedule_count > 0 && a.status === 'scheduled' && (
              <p style={{ fontSize: 11, color: '#a0a0b8', marginTop: 8 }}>Reagendado {a.reschedule_count}x de 2 permitidas</p>
            )}
          </div>
        ))}
      </div>

      <BottomNav active="appointments" role="client" onChange={tab => { if (tab === 'home') navigate('/cliente') }} />
    </div>
  )
}
