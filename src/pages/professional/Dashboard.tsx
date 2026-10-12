import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/ui'
import { appointmentsApi } from '../../services/api'

export function ProfessionalDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const todayLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'

  useEffect(() => {
    appointmentsApi.listProfessional({ date: today })
      .then(r => setAppointments((r.data || []).filter((a: any) => a.status === 'scheduled').sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const tabs = [
    { icon: '📋', label: 'Agenda', path: '/profissional' },
    { icon: '✂️', label: 'Serviços', path: '/profissional/servicos' },
    { icon: '👥', label: 'Clientes', path: '/profissional/clientes' },
    { icon: '⚙️', label: 'Config', path: '/profissional/horarios' },
  ]

  return (
    <div className="screen" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#EAD9D1', padding: '52px 24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#7B5A58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>M</span>
          </div>
          <button onClick={logout} style={{ background: '#D4BEB8', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#7B5A58', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#9C7C78' }}>{greeting},</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#3D2424' }}>{user?.name?.split(' ')[0] || 'Maxwell'} 👋</h1>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <div style={{ flex: 1, background: '#D4BEB8', borderRadius: 16, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#9C7C78', marginBottom: 4 }}>Hoje</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#3D2424' }}>{appointments.length}</p>
            <p style={{ fontSize: 11, color: '#9C7C78' }}>agendamentos</p>
          </div>
          <div style={{ flex: 1, background: '#D4BEB8', borderRadius: 16, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#9C7C78', marginBottom: 4 }}>Data</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#3D2424' }}>{new Date().getDate()} de {new Date().toLocaleDateString('pt-BR', { month: 'short' })}.</p>
            <p style={{ fontSize: 11, color: '#9C7C78', textTransform: 'capitalize' }}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#3D2424', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>
          Agendamentos de hoje
        </p>
        {loading ? <Spinner /> : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9C7C78' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🎉</p>
            <p style={{ fontWeight: 600 }}>Nenhum agendamento para hoje</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Aproveite seu descanso!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {appointments.map((a: any) => (
              <div key={a.id} style={{ background: '#EAD9D1', borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#7B5A58', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 18 }}>✂️</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#3D2424', marginBottom: 2 }}>{a.client_name}</p>
                  <p style={{ fontSize: 13, color: '#9C7C78' }}>{a.service_name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#7B5A58' }}>{a.start_time}</p>
                  <p style={{ fontSize: 11, color: '#9C7C78' }}>{a.duration_minutes || '–'}min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: '#EAD9D1', borderTop: '1px solid #D4BEB8',
        display: 'flex', justifyContent: 'space-around', padding: '10px 0 18px', zIndex: 100,
      }}>
        {tabs.map(tab => (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px',
          }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab.path === '/profissional' ? 700 : 400, color: tab.path === '/profissional' ? '#7B5A58' : '#9C7C78' }}>
              {tab.label}
            </span>
            {tab.path === '/profissional' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B5A58', marginTop: 1 }} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
