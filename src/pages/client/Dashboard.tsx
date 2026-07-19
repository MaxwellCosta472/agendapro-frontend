import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { BottomNav } from '../../components/ui'

export function ClientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #7c5cbf 100%)', padding: '48px 24px 40px', borderRadius: '0 0 40px 40px', color: 'white' }}>
        <p style={{ fontSize: 14, opacity: 0.7 }}>Olá,</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}>{user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ fontSize: 13, opacity: 0.6, marginTop: 6 }}>O que você quer agendar hoje?</p>
      </div>
      <div style={{ flex: 1, padding: '24px 20px' }}>
        <div onClick={() => navigate('/cliente/agendar')} style={{ background: 'linear-gradient(135deg, #7c5cbf, #9b7fe8)', borderRadius: 24, padding: '24px 20px', color: 'white', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, marginBottom: 6 }}>✂️</div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Novo agendamento</h2>
            <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Escolha serviço e horário</p>
          </div>
          <span style={{ fontSize: 24, opacity: 0.8 }}>→</span>
        </div>
        <div onClick={() => navigate('/cliente/agendamentos')} style={{ background: 'white', border: '1.5px solid #e8e4f3', borderRadius: 24, padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, marginBottom: 6 }}>📅</div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>Meus agendamentos</h2>
            <p style={{ fontSize: 12, color: '#a0a0b8', marginTop: 4 }}>Ver e gerenciar horários</p>
          </div>
          <span style={{ fontSize: 20, color: '#7c5cbf' }}>→</span>
        </div>
      </div>
      <BottomNav active="home" role="client" onChange={tab => { if (tab === 'appointments') navigate('/cliente/agendamentos') }} />
    </div>
  )
}
