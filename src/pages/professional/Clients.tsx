import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '../../components/ui'
import { clientsApi } from '../../services/api'

export function Clients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    clientsApi.list().then(r => setClients(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function toggleBan(id: string, banned: boolean) {
    try {
      if (banned) await clientsApi.unban(id)
      else await clientsApi.ban(id)
      load()
    } catch {}
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const tabs = [
    { icon: '📋', label: 'Agenda', path: '/profissional' },
    { icon: '✂️', label: 'Serviços', path: '/profissional/servicos' },
    { icon: '👥', label: 'Clientes', path: '/profissional/clientes' },
    { icon: '⚙️', label: 'Config', path: '/profissional/horarios' },
  ]

  return (
    <div className="screen" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: '#EAD9D1', padding: '52px 24px 20px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#3D2424', marginBottom: 16 }}>Clientes</h1>
        <input
          type="text" placeholder="🔍  Buscar por nome, email ou telefone"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: '#D4BEB8', border: '1.5px solid transparent', borderRadius: 14, padding: '12px 16px', width: '100%', fontSize: 14 }}
        />
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9C7C78' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>👥</p>
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((c: any) => (
              <div key={c.id} style={{ background: '#EAD9D1', borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.is_banned ? '#D4BEB8' : '#7B5A58', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{c.name?.[0]?.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: c.is_banned ? '#9C7C78' : '#3D2424' }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: '#9C7C78', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.phone || c.email}</p>
                  {c.is_banned && <span style={{ fontSize: 10, color: '#c62828', fontWeight: 600 }}>BANIDO</span>}
                </div>
                <button onClick={() => toggleBan(c.id, c.is_banned)} style={{
                  padding: '8px 14px', borderRadius: 12, border: '1.5px solid #D4BEB8',
                  background: 'transparent', color: c.is_banned ? '#7B5A58' : '#c62828',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  {c.is_banned ? 'Desbanir' : 'Banir'}
                </button>
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
            <span style={{ fontSize: 10, fontWeight: tab.path === '/profissional/clientes' ? 700 : 400, color: tab.path === '/profissional/clientes' ? '#7B5A58' : '#9C7C78' }}>
              {tab.label}
            </span>
            {tab.path === '/profissional/clientes' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B5A58', marginTop: 1 }} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
