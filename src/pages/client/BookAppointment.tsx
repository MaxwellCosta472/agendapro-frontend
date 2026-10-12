import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Spinner } from '../../components/ui'
import { servicesApi, appointmentsApi } from '../../services/api'

const PROFESSIONAL_ID = 'a2fd0278-4bc3-abf2-e9af4bfe7179'

function addDays(date: Date, n: number) { const d = new Date(date); d.setDate(d.getDate() + n); return d }
function toYMD(d: Date) { return d.toISOString().split('T')[0] }

export function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'service' | 'datetime' | 'confirm'>('service')
  const [services, setServices] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(toYMD(addDays(new Date(), 1)))
  const [slots, setSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const dates = Array.from({ length: 15 }, (_, i) => addDays(new Date(), i + 1))

  useEffect(() => {
    servicesApi.list(PROFESSIONAL_ID).then(r => setServices(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected || !selectedDate) return
    setLoadingSlots(true); setSelectedSlot(null)
    appointmentsApi.getAvailableSlots({ date: selectedDate, service_id: selected.id, professional_id: PROFESSIONAL_ID })
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selected, selectedDate])

  async function confirm() {
    if (!selected || !selectedSlot) return
    setLoading(true); setError('')
    try {
      await appointmentsApi.create({ professional_id: PROFESSIONAL_ID, service_id: selected.id, date: selectedDate, start_time: selectedSlot.start_time })
      setSuccess(true)
    } catch (e: any) { setError(e.response?.data?.message ?? 'Erro ao agendar.') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 32, textAlign: 'center' }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#EAD9D1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 24 }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#3D2424', marginBottom: 8 }}>Agendado!</h2>
      <p style={{ color: '#9C7C78', marginBottom: 32 }}>
        {selected?.name} em {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} às {selectedSlot?.start_time}
      </p>
      <Button fullWidth onClick={() => navigate('/cliente/agendamentos')}>Ver meus agendamentos</Button>
      <Button fullWidth variant="outline" style={{ marginTop: 12 }} onClick={() => { setSuccess(false); setStep('service'); setSelected(null); setSelectedSlot(null) }}>
        Fazer outro agendamento
      </Button>
    </div>
  )

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#EAD9D1', padding: '52px 24px 24px' }}>
        <button onClick={() => step === 'service' ? navigate('/cliente') : step === 'datetime' ? setStep('service') : setStep('datetime')}
          style={{ background: 'rgba(123,90,88,0.12)', border: 'none', borderRadius: 10, width: 36, height: 36, color: '#7B5A58', fontSize: 18, cursor: 'pointer', marginBottom: 12 }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#3D2424' }}>
          {step === 'service' ? 'Escolha o serviço' : step === 'datetime' ? 'Escolha o horário' : 'Confirmar agendamento'}
        </h1>
        {/* Progresso */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {['service', 'datetime', 'confirm'].map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: ['service', 'datetime', 'confirm'].indexOf(step) >= i ? '#7B5A58' : '#D4BEB8'
            }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 20px 120px' }}>
        {/* STEP 1: Serviço */}
        {step === 'service' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {services.map(s => (
                <div key={s.id} onClick={() => setSelected(s)} style={{
                  background: selected?.id === s.id ? '#7B5A58' : '#EAD9D1',
                  borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                  border: `2px solid ${selected?.id === s.id ? '#7B5A58' : 'transparent'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ height: 90, background: selected?.id === s.id ? 'rgba(255,255,255,0.1)' : '#D4BEB8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, color: selected?.id === s.id ? 'rgba(255,255,255,0.4)' : '#9C7C78', textAlign: 'center', padding: '0 8px' }}>IMAGEM ILUSTRATIVA DO SERVIÇO</span>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: selected?.id === s.id ? 'white' : '#3D2424', marginBottom: 6 }}>{s.name}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 11, color: selected?.id === s.id ? 'rgba(255,255,255,0.7)' : '#9C7C78' }}>{s.duration_minutes}min</span>
                      <span style={{ fontSize: 11, color: selected?.id === s.id ? 'rgba(255,255,255,0.4)' : '#D4BEB8' }}>|</span>
                      <span style={{ fontSize: 11, color: selected?.id === s.id ? 'rgba(255,255,255,0.7)' : '#9C7C78' }}>R${Number(s.price).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP 2: Data e Horário */}
        {step === 'datetime' && (
          <>
            <p style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Escolha a data</p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 28 }}>
              {dates.map(d => {
                const ymd = toYMD(d)
                const active = ymd === selectedDate
                return (
                  <div key={ymd} onClick={() => setSelectedDate(ymd)} style={{
                    minWidth: 56, height: 72, borderRadius: 16,
                    border: `1.5px solid ${active ? '#7B5A58' : '#D4BEB8'}`,
                    background: active ? '#7B5A58' : '#EAD9D1',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.7)' : '#9C7C78', textTransform: 'uppercase' }}>
                      {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: active ? 'white' : '#3D2424', marginTop: 2 }}>{d.getDate()}</span>
                  </div>
                )
              })}
            </div>

            <p style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Horários disponíveis</p>
            {loadingSlots ? <Spinner /> : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9C7C78' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>😔</p>
                <p>Sem horários disponíveis neste dia</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {slots.map((slot: any) => (
                  <div key={slot.start_time} onClick={() => slot.available && setSelectedSlot(slot)} style={{
                    height: 46, borderRadius: 12,
                    border: `1.5px solid ${!slot.available ? '#EAD9D1' : selectedSlot?.start_time === slot.start_time ? '#7B5A58' : '#D4BEB8'}`,
                    background: !slot.available ? '#F0E8E4' : selectedSlot?.start_time === slot.start_time ? '#7B5A58' : '#EAD9D1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: slot.available ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: !slot.available ? '#C4B0AC' : selectedSlot?.start_time === slot.start_time ? 'white' : '#3D2424' }}>
                      {slot.start_time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* STEP 3: Confirmação */}
        {step === 'confirm' && (
          <>
            <div style={{ background: '#EAD9D1', borderRadius: 20, padding: 24, marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>Resumo do agendamento</p>
              {[
                { label: 'Serviço', value: selected?.name },
                { label: 'Data', value: new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) },
                { label: 'Horário', value: `${selectedSlot?.start_time} – ${selectedSlot?.end_time}` },
                { label: 'Duração', value: `${selected?.duration_minutes} min` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ color: '#9C7C78', fontSize: 14 }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: '#3D2424', fontSize: 14, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #D4BEB8', paddingTop: 14, marginTop: 4 }}>
                <span style={{ color: '#9C7C78', fontSize: 14 }}>Valor</span>
                <span style={{ fontWeight: 700, color: '#7B5A58', fontSize: 18 }}>R$ {Number(selected?.price).toFixed(2)}</span>
              </div>
            </div>
            {error && <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          </>
        )}
      </div>

      {/* Footer fixo */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '16px 20px', background: '#F5EDE8', borderTop: '1px solid #D4BEB8' }}>
        {step === 'confirm' ? (
          <>
            <Button fullWidth disabled={loading} onClick={confirm}>{loading ? 'Agendando...' : 'Confirmar agendamento'}</Button>
            <Button fullWidth variant="outline" style={{ marginTop: 10 }} onClick={() => setStep('datetime')}>Voltar</Button>
          </>
        ) : (
          <Button fullWidth disabled={step === 'service' ? !selected : !selectedSlot} onClick={() => step === 'service' ? setStep('datetime') : setStep('confirm')}>
            Continuar
          </Button>
        )}
      </div>
    </div>
  )
}
