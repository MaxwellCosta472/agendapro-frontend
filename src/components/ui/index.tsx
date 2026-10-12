import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/* ─── Button ──────────────────────────────────────────── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  fullWidth?: boolean
  children: React.ReactNode
}

export function Button({ variant = 'primary', fullWidth, children, style, disabled, ...rest }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '14px 24px', borderRadius: 50, fontSize: 15, fontWeight: 600,
    transition: 'all 0.2s', cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : undefined, opacity: disabled ? 0.6 : 1,
    border: 'none',
  }
  const variants = {
    primary: { background: '#7B5A58', color: '#fff' },
    outline: { background: 'transparent', color: '#7B5A58', border: '1.5px solid #7B5A58' },
    ghost: { background: 'transparent', color: '#7B5A58' },
  }
  return (
    <button style={{ ...base, ...variants[variant], ...style }} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}

/* ─── Spinner ─────────────────────────────────────────── */
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid #D4BEB8', borderTopColor: '#7B5A58',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ─── BottomNav ───────────────────────────────────────── */
export function BottomNav({ role }: { role: 'client' | 'professional' }) {
  const navigate = useNavigate()
  const location = useLocation()

  const clientTabs = [
    { icon: '🏠', label: 'Início', path: '/cliente' },
    { icon: '📅', label: 'Agendar', path: '/cliente/agendar' },
    { icon: '🗓️', label: 'Agenda', path: '/cliente/agendamentos' },
    { icon: '👤', label: 'Perfil', path: '/cliente/perfil' },
  ]
  const profTabs = [
    { icon: '📋', label: 'Agenda', path: '/profissional' },
    { icon: '✂️', label: 'Serviços', path: '/profissional/servicos' },
    { icon: '👥', label: 'Clientes', path: '/profissional/clientes' },
    { icon: '⚙️', label: 'Config', path: '/profissional/horarios' },
  ]
  const tabs = role === 'client' ? clientTabs : profTabs

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: '#EAD9D1', borderTop: '1px solid #D4BEB8',
      display: 'flex', justifyContent: 'space-around', padding: '10px 0 18px',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px',
          }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#7B5A58' : '#9C7C78' }}>
              {tab.label}
            </span>
            {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B5A58', marginTop: 1 }} />}
          </button>
        )
      })}
    </nav>
  )
}

/* ─── Card ────────────────────────────────────────────── */
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#EAD9D1', borderRadius: 20, padding: 20, ...style }}>
      {children}
    </div>
  )
}
