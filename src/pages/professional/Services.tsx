import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, Button } from '../../components/ui'
import { servicesApi } from '../../services/api'

export function Services() {
  const navigate = useNavigate()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', duration_minutes: '', price: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  function load() {
    setLoading(true)
    servicesApi.listMine().then(r => setServices(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function createService(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await servicesApi.create({ name: form.name, duration_minutes: Number(form.duration_minutes), price: Number(form.price), description: form.description })
      setForm({ name: '', duration_minutes: '', price: '', description: '' })
      setShowForm(false); load()
    } catch (e: any) { setError(e.response?.data?.message || 'Erro ao criar serviço.') }
    finally { setSaving(false) }
  }

  async function toggle(id: string, active: boolean) {
    try { await servicesApi.update(id, { is_active: !active }); load() } catch {}
  }
  async function remove(id: string) {
    if (!confirm('Excluir este serviço?')) return
    try { await servicesApi.remove(id); load() } catch {}
  }

  const tabs = [
    { icon: '📋', label: 'Agenda', path: '/profissional' },
    { icon: '✂️', label: 'Serviços', path: '/profissional/servicos' },
    { icon: '👥', label: 'Clientes', path: '/profissional/clientes' },
    { icon: '⚙️', label: 'Config', path: '/profissional/horarios' },
  ]

  return (
    <div className="screen" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: '#EAD9D1', padding: '52px 24px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#3D2424' }}>Gerenciar serviços</h1>
        <p style={{ fontSize: 13, color: '#9C7C78', marginTop: 4 }}>{services.length}/10 serviços cadastrados</p>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Botão novo serviço */}
        {services.length < 10 && !showForm && (
          <button onClick={() => setShowForm(true)} style={{
            width: '100%', padding: '16px', borderRadius: 18,
            border: '2px dashed #D4BEB8', background: 'transparent',
            color: '#7B5A58', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 16,
          }}>
            + Novo serviço
          </button>
        )}

        {/* Form novo serviço */}
        {showForm && (
          <form onSubmit={createService} style={{ background: '#EAD9D1', borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#3D2424', marginBottom: 16 }}>Novo serviço</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Nome</label>
                <input type="text" placeholder="Ex: Corte feminino" value={form.name} onChange={set('name')} required />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Duração (min)</label>
                  <input type="number" placeholder="60" value={form.duration_minutes} onChange={set('duration_minutes')} required min={1} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Preço (R$)</label>
                  <input type="number" placeholder="150" value={form.price} onChange={set('price')} required min={0} step="0.01" />
                </div>
              </div>
            </div>
            {error && <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginTop: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => { setShowForm(false); setError('') }} style={{
                flex: 1, padding: '13px 0', borderRadius: 50, border: '1.5px solid #D4BEB8',
                background: 'transparent', color: '#9C7C78', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: '13px 0', borderRadius: 50, border: 'none',
                background: '#7B5A58', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.6 : 1,
              }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        )}

        {loading ? <Spinner /> : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9C7C78' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✂️</p>
            <p>Nenhum serviço cadastrado ainda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {services.map((s: any) => (
              <div key={s.id} style={{ background: '#EAD9D1', borderRadius: 18, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#3D2424' }}>{s.name}</p>
                    <p style={{ fontSize: 13, color: '#9C7C78', marginTop: 2 }}>{s.duration_minutes}min · R${Number(s.price).toFixed(2)}</p>
                  </div>
                  <span style={{
                    background: s.is_active ? '#e8f5e9' : '#EAD9D1',
                    color: s.is_active ? '#2e7d32' : '#9C7C78',
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                  }}>{s.is_active ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => toggle(s.id, s.is_active)} style={{
                    flex: 1, padding: '9px 0', borderRadius: 12, border: '1.5px solid #D4BEB8',
                    background: 'transparent', color: '#7B5A58', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}>{s.is_active ? 'Desativar' : 'Ativar'}</button>
                  <button onClick={() => remove(s.id)} style={{
                    padding: '9px 16px', borderRadius: 12, border: '1.5px solid #D4BEB8',
                    background: 'transparent', color: '#c62828', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <span style={{ fontSize: 10, fontWeight: tab.path === '/profissional/servicos' ? 700 : 400, color: tab.path === '/profissional/servicos' ? '#7B5A58' : '#9C7C78' }}>
              {tab.label}
            </span>
            {tab.path === '/profissional/servicos' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B5A58', marginTop: 1 }} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
