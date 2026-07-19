import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, StatusBadge, BottomNav } from '../../components/ui'
import { professionalAppointmentsApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function toYMD(d: Date) { return d.toISOString().split('T')[0] }

export function ProfessionalDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const today = toYMD(new Date())

  useEffect(() => {
    professionalAppointmentsApi.list({ date: today, status: 'scheduled' })
      .then(r => setAppointments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #7c5cbf 100%)', padding: '48px 24px 32px', borderRadius: '0 0 40px 40px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 14, opacity: 0.7 }}>Olá,</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>{user?.name?.split(' ')[0]} 👋</h1>
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '6px 12px', color: 'white', fontSize: 12, cursor: 'pointer' }}>Sair</button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '12px 16px' }}>
            <p style={{ fontSize: 11, opacity: 0.7 }}>Hoje</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>{appointments.length}</p>
            <p style={{ fontSize: 11, opacity: 0.7 }}>agendamentos</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '12px 16px' }}>
            <p style={{ fontSize: 11, opacity: 0.7 }}>Data</p>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
            <p style={{ fontSize: 11, opacity: 0.7 }}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 20px 100px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Agendamentos de hoje</h2>
        {loading ? <Spinner /> : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#a0a0b8' }}>
            <p style={{ fontSize: 36, marginBottom: 8 }}>🎉</p>
            <p>Nenhum agendamento para hoje</p>
          </div>
        ) : appointments.map((a: any) => (
          <div key={a.id} style={{ background: 'white', border: '1.5px solid #e8e4f3', borderRadius: 20, padding: '14px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{a.client_name}</p>
              <p style={{ fontSize: 12, color: '#6b6b8a', marginTop: 2 }}>{a.service_name}</p>
              <p style={{ fontSize: 12, color: '#a0a0b8', marginTop: 1 }}>{a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <StatusBadge status={a.status} />
              <p style={{ fontSize: 12, color: '#7c5cbf', fontWeight: 600, marginTop: 4 }}>R$ {Number(a.service_price).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="calendar" role="professional" onChange={tab => {
        if (tab === 'services') navigate('/profissional/servicos')
        if (tab === 'clients') navigate('/profissional/clientes')
        if (tab === 'settings') navigate('/profissional/horarios')
      }} />
    </div>
  )
}
