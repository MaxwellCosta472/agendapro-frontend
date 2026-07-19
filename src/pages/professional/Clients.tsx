import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, BottomNav, PageHeader } from '../../components/ui'
import { clientsApi } from '../../services/api'

export function Clients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    clientsApi.list().then(r => setClients(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function toggleBan(c: any) {
    const msg = c.is_banned ? `Desbanir ${c.name}?` : `Banir ${c.name}? Isso cancelará todos os agendamentos ativos.`
    if (!confirm(msg)) return
    try {
      if (c.is_banned) await clientsApi.unban(c.id)
      else await clientsApi.ban(c.id)
      load()
    } catch (e: any) { alert(e.response?.data?.message) }
  }

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))

  function initials(name: string) { return name.split(' ').slice(0,2).map((n: string) => n[0]).join('').toUpperCase() }

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      <PageHeader title="Clientes" subtitle={`${clients.length} clientes cadastrados`} onBack={() => navigate('/profissional')} />

      <div style={{ padding: '0 20px 100px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou telefone..." style={{ width: '100%', height: 46, borderRadius: 12, border: '1.5px solid #e8e4f3', background: '#f8f6ff', padding: '0 16px', fontSize: 14, color: '#1a1a2e', outline: 'none', marginBottom: 20 }} />

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#a0a0b8' }}>
            <p style={{ fontSize: 36, marginBottom: 8 }}>👥</p>
            <p>{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}</p>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} style={{ background: 'white', border: '1.5px solid #e8e4f3', borderRadius: 20, padding: '14px 18px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: c.is_banned ? '#ffebee' : '#f3f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: c.is_banned ? '#c62828' : '#7c5cbf', flexShrink: 0 }}>
                {initials(c.name)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{c.name}</p>
                <p style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>{c.phone}</p>
              </div>
              {c.is_banned && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#ffebee', color: '#c62828', fontWeight: 600 }}>Banido</span>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => toggleBan(c)} style={{ flex: 1, height: 32, borderRadius: 8, border: `1px solid ${c.is_banned ? '#e8f5e9' : '#ffcdd2'}`, background: 'white', fontSize: 12, color: c.is_banned ? '#2e7d32' : '#c62828', cursor: 'pointer', fontWeight: 500 }}>
                {c.is_banned ? 'Desbanir' : 'Banir cliente'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="clients" role="professional" onChange={tab => { if (tab === 'calendar') navigate('/profissional'); if (tab === 'services') navigate('/profissional/servicos'); if (tab === 'settings') navigate('/profissional/horarios') }} />
    </div>
  )
}
