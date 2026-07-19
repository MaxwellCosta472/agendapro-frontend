import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../services/api'

export function Login() {
  const navigate = useNavigate()
  const { loginClient, loginProfessional } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'professional'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', birth_date: '' })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleLogin() {
    if (!form.email || !form.password) { setError('Preencha todos os campos.'); return }
    setLoading(true)
    try {
      await loginClient(form.email, form.password)
      navigate('/cliente')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleProfessionalLogin() {
    if (!form.email || !form.password) { setError('Preencha todos os campos.'); return }
    setLoading(true)
    try {
      await loginProfessional(form.email, form.password)
      navigate('/profissional')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleRegister() {
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Preencha todos os campos obrigatórios.'); return
    }
    setLoading(true)
    try {
      await authApi.registerClient({ name: form.name, email: form.email, phone: form.phone, password: form.password, birth_date: form.birth_date || undefined })
      await loginClient(form.email, form.password)
      navigate('/cliente')
    } catch (e: any) { setError(e.response?.data?.message ?? 'Erro ao criar conta.') }
    finally { setLoading(false) }
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #7c5cbf 100%)', padding: '64px 32px 48px', borderRadius: '0 0 40px 40px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>✂️</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>AgendaPro</h1>
        <p style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>
          {mode === 'login' && 'Entre na sua conta'}
          {mode === 'register' && 'Crie sua conta'}
          {mode === 'professional' && 'Acesso do profissional'}
        </p>
      </div>
      <div style={{ flex: 1, padding: '32px 24px 24px' }}>
        {mode !== 'professional' && (
          <div style={{ display: 'flex', background: '#f8f6ff', borderRadius: 14, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, background: mode === m ? 'white' : 'transparent', color: mode === m ? '#7c5cbf' : '#a0a0b8', cursor: 'pointer', transition: 'all .15s', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>
        )}
        {mode === 'register' && <Input label="Nome completo" placeholder="Seu nome" value={form.name} onChange={e => update('name', e.target.value)} />}
        <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
        {mode === 'register' && <Input label="Telefone" type="tel" placeholder="11999999999" value={form.phone} onChange={e => update('phone', e.target.value)} />}
        <Input label="Senha" type="password" placeholder="••••••" value={form.password} onChange={e => update('password', e.target.value)} />
        {mode === 'register' && <Input label="Data de nascimento (opcional)" type="date" value={form.birth_date} onChange={e => update('birth_date', e.target.value)} />}
        {error && <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <Button fullWidth disabled={loading} onClick={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleProfessionalLogin} style={{ marginBottom: 12 }}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Entrar como profissional'}
        </Button>
        {mode !== 'professional' ? (
          <button onClick={() => { setMode('professional'); setError('') }} style={{ width: '100%', background: 'none', border: 'none', color: '#7c5cbf', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>
            É profissional? Acesse aqui
          </button>
        ) : (
          <button onClick={() => { setMode('login'); setError('') }} style={{ width: '100%', background: 'none', border: 'none', color: '#7c5cbf', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>
            ← Voltar para login de cliente
          </button>
        )}
      </div>
    </div>
  )
}
