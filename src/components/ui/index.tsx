import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    height: 52,
    borderRadius: 26,
    fontSize: 15,
    fontWeight: 600,
    transition: 'opacity .15s, transform .1s',
    width: fullWidth ? '100%' : 'auto',
    padding: '0 28px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #7c5cbf 0%, #9b7fe8 100%)',
      color: 'white',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: '#7c5cbf',
      border: '2px solid #7c5cbf',
    },
    ghost: {
      background: 'transparent',
      color: '#7c5cbf',
      border: 'none',
    },
  }

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
}

export function Input({ label, icon, error, style, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6b6b8a', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8', fontSize: 16 }}>
            {icon}
          </span>
        )}
        <input
          style={{
            width: '100%',
            height: 50,
            borderRadius: 12,
            border: error ? '1.5px solid #e24b4a' : '1.5px solid #e8e4f3',
            background: '#f8f6ff',
            padding: icon ? '0 16px 0 40px' : '0 16px',
            fontSize: 15,
            color: '#1a1a2e',
            outline: 'none',
            transition: 'border-color .15s',
            ...style,
          }}
          onFocus={e => (e.target.style.borderColor = '#7c5cbf')}
          onBlur={e => (e.target.style.borderColor = error ? '#e24b4a' : '#e8e4f3')}
          {...props}
        />
      </div>
      {error && <p style={{ fontSize: 12, color: '#e24b4a', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  style?: React.CSSProperties
  onClick?: () => void
}

export function Card({ children, style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 20,
        border: '1.5px solid #e8e4f3',
        padding: '16px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .15s, transform .1s',
        ...style,
      }}
      onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.borderColor = '#9b7fe8' } }}
      onMouseLeave={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e4f3' } }}
    >
      {children}
    </div>
  )
}

// ─── Badge de status ──────────────────────────────────────────────────────────

interface BadgeProps {
  status: 'scheduled' | 'cancelled' | 'expired'
}

const badgeMap = {
  scheduled: { label: 'Agendado', bg: '#e8f5e9', color: '#2e7d32' },
  cancelled: { label: 'Cancelado', bg: '#ffebee', color: '#c62828' },
  expired:   { label: 'Expirado',  bg: '#f3f0ff', color: '#6b6b8a' },
}

export function StatusBadge({ status }: BadgeProps) {
  const s = badgeMap[status]
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 20,
      background: s.bg,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

// ─── Loading spinner ──────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '3px solid #e8e4f3',
        borderTopColor: '#7c5cbf',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Topo da tela com gradiente roxo ─────────────────────────────────────────

interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  rightAction?: ReactNode
}

export function PageHeader({ title, subtitle, onBack, rightAction }: PageHeaderProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #2d1b69 0%, #7c5cbf 100%)',
      padding: '48px 24px 32px',
      color: 'white',
      borderRadius: '0 0 32px 32px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: subtitle ? 12 : 0 }}>
        {onBack ? (
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 36, height: 36, color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ←
          </button>
        ) : <div />}
        {rightAction && <div>{rightAction}</div>}
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 14, opacity: 0.75, marginTop: 6 }}>{subtitle}</p>}
    </div>
  )
}

// ─── Bottom navigation ────────────────────────────────────────────────────────

interface BottomNavProps {
  active: string
  role: 'client' | 'professional'
  onChange: (tab: string) => void
}

const clientTabs = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'appointments', label: 'Agendamentos', icon: '📅' },
  { id: 'profile', label: 'Perfil', icon: '👤' },
]

const professionalTabs = [
  { id: 'calendar', label: 'Agenda', icon: '📅' },
  { id: 'services', label: 'Serviços', icon: '✂️' },
  { id: 'clients', label: 'Clientes', icon: '👥' },
  { id: 'settings', label: 'Config', icon: '⚙️' },
]

export function BottomNav({ active, role, onChange }: BottomNavProps) {
  const tabs = role === 'client' ? clientTabs : professionalTabs

  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      background: 'white',
      borderTop: '1.5px solid #e8e4f3',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 16px',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '6px 12px',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: active === tab.id ? '#7c5cbf' : '#a0a0b8' }}>
            {tab.label}
          </span>
          {active === tab.id && (
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c5cbf' }} />
          )}
        </button>
      ))}
    </div>
  )
}
