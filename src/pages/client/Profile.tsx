import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { appointmentsApi } from '../../services/api'
import { useState, useEffect } from 'react'

export function ClientProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [total, setTotal] = useState(0)
  const firstName = user?.name?.split(' ')[0] || 'Cliente'

  useEffect(() => {
    appointmentsApi.list().then(r => {
      setTotal((r.data || []).filter((a: any) => a.status === 'completed' || a.status === 'scheduled').length)
    }).catch(() => {})
  }, [])

  const tabs = [
    { icon: '🏠', label: 'Início', path: '/cliente' },
    { icon: '📅', label: 'Agendar', path: '/cliente/agendar' },
    { icon: '🗓️', label: 'Agenda', path: '/cliente/agendamentos' },
    { icon: '👤', label: 'Perfil', path: '/cliente/perfil' },
  ]

  return (
    <div className="screen" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#EAD9D1', padding: '52px 24px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#7B5A58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 28 }}>{firstName[0]?.toUpperCase()}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#3D2424' }}>{user?.name || 'Cliente'}</p>
            <p style={{ fontSize: 13, color: '#9C7C78', marginTop: 2 }}>{user?.email}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        {/* Stats */}
        <div style={{ background: '#EAD9D1', borderRadius: 20, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 12, color: '#9C7C78', marginBottom: 4 }}>Minha jornada</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#3D2424' }}>{total}</p>
            <p style={{ fontSize: 12, color: '#9C7C78' }}>atendimentos</p>
          </div>
          <span style={{ fontSize: 40 }}>✂️</span>
        </div>

        {/* Opções */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => navigate('/cliente/agendamentos')} style={{
            background: '#EAD9D1', borderRadius: 16, padding: '16px 20px',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🗓️</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#3D2424' }}>Meus agendamentos</span>
            </div>
            <span style={{ color: '#9C7C78', fontSize: 18 }}>›</span>
          </button>

          <button onClick={() => navigate('/cliente/agendar')} style={{
            background: '#EAD9D1', borderRadius: 16, padding: '16px 20px',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#3D2424' }}>Agendar novo horário</span>
            </div>
            <span style={{ color: '#9C7C78', fontSize: 18 }}>›</span>
          </button>
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          width: '100%', marginTop: 32, padding: '16px 0', borderRadius: 50,
          border: '1.5px solid #D4BEB8', background: 'transparent',
          color: '#9C7C78', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>
          Sair da conta
        </button>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: '#EAD9D1', borderTop: '1px solid #D4BEB8',
        display: 'flex', justifyContent: 'space-around', padding: '10px 0 18px', zIndex: 100,
      }}>
        {tabs.map(t => (
          <button key={t.path} onClick={() => navigate(t.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px',
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: t.path === '/cliente/perfil' ? 700 : 400, color: t.path === '/cliente/perfil' ? '#7B5A58' : '#9C7C78' }}>
              {t.label}
            </span>
            {t.path === '/cliente/perfil' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B5A58', marginTop: 1 }} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
