import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui'

type Tab = 'client' | 'professional'
type Mode = 'login' | 'register'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [tab, setTab] = useState<Tab>('client')
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (tab === 'professional') {
        const res = await authApi.professionalLogin({ email: form.email, password: form.password })
        login(res.data.token, { ...res.data.professional, role: 'professional' })
        navigate('/profissional')
      } else if (mode === 'login') {
        const res = await authApi.clientLogin({ email: form.email, password: form.password })
        login(res.data.token, { ...res.data.client, role: 'client' })
        navigate('/cliente')
      } else {
        await authApi.clientRegister({ name: form.name, phone: form.phone, email: form.email, password: form.password })
        const res = await authApi.clientLogin({ email: form.email, password: form.password })
        login(res.data.token, { ...res.data.client, role: 'client' })
        navigate('/cliente')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao entrar. Verifique seus dados.')
    } finally { setLoading(false) }
  }

  return (
    <div className="screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header terroso */}
      <div style={{
        background: '#EAD9D1', padding: '64px 32px 48px',
        borderRadius: '0 0 40px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✂️</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#3D2424', letterSpacing: '-0.5px' }}>AgendaPro</h1>
        <p style={{ fontSize: 14, color: '#9C7C78', marginTop: 4 }}>Seu autocuidado, organizado.</p>

        {/* Tabs Cliente / Profissional */}
        <div style={{
          display: 'flex', background: '#D4BEB8', borderRadius: 50,
          padding: 4, marginTop: 28, width: '100%',
        }}>
          {(['client', 'professional'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '10px 0', borderRadius: 50,
              background: tab === t ? '#7B5A58' : 'transparent',
              color: tab === t ? '#fff' : '#9C7C78',
              fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {t === 'client' ? 'Cliente' : 'Profissional'}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '32px 24px 40px' }}>
        {tab === 'client' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '10px 0',
                borderBottom: mode === m ? '2px solid #7B5A58' : '2px solid transparent',
                background: 'none', border: 'none',
                borderBottomWidth: 2, borderBottomStyle: 'solid',
                borderBottomColor: mode === m ? '#7B5A58' : 'transparent',
                color: mode === m ? '#7B5A58' : '#9C7C78',
                fontWeight: mode === m ? 700 : 400, fontSize: 14, cursor: 'pointer',
              }}>
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'client' && mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Nome completo</label>
                <input type="text" placeholder="Seu nome" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Telefone</label>
                <input type="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={set('phone')} required />
              </div>
            </>
          )}
          <div>
            <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>E-mail</label>
            <input type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Senha</label>
            <input type="password" placeholder="••••••" value={form.password} onChange={set('password')} required />
          </div>

          {error && (
            <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Entrando...' : tab === 'professional' ? 'Entrar como profissional' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>
      </div>
    </div>
  )
}
