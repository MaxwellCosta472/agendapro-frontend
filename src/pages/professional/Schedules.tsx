import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Spinner, BottomNav, PageHeader } from '../../components/ui'
import { schedulesApi } from '../../services/api'

const DAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export function Schedules() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<any[]>([])
  const [closedDays, setClosedDays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editDay, setEditDay] = useState<number | null>(null)
  const [periods, setPeriods] = useState([{ start_time: '09:00', end_time: '18:00' }])
  const [saving, setSaving] = useState(false)
  const [closeDate, setCloseDate] = useState('')
  const [closeReason, setCloseReason] = useState('')

  function load() {
    Promise.all([schedulesApi.list(), schedulesApi.listClosedDays()])
      .then(([s, c]) => { setSchedules(s.data); setClosedDays(c.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function getPeriodsForDay(dayOfWeek: number) {
    return schedules.filter((s: any) => s.day_of_week === dayOfWeek)
  }

  async function saveDay() {
    if (editDay === null) return
    setSaving(true)
    try {
      await schedulesApi.upsert(periods.map(p => ({ day_of_week: editDay, ...p })))
      setEditDay(null)
      load()
    } catch (e: any) { alert(e.response?.data?.message) }
    finally { setSaving(false) }
  }

  async function handleClearDay(day: number) {
    if (!confirm(`Remover todos os horários de ${DAYS[day]}? O dia ficará sem atendimento.`)) return
    setSaving(true)
    try {
      await schedulesApi.clearDay(day)
      setEditDay(null)
      load()
    } catch (e: any) { alert(e.response?.data?.message) }
    finally { setSaving(false) }
  }

  async function handleCloseDay() {
    if (!closeDate) return
    try { await schedulesApi.closeDay(closeDate, closeReason); setCloseDate(''); setCloseReason(''); load() }
    catch (e: any) { alert(e.response?.data?.message) }
  }

  async function handleOpenDay(date: string) {
    if (!confirm('Reabrir este dia?')) return
    try { await schedulesApi.openDay(date); load() }
    catch (e: any) { alert(e.response?.data?.message) }
  }

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      <PageHeader title="Configurar horários" subtitle="Defina quando você atende" onBack={() => navigate('/profissional')} />
      <div style={{ padding: '0 20px 100px' }}>
        {loading ? <Spinner /> : (
          <>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6b6b8a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Agenda semanal</h3>
            {[1,2,3,4,5,6,0].map(day => {
              const dayPeriods = getPeriodsForDay(day)
              const isEditing = editDay === day
              return (
                <div key={day} style={{ background: 'white', border: '1.5px solid #e8e4f3', borderRadius: 20, padding: '14px 18px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{DAYS[day]}</p>
                      {dayPeriods.length > 0 ? dayPeriods.map((p: any, i: number) => (
                        <p key={i} style={{ fontSize: 12, color: '#7c5cbf', marginTop: 2 }}>{p.start_time.slice(0,5)} – {p.end_time.slice(0,5)}</p>
                      )) : <p style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>Sem atendimento</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {dayPeriods.length > 0 && !isEditing && (
                        <button onClick={() => handleClearDay(day)} disabled={saving} style={{ background: '#ffebee', border: 'none', borderRadius: 10, padding: '6px 14px', color: '#c62828', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Fechar dia
                        </button>
                      )}
                      <button onClick={() => { setEditDay(isEditing ? null : day); setPeriods(dayPeriods.length > 0 ? dayPeriods.map((p: any) => ({ start_time: p.start_time.slice(0,5), end_time: p.end_time.slice(0,5) })) : [{ start_time: '09:00', end_time: '18:00' }]) }} style={{ background: '#f3f0ff', border: 'none', borderRadius: 10, padding: '6px 14px', color: '#7c5cbf', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {isEditing ? 'Cancelar' : 'Editar'}
                      </button>
                    </div>
                  </div>
                  {isEditing && (
                    <div style={{ marginTop: 14, borderTop: '1px solid #e8e4f3', paddingTop: 14 }}>
                      {periods.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                          <input type="time" value={p.start_time} onChange={e => { const np = [...periods]; np[i].start_time = e.target.value; setPeriods(np) }} style={{ flex: 1, height: 40, borderRadius: 10, border: '1.5px solid #e8e4f3', padding: '0 10px', fontSize: 14 }} />
                          <span style={{ color: '#a0a0b8' }}>–</span>
                          <input type="time" value={p.end_time} onChange={e => { const np = [...periods]; np[i].end_time = e.target.value; setPeriods(np) }} style={{ flex: 1, height: 40, borderRadius: 10, border: '1.5px solid #e8e4f3', padding: '0 10px', fontSize: 14 }} />
                          {periods.length > 1 && <button onClick={() => setPeriods(periods.filter((_, j) => j !== i))} style={{ background: '#ffebee', border: 'none', borderRadius: 8, width: 32, height: 32, color: '#c62828', cursor: 'pointer', fontSize: 16 }}>×</button>}
                        </div>
                      ))}
                      {periods.length < 3 && <button onClick={() => setPeriods([...periods, { start_time: '14:00', end_time: '18:00' }])} style={{ background: 'none', border: '1px dashed #9b7fe8', borderRadius: 10, width: '100%', height: 36, color: '#7c5cbf', fontSize: 13, cursor: 'pointer', marginBottom: 10 }}>+ Adicionar período</button>}
                      <Button fullWidth disabled={saving} onClick={saveDay}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                  )}
                </div>
              )
            })}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6b6b8a', marginBottom: 12, marginTop: 24, textTransform: 'uppercase', letterSpacing: '.05em' }}>Fechar dia específico</h3>
            <div style={{ background: 'white', border: '1.5px solid #e8e4f3', borderRadius: 20, padding: '16px 18px', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} style={{ flex: 1, height: 44, borderRadius: 10, border: '1.5px solid #e8e4f3', padding: '0 12px', fontSize: 14 }} />
                <Button style={{ height: 44, padding: '0 16px' }} onClick={handleCloseDay}>Fechar</Button>
              </div>
              <input value={closeReason} onChange={e => setCloseReason(e.target.value)} placeholder="Motivo (opcional)" style={{ width: '100%', height: 40, borderRadius: 10, border: '1.5px solid #e8e4f3', padding: '0 12px', fontSize: 13 }} />
            </div>
            {closedDays.length > 0 && closedDays.map((d: any) => (
              <div key={d.id} style={{ background: '#ffebee', border: '1.5px solid #ffcdd2', borderRadius: 16, padding: '10px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#c62828' }}>{new Date(d.date).toLocaleDateString('pt-BR')}</p>
                  {d.reason && <p style={{ fontSize: 12, color: '#e57373' }}>{d.reason}</p>}
                </div>
                <button onClick={() => handleOpenDay(d.date.split('T')[0])} style={{ background: 'white', border: '1px solid #ffcdd2', borderRadius: 8, padding: '4px 10px', color: '#c62828', fontSize: 12, cursor: 'pointer' }}>Reabrir</button>
              </div>
            ))}
          </>
        )}
      </div>
      <BottomNav active="settings" role="professional" onChange={tab => { if (tab === 'calendar') navigate('/profissional'); if (tab === 'services') navigate('/profissional/servicos'); if (tab === 'clients') navigate('/profissional/clientes') }} />
    </div>
  )
}
