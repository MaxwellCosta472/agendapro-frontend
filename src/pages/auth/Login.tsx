import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

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
      setError(err.response?.data?.message || 'Verifique seus dados e tente novamente.')
    } finally { setLoading(false) }
  }

  return (
    <div className="screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5EDE8' }}>
      {/* Header */}
      <div style={{ padding: '64px 32px 36px' }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#3D2424', letterSpacing: '-0.5px', marginBottom: 4 }}>AgendaPro</h1>
        <p style={{ fontSize: 14, color: '#9C7C78' }}>Seu autocuidado, organizado.</p>

        {/* Tabs Cliente / Profissional */}
        <div style={{
          display: 'flex', background: '#EAD9D1', borderRadius: 50,
          padding: 4, marginTop: 28,
        }}>
          {(['client', 'professional'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setMode('login') }} style={{
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
      <div style={{ flex: 1, padding: '0 24px 40px' }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'client' && mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: 11, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 8, fontWeight: 600 }}>Nome completo</label>
                <input type="text" placeholder="Seu nome" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 8, fontWeight: 600 }}>Telefone</label>
                <input type="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={set('phone')} required />
              </div>
            </>
          )}
          <div>
            <label style={{ fontSize: 11, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 8, fontWeight: 600 }}>E-mail</label>
            <input type="email" placeholder="Digite seu e-mail" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 8, fontWeight: 600 }}>Senha</label>
            <input type="password" placeholder="••••••" value={form.password} onChange={set('password')} required />
          </div>

          {error && (
            <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px 0', borderRadius: 50, border: 'none',
            background: '#7B5A58', color: 'white', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            marginTop: 4, letterSpacing: '.04em',
          }}>
            {loading ? 'Entrando...' : tab === 'professional' ? 'ENTRAR COMO PROFISSIONAL' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
          </button>
        </form>

        {tab === 'client' && (
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#9C7C78' }}>
            {mode === 'login' ? (
              <>Novo por aqui?{' '}
                <span onClick={() => { setMode('register'); setError('') }} style={{ color: '#7B5A58', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                  Criar uma conta
                </span>
              </>
            ) : (
              <>Já tem conta?{' '}
                <span onClick={() => { setMode('login'); setError('') }} style={{ color: '#7B5A58', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                  Entrar
                </span>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
