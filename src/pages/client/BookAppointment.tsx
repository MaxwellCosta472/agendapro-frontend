import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Spinner, PageHeader } from '../../components/ui'
import { servicesApi, appointmentsApi } from '../../services/api'
import { Service, AvailableSlot } from '../../types'

const PROFESSIONAL_ID = 'e5270fab-2d06-404b-a1f5-69463447ed63'

function addDays(date: Date, n: number) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function toYMD(d: Date) {
  return d.toISOString().split('T')[0]
}
function formatDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

export function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'service' | 'datetime' | 'confirm'>('service')
  const [services, setServices] = useState<Service[]>([])
  const [selected, setSelected] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState(toYMD(addDays(new Date(), 1)))
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const today = new Date()
  const dates = Array.from({ length: 15 }, (_, i) => addDays(today, i + 1))

  useEffect(() => {
    servicesApi.list(PROFESSIONAL_ID).then(r => setServices(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected || !selectedDate) return
    setLoadingSlots(true)
    setSelectedSlot(null)
    appointmentsApi.getAvailableSlots({ date: selectedDate, service_id: selected.id, professional_id: PROFESSIONAL_ID })
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selected, selectedDate])

  async function confirm() {
    if (!selected || !selectedSlot) return
    setLoading(true)
    setError('')
    try {
      await appointmentsApi.create({ professional_id: PROFESSIONAL_ID, service_id: selected.id, date: selectedDate, start_time: selectedSlot.start_time })
      setSuccess(true)
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao agendar.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Agendado!</h2>
      <p style={{ color: '#6b6b8a', marginBottom: 32 }}>{selected?.name} em {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} às {selectedSlot?.start_time}</p>
      <Button fullWidth onClick={() => navigate('/cliente/agendamentos')}>Ver meus agendamentos</Button>
      <Button fullWidth variant="outline" style={{ marginTop: 12 }} onClick={() => { setSuccess(false); setStep('service'); setSelected(null); setSelectedSlot(null) }}>Fazer outro agendamento</Button>
    </div>
  )

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      <PageHeader title={step === 'service' ? 'Escolha o serviço' : step === 'datetime' ? 'Escolha o horário' : 'Confirmar'} onBack={() => step === 'service' ? navigate('/cliente') : step === 'datetime' ? setStep('service') : setStep('datetime')} />

      <div style={{ padding: '0 20px 100px' }}>

        {step === 'service' && (
          <>
            <p style={{ fontSize: 14, color: '#6b6b8a', marginBottom: 20 }}>Selecione o serviço desejado</p>
            {services.map(s => (
              <div key={s.id} onClick={() => setSelected(s)} style={{ background: selected?.id === s.id ? '#f3f0ff' : 'white', border: `1.5px solid ${selected?.id === s.id ? '#7c5cbf' : '#e8e4f3'}`, borderRadius: 20, padding: '16px 20px', marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .15s' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>{s.name}</p>
                  <p style={{ fontSize: 12, color: '#a0a0b8', marginTop: 3 }}>{s.duration_minutes} min</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, fontSize: 16, color: '#7c5cbf' }}>R$ {Number(s.price).toFixed(2)}</p>
                  {selected?.id === s.id && <p style={{ fontSize: 11, color: '#7c5cbf', marginTop: 2 }}>✓ Selecionado</p>}
                </div>
              </div>
            ))}
            <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '16px 20px', background: 'white', borderTop: '1px solid #e8e4f3' }}>
              <Button fullWidth disabled={!selected} onClick={() => setStep('datetime')}>Continuar</Button>
            </div>
          </>
        )}

        {step === 'datetime' && (
          <>
            <p style={{ fontSize: 14, color: '#6b6b8a', marginBottom: 16 }}>Escolha a data</p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }}>
              {dates.map(d => {
                const ymd = toYMD(d)
                const active = ymd === selectedDate
                return (
                  <div key={ymd} onClick={() => setSelectedDate(ymd)} style={{ minWidth: 56, height: 72, borderRadius: 16, border: `1.5px solid ${active ? '#7c5cbf' : '#e8e4f3'}`, background: active ? '#7c5cbf' : 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.8)' : '#a0a0b8', textTransform: 'uppercase' }}>{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: active ? 'white' : '#1a1a2e', marginTop: 2 }}>{d.getDate()}</span>
                  </div>
                )
              })}
            </div>

            <p style={{ fontSize: 14, color: '#6b6b8a', marginBottom: 12 }}>Horários disponíveis</p>
            {loadingSlots ? <Spinner /> : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#a0a0b8' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>😔</p>
                <p>Sem horários disponíveis neste dia</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {slots.map(slot => (
                  <div key={slot.start_time} onClick={() => slot.available && setSelectedSlot(slot)} style={{ height: 44, borderRadius: 12, border: `1.5px solid ${!slot.available ? '#f0eef8' : selectedSlot?.start_time === slot.start_time ? '#7c5cbf' : '#e8e4f3'}`, background: !slot.available ? '#fafafa' : selectedSlot?.start_time === slot.start_time ? '#7c5cbf' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: slot.available ? 'pointer' : 'not-allowed', transition: 'all .15s' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: !slot.available ? '#d0cce0' : selectedSlot?.start_time === slot.start_time ? 'white' : '#1a1a2e' }}>{slot.start_time}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '16px 20px', background: 'white', borderTop: '1px solid #e8e4f3' }}>
              <Button fullWidth disabled={!selectedSlot} onClick={() => setStep('confirm')}>Continuar</Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div style={{ background: '#f3f0ff', borderRadius: 24, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d1b69', marginBottom: 16 }}>Resumo do agendamento</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#6b6b8a', fontSize: 14 }}>Serviço</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 14 }}>{selected?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#6b6b8a', fontSize: 14 }}>Data</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 14 }}>{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#6b6b8a', fontSize: 14 }}>Horário</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 14 }}>{selectedSlot?.start_time} – {selectedSlot?.end_time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e8e4f3', paddingTop: 12, marginTop: 4 }}>
                <span style={{ color: '#6b6b8a', fontSize: 14 }}>Valor</span>
                <span style={{ fontWeight: 700, color: '#7c5cbf', fontSize: 16 }}>R$ {Number(selected?.price).toFixed(2)}</span>
              </div>
            </div>
            {error && <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <Button fullWidth disabled={loading} onClick={confirm}>{loading ? 'Agendando...' : 'Confirmar agendamento'}</Button>
            <Button fullWidth variant="outline" style={{ marginTop: 12 }} onClick={() => setStep('datetime')}>Voltar</Button>
          </>
        )}
      </div>
    </div>
  )
}
