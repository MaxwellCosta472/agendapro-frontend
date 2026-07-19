import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Spinner, BottomNav, PageHeader } from '../../components/ui'
import { servicesApi } from '../../services/api'
import { Service } from '../../types'

export function Services() {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', duration_minutes: '', price: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    servicesApi.list().then(r => setServices(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.name || !form.duration_minutes || !form.price) { setError('Preencha todos os campos.'); return }
    setSaving(true)
    try {
      await servicesApi.create({ name: form.name, duration_minutes: Number(form.duration_minutes), price: Number(form.price) })
      setForm({ name: '', duration_minutes: '', price: '' })
      setShowForm(false)
      load()
    } catch (e: any) { setError(e.response?.data?.message ?? 'Erro ao criar serviço.') }
    finally { setSaving(false) }
  }

  async function toggleStatus(s: Service) {
    try {
      await servicesApi.update(s.id, { status: s.status === 'active' ? 'inactive' : 'active' })
      load()
    } catch (e: any) { alert(e.response?.data?.message) }
  }

  async function handleDelete(s: Service) {
    if (!confirm(`Excluir "${s.name}"?`)) return
    try { await servicesApi.remove(s.id); load() }
    catch (e: any) { alert(e.response?.data?.message) }
  }

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      <PageHeader title="Serviços" subtitle={`${services.length}/10 serviços cadastrados`} onBack={() => navigate('/profissional')} rightAction={
        <button onClick={() => { setShowForm(!showForm); setError('') }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 36, height: 36, color: 'white', fontSize: 20, cursor: 'pointer' }}>+</button>
      } />

      <div style={{ padding: '0 20px 100px' }}>
        {showForm && (
          <div style={{ background: '#f3f0ff', borderRadius: 20, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2d1b69', marginBottom: 16 }}>Novo serviço</h3>
            <Input label="Nome" placeholder="Ex: Corte de cabelo" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <Input label="Duração (minutos)" type="number" placeholder="30" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} />
            <Input label="Preço (R$)" type="number" placeholder="50" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
            {error && <p style={{ color: '#c62828', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button style={{ flex: 1 }} disabled={saving} onClick={handleCreate}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        )}

        {loading ? <Spinner /> : services.map(s => (
          <div key={s.id} style={{ background: 'white', border: '1.5px solid #e8e4f3', borderRadius: 20, padding: '14px 18px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: s.status === 'inactive' ? '#a0a0b8' : '#1a1a2e' }}>{s.name}</p>
                <p style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>{s.duration_minutes} min • R$ {Number(s.price).toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: s.status === 'active' ? '#e8f5e9' : '#f5f5f5', color: s.status === 'active' ? '#2e7d32' : '#a0a0b8', fontWeight: 600 }}>
                  {s.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button onClick={() => toggleStatus(s)} style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid #e8e4f3', background: 'white', fontSize: 12, color: '#6b6b8a', cursor: 'pointer' }}>
                {s.status === 'active' ? 'Desativar' : 'Ativar'}
              </button>
              <button onClick={() => handleDelete(s)} style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid #ffcdd2', background: 'white', fontSize: 12, color: '#c62828', cursor: 'pointer' }}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="services" role="professional" onChange={tab => { if (tab === 'calendar') navigate('/profissional'); if (tab === 'clients') navigate('/profissional/clientes'); if (tab === 'settings') navigate('/profissional/horarios') }} />
    </div>
  )
}
