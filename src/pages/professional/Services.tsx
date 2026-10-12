import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '../../components/ui'
import { servicesApi } from '../../services/api'

function saveServiceImage(id: string, dataUrl: string) {
  try { localStorage.setItem(`svc_img_${id}`, dataUrl) } catch {}
}
function getServiceImage(id: string): string | null {
  try { return localStorage.getItem(`svc_img_${id}`) } catch { return null }
}
function removeServiceImage(id: string) {
  try { localStorage.removeItem(`svc_img_${id}`) } catch {}
}

export function Services() {
  const navigate = useNavigate()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', duration_minutes: '', price: '', description: '' })
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function load() {
    setLoading(true)
    servicesApi.listMine()
      .then(r => setServices(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Imagem muito grande. Máximo 2MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setImgPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function createService(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Informe o nome do serviço.'); return }
    if (!form.duration_minutes || Number(form.duration_minutes) < 1) { setError('Informe a duração em minutos.'); return }
    if (!form.price || Number(form.price) < 0) { setError('Informe o preço.'); return }
    setSaving(true); setError('')
    try {
      const res = await servicesApi.create({
        name: form.name.trim(),
        duration_minutes: Number(form.duration_minutes),
        price: Number(form.price),
        description: form.description || undefined,
      })
      // Salvar imagem localmente vinculada ao ID do serviço
      const newId = res.data?.id || res.data?.service?.id
      if (newId && imgPreview) saveServiceImage(newId, imgPreview)
      setForm({ name: '', duration_minutes: '', price: '', description: '' })
      setImgPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      setShowForm(false)
      load()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || `Erro ${err.response?.status || ''}: não foi possível criar o serviço.`
      setError(msg)
    } finally { setSaving(false) }
  }

  async function toggle(id: string, active: boolean) {
    try { await servicesApi.update(id, { is_active: !active }); load() } catch {}
  }

  async function remove(id: string) {
    if (!window.confirm('Excluir este serviço?')) return
    try {
      await servicesApi.remove(id)
      removeServiceImage(id)
      load()
    } catch {}
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
        {services.length < 10 && !showForm && (
          <button onClick={() => setShowForm(true)} style={{
            width: '100%', padding: '16px', borderRadius: 18,
            border: '2px dashed #D4BEB8', background: 'transparent',
            color: '#7B5A58', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 16,
          }}>
            + Novo serviço
          </button>
        )}

        {showForm && (
          <form onSubmit={createService} style={{ background: '#EAD9D1', borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#3D2424', marginBottom: 16 }}>Novo serviço</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Imagem do serviço */}
              <div>
                <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 8, fontWeight: 600 }}>Imagem ilustrativa</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    height: 120, borderRadius: 14, border: '2px dashed #D4BEB8',
                    background: imgPreview ? 'transparent' : '#F5EDE8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                  }}
                >
                  {imgPreview
                    ? <img src={imgPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ textAlign: 'center', color: '#9C7C78' }}>
                        <p style={{ fontSize: 24, marginBottom: 6 }}>📷</p>
                        <p style={{ fontSize: 12 }}>Toque para adicionar foto</p>
                        <p style={{ fontSize: 11, marginTop: 2 }}>JPG, PNG — máx. 2MB</p>
                      </div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                {imgPreview && (
                  <button type="button" onClick={() => { setImgPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                    style={{ background: 'none', border: 'none', color: '#c62828', fontSize: 12, cursor: 'pointer', marginTop: 6 }}>
                    Remover imagem
                  </button>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6, fontWeight: 600 }}>Nome do serviço *</label>
                <input type="text" placeholder="Ex: Corte feminino" value={form.name} onChange={set('name')} required />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6, fontWeight: 600 }}>Duração (min) *</label>
                  <input type="number" placeholder="60" value={form.duration_minutes} onChange={set('duration_minutes')} required min={1} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#9C7C78', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6, fontWeight: 600 }}>Preço (R$) *</label>
                  <input type="number" placeholder="150" value={form.price} onChange={set('price')} required min={0} step="0.01" />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: '#ffebee', color: '#c62828', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginTop: 14, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => { setShowForm(false); setError(''); setImgPreview(null) }} style={{
                flex: 1, padding: '13px 0', borderRadius: 50, border: '1.5px solid #D4BEB8',
                background: 'transparent', color: '#9C7C78', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{
                flex: 2, padding: '13px 0', borderRadius: 50, border: 'none',
                background: '#7B5A58', color: 'white', fontWeight: 700, fontSize: 14,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
              }}>{saving ? 'Salvando...' : 'Salvar serviço'}</button>
            </div>
          </form>
        )}

        {loading ? <Spinner /> : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9C7C78' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✂️</p>
            <p style={{ fontWeight: 600 }}>Nenhum serviço cadastrado ainda</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Toque em "+ Novo serviço" para começar</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {services.map((s: any) => {
              const img = getServiceImage(s.id)
              return (
                <div key={s.id} style={{ background: '#EAD9D1', borderRadius: 18, overflow: 'hidden' }}>
                  {img && <img src={img} alt={s.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />}
                  <div style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#3D2424' }}>{s.name}</p>
                        <p style={{ fontSize: 13, color: '#9C7C78', marginTop: 2 }}>{s.duration_minutes}min · R${Number(s.price).toFixed(2)}</p>
                      </div>
                      <span style={{
                        background: s.is_active ? '#e8f5e9' : '#EAD9D1',
                        color: s.is_active ? '#2e7d32' : '#9C7C78',
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                        border: s.is_active ? 'none' : '1px solid #D4BEB8',
                      }}>{s.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => toggle(s.id, s.is_active)} style={{
                        flex: 1, padding: '9px 0', borderRadius: 12, border: '1.5px solid #D4BEB8',
                        background: 'transparent', color: '#7B5A58', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                      }}>{s.is_active ? 'Desativar' : 'Ativar'}</button>
                      <button onClick={() => remove(s.id)} style={{
                        padding: '9px 16px', borderRadius: 12, border: '1.5px solid #ffcdd2',
                        background: 'transparent', color: '#c62828', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                      }}>Excluir</button>
                    </div>
                  </div>
                </div>
              )
            })}
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
