import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, Button } from '../../components/ui'
import { schedulesApi } from '../../services/api'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function Schedules() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'weekly' | 'closed' | 'blocked'>('weekly')
  const [weekly, setWeekly] = useState<any[]>([])
  const [closed, setClosed] = useState<any[]>([])
  const [blocked, setBlocked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [newClosed, setNewClosed] = useState({ date: '', reason: '' })
  const [newBlocked, setNewBlocked] = useState({ date: '', start_time: '', end_time: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      schedulesApi.getWeekly().catch(() => ({ data: [] })),
      schedulesApi.getClosedDays().catch(() => ({ data: [] })),
      schedulesApi.getBlockedSlots().catch(() => ({ data: [] })),
    ]).then(([w, c, b]) => {
      setWeekly(w.data || [])
      setClosed(c.data || [])
      setBlocked(b.data || [])
    }).finally(() => setLoading(false))
  }, [])

  async function saveWeekly(item: any) {
    try { await schedulesApi.updateWeekly(item.day_of_week, item); } catch {}
  }

  function toggleDay(dayIdx: number, field: 'is_active' | 'start_time' | 'end_time', value: any) {
    const updated = weekly.map(d => d.day_of_week === dayIdx ? { ...d, [field]: value } : d)
    setWeekly(updated)
    const day = updated.find(d => d.day_of_week === dayIdx)
    if (day) saveWeekly(day)
  }

  async function addClosed(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await schedulesApi.addClosedDay(newClosed)
      setNewClosed({ date: '', reason: '' })
      const r = await schedulesApi.getClosedDays()
      setClosed(r.data || [])
    } catch (e: any) { setError(e.response?.data?.message || 'Erro.') }
    finally { setSaving(false) }
  }

  async function removeClosedDay(id: string) {
    try { await schedulesApi.removeClosedDay(id); const r = await schedulesApi.getClosedDays(); setClosed(r.data || []) } catch {}
  }

  async function addBlocked(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await schedulesApi.addBlockedSlot(newBlocked)
      setNewBlocked({ date: '', start_time: '', end_time: '', reason: '' })
      const r = await schedulesApi.getBlockedSlots()
      setBlocked(r.data || [])
    } catch (e: any) { setError(e.response?.data?.message || 'Erro.') }
    finally { setSaving(false) }
  }

  async function removeBlocked(id: string) {
    try { await schedulesApi.removeBlockedSlot(id); const r = await schedulesApi.getBlockedSlots(); setBlocked(r.data || []) } catch {}
  }

  const navTabs = [
    { icon: '📋', label: 'Agenda', path: '/profissional' },
    { icon: '✂️', label: 'Serviços', path: '/profissional/servicos' },
    { icon: '👥', label: 'Clientes', path: '/profissional/clientes' },
    { icon: '⚙️', label: 'Config', path: '/profissional/horarios' },
  ]

  return (
    <div className="screen" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: '#EAD9D1', padding: '52px 24px 20px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#3D2424', marginBottom: 16 }}>Configurar horários</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['weekly', 'Semana'], ['closed', 'Dias fechados'], ['blocked', 'Bloqueios']].map(([val, label]) => (
            <button key={val} onClick={() => { setTab(val as any); setError('') }} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === val ? '#7B5A58' : '#D4BEB8',
              color: tab === val ? 'white' : '#9C7C78',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {loading ? <Spinner /> : (
          <>
            {/* Agenda semanal */}
            {tab === 'weekly' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DAYS.map((dayName, i) => {
                  const day = weekly.find((d: any) => d.day_of_week === i) || { day_of_week: i, is_active: false, start_time: '08:00', end_time: '18:00' }
                  return (
                    <div key={i} style={{ background: '#EAD9D1', borderRadius: 18, padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: day.is_active ? 12 : 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: day.is_active ? '#3D2424' : '#9C7C78' }}>{dayName}</p>
                        <button onClick={() => toggleDay(i, 'is_active', !day.is_active)} style={{
                          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: day.is_active ? '#7B5A58' : '#D4BEB8', position: 'relative', transition: 'background 0.2s',
                        }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%', background: 'white',
                            position: 'absolute', top: 3, left: day.is_active ? 23 : 3, transition: 'left 0.2s',
                          }} />
                        </button>
                      </div>
                      {day.is_active && (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 11, color: '#9C7C78', display: 'block', marginBottom: 4 }}>Início</label>
                            <input type="time" value={day.start_time || '08:00'} onChange={e => toggleDay(i, 'start_time', e.target.value)} style={{ padding: '8px 10px', fontSize: 14 }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 11, color: '#9C7C78', display: 'block', marginBottom: 4 }}>Fim</label>
                            <input type="time" value={day.end_time || '18:00'} onChange={e => toggleDay(i, 'end_time', e.target.value)} style={{ padding: '8px 10px', fontSize: 14 }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Dias fechados */}
            {tab === 'closed' && (
              <>
                <form onSubmit={addClosed} style={{ background: '#EAD9D1', borderRadius: 18, padding: 18, marginBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#3D2424', marginBottom: 12 }}>Adicionar dia fechado</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#9C7C78', display: 'block', marginBottom: 4 }}>Data</label>
                      <input type="date" value={newClosed.date} onChange={e => setNewClosed(f => ({ ...f, date: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#9C7C78', display: 'block', marginBottom: 4 }}>Motivo (opcional)</label>
                      <input type="text" placeholder="Ex: Feriado, viagem..." value={newClosed.reason} onChange={e => setNewClosed(f => ({ ...f, reason: e.target.value }))} />
                    </div>
                  </div>
                  {error && <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 10, padding: '8px 12px', fontSize: 12, marginTop: 10 }}>{error}</div>}
                  <button type="submit" disabled={saving} style={{ width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 50, border: 'none', background: '#7B5A58', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Salvando...' : 'Adicionar'}
                  </button>
                </form>
                {closed.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9C7C78', padding: '24px 0' }}>Nenhum dia fechado cadastrado</p>
                ) : closed.map((c: any) => (
                  <div key={c.id} style={{ background: '#EAD9D1', borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#3D2424' }}>{new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      {c.reason && <p style={{ fontSize: 12, color: '#9C7C78', marginTop: 2 }}>{c.reason}</p>}
                    </div>
                    <button onClick={() => removeClosedDay(c.id)} style={{ background: 'none', border: 'none', color: '#c62828', fontSize: 18, cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </>
            )}

            {/* Bloqueios */}
            {tab === 'blocked' && (
              <>
                <form onSubmit={addBlocked} style={{ background: '#EAD9D1', borderRadius: 18, padding: 18, marginBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#3D2424', marginBottom: 12 }}>Adicionar bloqueio</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#9C7C78', display: 'block', marginBottom: 4 }}>Data</label>
                      <input type="date" value={newBlocked.date} onChange={e => setNewBlocked(f => ({ ...f, date: e.target.value }))} required />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: '#9C7C78', display: 'block', marginBottom: 4 }}>Das</label>
                        <input type="time" value={newBlocked.start_time} onChange={e => setNewBlocked(f => ({ ...f, start_time: e.target.value }))} required />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: '#9C7C78', display: 'block', marginBottom: 4 }}>Até</label>
                        <input type="time" value={newBlocked.end_time} onChange={e => setNewBlocked(f => ({ ...f, end_time: e.target.value }))} required />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#9C7C78', display: 'block', marginBottom: 4 }}>Motivo (opcional)</label>
                      <input type="text" placeholder="Ex: Almoço, reunião..." value={newBlocked.reason} onChange={e => setNewBlocked(f => ({ ...f, reason: e.target.value }))} />
                    </div>
                  </div>
                  {error && <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 10, padding: '8px 12px', fontSize: 12, marginTop: 10 }}>{error}</div>}
                  <button type="submit" disabled={saving} style={{ width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 50, border: 'none', background: '#7B5A58', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Salvando...' : 'Adicionar'}
                  </button>
                </form>
                {blocked.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9C7C78', padding: '24px 0' }}>Nenhum bloqueio cadastrado</p>
                ) : blocked.map((b: any) => (
                  <div key={b.id} style={{ background: '#EAD9D1', borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#3D2424' }}>{new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR')} · {b.start_time}–{b.end_time}</p>
                      {b.reason && <p style={{ fontSize: 12, color: '#9C7C78', marginTop: 2 }}>{b.reason}</p>}
                    </div>
                    <button onClick={() => removeBlocked(b.id)} style={{ background: 'none', border: 'none', color: '#c62828', fontSize: 18, cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: '#EAD9D1', borderTop: '1px solid #D4BEB8',
        display: 'flex', justifyContent: 'space-around', padding: '10px 0 18px', zIndex: 100,
      }}>
        {navTabs.map(tab => (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px',
          }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab.path === '/profissional/horarios' ? 700 : 400, color: tab.path === '/profissional/horarios' ? '#7B5A58' : '#9C7C78' }}>
              {tab.label}
            </span>
            {tab.path === '/profissional/horarios' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B5A58', marginTop: 1 }} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
