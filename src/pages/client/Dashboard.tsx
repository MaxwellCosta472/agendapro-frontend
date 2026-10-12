import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { appointmentsApi, servicesApi } from '../../services/api'

const PROFESSIONAL_ID = 'a2fd0278-4bc3-abf2-e9af4bfe7179'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'BOM DIA'
  if (h < 18) return 'BOA TARDE'
  return 'BOA NOITE'
}

// Busca imagem do serviço salva localmente
function getServiceImage(id: string): string | null {
  try { return localStorage.getItem(`svc_img_${id}`) } catch { return null }
}

export function ClientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [next, setNext] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    appointmentsApi.list().then(r => {
      const upcoming = (r.data || [])
        .filter((a: any) => a.status === 'scheduled')
        .sort((a: any, b: any) => (a.date + a.start_time).localeCompare(b.date + b.start_time))
      setNext(upcoming[0] || null)
    }).catch(() => {})
    servicesApi.list(PROFESSIONAL_ID).then(r => setServices(r.data || [])).catch(() => {})
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'Cliente'

  const tabs = [
    { icon: '🏠', label: 'Início', path: '/cliente' },
    { icon: '📅', label: 'Agendar', path: '/cliente/agendar' },
    { icon: '🗓️', label: 'Agenda', path: '/cliente/agendamentos' },
    { icon: '👤', label: 'Perfil', path: '/cliente/perfil' },
  ]

  return (
    <div className="screen" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#EAD9D1', padding: '52px 24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#7B5A58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{firstName[0]?.toUpperCase()}</span>
          </div>
          <button onClick={() => navigate('/cliente/perfil')} style={{
            background: '#D4BEB8', border: 'none', borderRadius: 20,
            padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#7B5A58', cursor: 'pointer',
          }}>Minha jornada</button>
        </div>
        <p style={{ fontSize: 13, color: '#9C7C78', fontWeight: 600, letterSpacing: '.08em' }}>{greeting()}, {firstName.toUpperCase()}</p>
        <p style={{ fontSize: 13, color: '#9C7C78', marginTop: 2 }}>Pronta para o próximo atendimento?</p>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Próximo agendamento */}
        {next ? (
          <div style={{ background: '#7B5A58', borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Próximo atendimento</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 12 }}>{next.service_name}</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Data</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
                  {new Date(next.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}, {next.start_time}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Profissional</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Maxwell</p>
              </div>
            </div>
          </div>
        ) : (
          <div onClick={() => navigate('/cliente/agendar')} style={{
            background: '#7B5A58', borderRadius: 20, padding: '20px 24px', marginBottom: 24, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Atendimentos</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Nenhum agendado</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Toque para agendar agora</p>
            </div>
            <span style={{ fontSize: 28 }}>✂️</span>
          </div>
        )}

        {/* Serviços */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#3D2424', textTransform: 'uppercase', letterSpacing: '.05em' }}>Serviços</p>
          <button onClick={() => navigate('/cliente/agendar')} style={{ background: 'none', border: 'none', fontSize: 13, color: '#7B5A58', fontWeight: 600, cursor: 'pointer' }}>
            Ver todos
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {services.slice(0, 4).map(s => {
            const img = getServiceImage(s.id)
            return (
              <div key={s.id} onClick={() => navigate('/cliente/agendar')} style={{ background: '#EAD9D1', borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: 100, background: img ? 'transparent' : '#D4BEB8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {img
                    ? <img src={img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 10, color: '#9C7C78', textAlign: 'center', padding: '0 8px' }}>IMAGEM ILUSTRATIVA DO SERVIÇO</span>
                  }
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#3D2424', marginBottom: 6 }}>{s.name}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#9C7C78' }}>{s.duration_minutes}min</span>
                    <span style={{ color: '#D4BEB8' }}>|</span>
                    <span style={{ fontSize: 11, color: '#9C7C78' }}>R${Number(s.price).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9C7C78' }}>
            <p>Nenhum serviço disponível</p>
          </div>
        )}
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
            <span style={{ fontSize: 10, fontWeight: t.path === '/cliente' ? 700 : 400, color: t.path === '/cliente' ? '#7B5A58' : '#9C7C78' }}>
              {t.label}
            </span>
            {t.path === '/cliente' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B5A58', marginTop: 1 }} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
