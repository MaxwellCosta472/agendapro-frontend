import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { servicesApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

const PROFESSIONAL_ID = 'a2fd0278-4bc3-abf2-e9af4bfe7179'

function getServiceImage(id: string): string | null {
  try { return localStorage.getItem(`svc_img_${id}`) } catch { return null }
}

export function Landing() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    servicesApi.list(PROFESSIONAL_ID).then(r => setServices((r.data || []).filter((s: any) => s.is_active ?? s.active ?? true))).catch(() => {})
  }, [])

  function handleAgendar() {
    if (isAuthenticated && user?.role === 'client') navigate('/cliente/agendar')
    else navigate('/login')
  }

  function handleEntrar() {
    if (isAuthenticated) {
      navigate(user?.role === 'professional' ? '/profissional' : '/cliente')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="screen" style={{ minHeight: '100vh', background: '#F5EDE8' }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(245,237,232,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #EAD9D1',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#3D2424' }}>
          Agenda<span style={{ color: '#7B5A58' }}>Pro</span>
        </h2>
        <button onClick={handleEntrar} style={{
          background: '#7B5A58', color: 'white', border: 'none',
          borderRadius: 50, padding: '9px 20px', fontWeight: 700, fontSize: 13,
          cursor: 'pointer',
        }}>
          {isAuthenticated ? 'Minha conta' : 'Entrar'}
        </button>
      </div>

      {/* Hero */}
      <div style={{ background: '#EAD9D1', padding: '48px 24px 40px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#7B5A58',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 32 }}>M</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#3D2424', marginBottom: 6 }}>Maxwell Ferreira</h1>
        <p style={{ fontSize: 14, color: '#9C7C78', marginBottom: 6 }}>✂️ Cabeleireiro & Barbeiro</p>
        <p style={{ fontSize: 13, color: '#7B5A58', fontWeight: 600 }}>📍 São Paulo, SP</p>

        <p style={{ fontSize: 14, color: '#9C7C78', marginTop: 16, lineHeight: 1.6, maxWidth: 320, margin: '16px auto 0' }}>
          Especialista em cortes modernos, coloração e tratamentos capilares. Agende seu horário com facilidade.
        </p>
      </div>

      {/* Serviços */}
      <div style={{ padding: '28px 20px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#3D2424', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>
          Serviços
        </p>

        {services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9C7C78' }}>
            <p>Carregando serviços...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {services.map(s => {
              const img = getServiceImage(s.id)
              return (
                <div key={s.id} onClick={handleAgendar} style={{ background: '#EAD9D1', borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ height: 100, background: '#D4BEB8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {img
                      ? <img src={img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 28 }}>✂️</span>
                    }
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#3D2424', marginBottom: 4 }}>{s.name}</p>
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
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '36px 24px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#9C7C78', marginBottom: 20 }}>
          Escolha o melhor horário para você
        </p>
        <button onClick={handleAgendar} style={{
          width: '100%', padding: '18px 0', borderRadius: 50,
          background: '#7B5A58', color: 'white', border: 'none',
          fontWeight: 800, fontSize: 16, cursor: 'pointer',
          letterSpacing: '.04em', boxShadow: '0 4px 20px rgba(123,90,88,0.35)',
        }}>
          AGENDE SEU HORÁRIO
        </button>
      </div>
    </div>
  )
}
