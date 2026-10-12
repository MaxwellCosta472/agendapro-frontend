import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '../../components/ui'
import { appointmentsApi } from '../../services/api'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Agendado', color: '#2e7d32', bg: '#e8f5e9' },
  cancelled: { label: 'Cancelado', color: '#c62828', bg: '#ffebee' },
  expired: { label: 'Expirado', color: '#9C7C78', bg: '#EAD9D1' },
}

export function MyAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'cancelled'>('all')
  const [modal, setModal] = useState<{ type: 'cancel' | 'reschedule'; id: string } | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    appointmentsApi.list().then(r => setAppointments(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = appointments.filter(a => filter === 'all' ? true : a.status === filter)

  async function cancel() {
    if (!modal) return
    setActionLoading(true); setError('')
    try {
      await appointmentsApi.cancel(modal.id)
      setModal(null); load()
    } catch (e: any) { setError(e.response?.data?.message || 'Erro ao cancelar.') }
    finally { setActionLoading(false) }
  }

  async function reschedule() {
    if (!modal || !rescheduleDate || !rescheduleTime) return
    setActionLoading(true); setError('')
    try {
      await appointmentsApi.reschedule(modal.id, { date: rescheduleDate, start_time: rescheduleTime })
      setModal(null); setRescheduleDate(''); setRescheduleTime(''); load()
    } catch (e: any) { setError(e.response?.data?.message || 'Erro ao reagendar.') }
    finally { setActionLoading(false) }
  }

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#EAD9D1', padding: '52px 24px 24px' }}>
        <button onClick={() => navigate('/cliente')} style={{ background: 'rgba(123,90,88,0.12)', border: 'none', borderRadius: 10, width: 36, height: 36, color: '#7B5A58', fontSize: 18, cursor: 'pointer', marginBottom: 12 }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#3D2424' }}>Meus agendamentos</h1>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[['all', 'Todos'], ['scheduled', 'Ativos'], ['cancelled', 'Cancelados']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val as any)} style={{
              padding: '7px 16px', borderRadius: 20,
              background: filter === val ? '#7B5A58' : 'transparent',
              border: `1.5px solid ${filter === val ? '#7B5A58' : '#D4BEB8'}`,
              color: filter === val ? 'white' : '#9C7C78',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9C7C78' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📅</p>
            <p>Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((a: any) => {
              const st = STATUS_LABELS[a.status] || STATUS_LABELS.expired
              return (
                <div key={a.id} style={{ background: '#EAD9D1', borderRadius: 20, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#3D2424' }}>{a.service_name}</p>
                      <p style={{ fontSize: 13, color: '#9C7C78', marginTop: 3 }}>
                        {new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} • {a.start_time}
                      </p>
                    </div>
                    <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                      {st.label}
                    </span>
                  </div>
                  {a.status === 'scheduled' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setModal({ type: 'reschedule', id: a.id }); setError('') }} style={{
                        flex: 1, padding: '10px 0', borderRadius: 12, border: '1.5px solid #7B5A58',
                        background: 'transparent', color: '#7B5A58', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      }}>Reagendar</button>
                      <button onClick={() => { setModal({ type: 'cancel', id: a.id }); setError('') }} style={{
                        flex: 1, padding: '10px 0', borderRadius: 12, border: '1.5px solid #D4BEB8',
                        background: 'transparent', color: '#9C7C78', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      }}>Cancelar</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,36,36,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#F5EDE8', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 430 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3D2424', marginBottom: 20 }}>
              {modal.type === 'cancel' ? 'Cancelar agendamento?' : 'Reagendar'}
            </h3>
            {modal.type === 'reschedule' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Nova data</label>
                  <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>Novo horário</label>
                  <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} />
                </div>
              </div>
            )}
            {modal.type === 'cancel' && (
              <p style={{ color: '#9C7C78', fontSize: 14, marginBottom: 20 }}>Esta ação não pode ser desfeita.</p>
            )}
            {error && <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: '14px 0', borderRadius: 50, border: '1.5px solid #D4BEB8',
                background: 'transparent', color: '#9C7C78', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>Voltar</button>
              <button onClick={modal.type === 'cancel' ? cancel : reschedule} disabled={actionLoading} style={{
                flex: 1, padding: '14px 0', borderRadius: 50, border: 'none',
                background: modal.type === 'cancel' ? '#c62828' : '#7B5A58',
                color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: actionLoading ? 0.6 : 1,
              }}>
                {actionLoading ? '...' : modal.type === 'cancel' ? 'Confirmar cancelamento' : 'Confirmar reagendamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
