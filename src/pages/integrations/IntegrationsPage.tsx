import { useState } from 'react'
import { Icon, icons } from '../../lib/icons'
import {
  type Integration,
  type IntegrationProvider,
  type IntegrationStatus,
  loadWorkspace,
  saveWorkspace,
} from '../../lib/workspaceStore'

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<IntegrationStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  CONNECTED:    { label: 'Connected',    color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
  DISCONNECTED: { label: 'Disconnected', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', dot: '#9CA3AF' },
  FAILED:       { label: 'Error',        color: '#991B1B', bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444' },
  PENDING:      { label: 'Pending',      color: '#92400E', bg: '#FFF7ED', border: '#FED7AA', dot: '#F59E0B' },
}

const PROVIDER_CFG: Record<IntegrationProvider, { name: string; description: string; icon: string | string[] }> = {
  RESEND: {
    name: 'Resend',
    description: 'Modern email API for developers. Best-in-class deliverability, simple SDK.',
    icon: icons.zap,
  },
  SMTP: {
    name: 'SMTP',
    description: 'Connect any SMTP server — Gmail, Outlook, Fastmail, or your own mail server.',
    icon: icons.mail,
  },
}

function genId() {
  return `int-${Math.random().toString(36).slice(2, 10)}`
}

// ─── Connect Resend modal ─────────────────────────────────────────────────────

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{label}</label>
      {children}
    </div>
  )
}

function ResendModal({ onClose, onSave }: { onClose: () => void; onSave: (apiKey: string, name: string) => void }) {
  const [apiKey, setApiKey] = useState('')
  const [name, setName] = useState('')
  const [connecting, setConnecting] = useState(false)

  function handleConnect() {
    if (!apiKey.trim()) return
    setConnecting(true)
    setTimeout(() => {
      onSave(apiKey.trim(), name.trim() || 'Resend')
    }, 1200)
  }

  const inputStyle = { background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1D1D1D' }}>
              <span style={{ color: '#F59E0B' }}><Icon d={icons.zap} size={18} /></span>
            </div>
            <div>
              <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Connect Resend</h2>
              <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>Email API for developers</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        <div className="mb-5 p-4 rounded-xl text-[13px]" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          This is a <strong style={{ color: 'var(--color-primary)' }}>simulated connection</strong>. No real email will be sent and no credentials are stored externally.
        </div>

        <ModalField label="Integration name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. My Resend account"
            className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none"
            style={inputStyle}
          />
          <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>A label to identify this integration in the app.</p>
        </ModalField>

        <ModalField label="API Key">
          <input
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="re_••••••••••••••••••••••"
            className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none font-mono"
            style={inputStyle}
          />
          <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Find your API key in the Resend dashboard under API Keys.
          </p>
        </ModalField>

        <div className="flex gap-3">
          <button
            onClick={handleConnect}
            disabled={!apiKey.trim() || connecting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {connecting ? (
              <>
                <Icon d={icons.loader} size={15} className="animate-spin" />
                Connecting…
              </>
            ) : 'Connect'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Connect SMTP modal ───────────────────────────────────────────────────────

function SmtpModal({ onClose, onSave }: { onClose: () => void; onSave: (host: string, port: string, username: string, name: string) => void }) {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('587')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [connecting, setConnecting] = useState(false)
  const inputStyle = { background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }

  function handleConnect() {
    if (!host.trim() || !username.trim()) return
    setConnecting(true)
    setTimeout(() => onSave(host.trim(), port.trim(), username.trim(), name.trim() || `SMTP · ${host.trim()}`), 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-muted)' }}>
              <span style={{ color: 'var(--color-primary)' }}><Icon d={icons.mail} size={18} /></span>
            </div>
            <div>
              <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Connect SMTP</h2>
              <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>Custom mail server</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        <div className="mb-5 p-4 rounded-xl text-[13px]" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          This is a <strong style={{ color: 'var(--color-primary)' }}>simulated connection</strong>. No real email will be sent and no credentials are stored externally.
        </div>

        <div className="space-y-4 mb-5">
          <ModalField label="Integration name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Gmail account" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={inputStyle} />
          </ModalField>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>SMTP Host</label>
            <input value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.gmail.com" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Port</label>
            <input value={port} onChange={e => setPort(e.target.value)} placeholder="587" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none font-mono" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Username / Email</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="you@gmail.com" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConnect}
            disabled={!host.trim() || !username.trim() || connecting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {connecting ? (
              <><Icon d={icons.loader} size={15} className="animate-spin" /> Connecting…</>
            ) : 'Connect'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Integration card ─────────────────────────────────────────────────────────

function IntegrationCard({ integration, onDisconnect, onReconnect }: {
  integration: Integration
  onDisconnect: () => void
  onReconnect: () => void
}) {
  const cfg = PROVIDER_CFG[integration.provider]
  const scfg = STATUS_CFG[integration.status]
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')

  function handleTest() {
    setTestState('testing')
    // Simulate a 1.2s test ping — always succeeds for connected integrations
    setTimeout(() => {
      setTestState(integration.status === 'CONNECTED' ? 'ok' : 'fail')
      setTimeout(() => setTestState('idle'), 3000)
    }, 1200)
  }

  return (
    <div className="p-5 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: integration.provider === 'RESEND' ? '#1D1D1D' : 'var(--color-muted)' }}>
            <span style={{ color: integration.provider === 'RESEND' ? '#F59E0B' : 'var(--color-primary)' }}><Icon d={cfg.icon} size={18} /></span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[14.5px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{integration.name}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: scfg.bg, color: scfg.color, border: `1px solid ${scfg.border}` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: scfg.dot }} />
                {scfg.label}
              </span>
            </div>
            <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{cfg.description}</p>
            {integration.provider === 'RESEND' && integration.apiKey && (
              <p className="text-[12px] mt-1 font-mono" style={{ color: 'var(--color-muted-fg)' }}>{integration.apiKey}</p>
            )}
            {integration.provider === 'SMTP' && integration.smtpHost && (
              <p className="text-[12px] mt-1 font-mono" style={{ color: 'var(--color-muted-fg)' }}>{integration.smtpHost}:{integration.smtpPort} · {integration.smtpUsername}</p>
            )}
            {testState === 'ok' && (
              <p className="text-[12px] mt-1.5 flex items-center gap-1 font-medium" style={{ color: '#10B981' }}>
                <Icon d={icons.checkCircle} size={13} /> Connection verified — simulated ping succeeded
              </p>
            )}
            {testState === 'fail' && (
              <p className="text-[12px] mt-1.5 flex items-center gap-1 font-medium" style={{ color: '#DC2626' }}>
                <Icon d={icons.alertCircle} size={13} /> Test failed — integration is not connected
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {integration.status === 'CONNECTED' && (
            <button
              onClick={handleTest}
              disabled={testState === 'testing'}
              className="px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
              style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: testState === 'testing' ? 0.7 : 1 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}
            >
              {testState === 'testing' ? 'Testing…' : 'Test connection'}
            </button>
          )}
          {integration.status === 'CONNECTED' ? (
            <button
              onClick={onDisconnect}
              className="px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
              style={{ background: 'var(--color-muted)', color: '#DC2626', border: '1px solid #FECACA', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={onReconnect}
              className="px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
              style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Reconnect
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add provider card ────────────────────────────────────────────────────────

function AddProviderCard({ provider, onAdd }: { provider: IntegrationProvider; onAdd: () => void }) {
  const cfg = PROVIDER_CFG[provider]
  return (
    <button
      onClick={onAdd}
      className="w-full p-5 rounded-xl text-left transition-all"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-card)')}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: provider === 'RESEND' ? '#1D1D1D' : 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          <span style={{ color: provider === 'RESEND' ? '#F59E0B' : 'var(--color-primary)' }}><Icon d={cfg.icon} size={18} /></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14.5px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{cfg.name}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)' }}>Not connected</span>
          </div>
          <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{cfg.description}</p>
        </div>
        <div className="flex-shrink-0" style={{ color: 'var(--color-muted-fg)' }}>
          <Icon d={icons.plus} size={16} />
        </div>
      </div>
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ModalState = { kind: 'resend' } | { kind: 'smtp' } | { kind: 'reconnect'; integration: Integration } | null

export function IntegrationsPage() {
  const [ws, setWs] = useState(() => loadWorkspace())
  const [modal, setModal] = useState<ModalState>(null)

  function refresh() {
    setWs(loadWorkspace())
  }

  function handleConnectResend(apiKey: string, name: string) {
    const masked = `re_${'•'.repeat(20)}`
    const updated = loadWorkspace()
    const existing = updated.integrations.find(i => i.provider === 'RESEND')
    if (existing) {
      saveWorkspace({
        ...updated,
        integrations: updated.integrations.map(i =>
          i.id === existing.id ? { ...i, status: 'CONNECTED', apiKey: masked, name } : i
        ),
      })
    } else {
      const newInt: Integration = {
        id: genId(), provider: 'RESEND', name,
        status: 'CONNECTED', apiKey: masked,
        createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      }
      saveWorkspace({ ...updated, integrations: [...updated.integrations, newInt] })
    }
    setModal(null)
    refresh()
  }

  function handleConnectSmtp(host: string, port: string, username: string, name: string) {
    const updated = loadWorkspace()
    const existing = updated.integrations.find(i => i.provider === 'SMTP')
    if (existing) {
      saveWorkspace({
        ...updated,
        integrations: updated.integrations.map(i =>
          i.id === existing.id ? { ...i, status: 'CONNECTED', smtpHost: host, smtpPort: port, smtpUsername: username, name } : i
        ),
      })
    } else {
      const newInt: Integration = {
        id: genId(), provider: 'SMTP', name,
        status: 'CONNECTED', smtpHost: host, smtpPort: port, smtpUsername: username,
        createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      }
      saveWorkspace({ ...updated, integrations: [...updated.integrations, newInt] })
    }
    setModal(null)
    refresh()
  }

  function handleDisconnect(id: string) {
    const updated = loadWorkspace()
    saveWorkspace({
      ...updated,
      integrations: updated.integrations.map(i => i.id === id ? { ...i, status: 'DISCONNECTED' } : i),
    })
    refresh()
  }

  function handleReconnect(integration: Integration) {
    if (integration.provider === 'RESEND') {
      setModal({ kind: 'resend' })
    } else {
      setModal({ kind: 'smtp' })
    }
  }

  const connected = ws.integrations
  const unconnectedProviders = (['RESEND', 'SMTP'] as IntegrationProvider[]).filter(
    p => !ws.integrations.find(i => i.provider === p && i.status === 'CONNECTED')
  )

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Integrations
        </h1>
        <p className="text-[14px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Connect an email provider to send outreach from Outreacher. All sending is simulated — no real email is delivered.
        </p>
      </div>

      {/* Connected integrations */}
      {connected.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Connected</h2>
          <div className="space-y-3">
            {connected.map(i => (
              <IntegrationCard
                key={i.id}
                integration={i}
                onDisconnect={() => handleDisconnect(i.id)}
                onReconnect={() => handleReconnect(i)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available integrations */}
      {unconnectedProviders.length > 0 && (
        <section>
          <h2 className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {connected.length > 0 ? 'Add another' : 'Available'}
          </h2>
          <div className="space-y-3">
            {unconnectedProviders.map(p => (
              <AddProviderCard
                key={p}
                provider={p}
                onAdd={() => setModal(p === 'RESEND' ? { kind: 'resend' } : { kind: 'smtp' })}
              />
            ))}
          </div>
        </section>
      )}

      {ws.integrations.length === 0 && (
        <div className="mt-6 p-4 rounded-xl text-[13px]" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Connect an integration above, then create a <strong style={{ color: 'var(--color-primary)' }}>Sender Account</strong> to start sending campaigns.
        </div>
      )}

      {/* Modals */}
      {modal?.kind === 'resend' && (
        <ResendModal onClose={() => setModal(null)} onSave={handleConnectResend} />
      )}
      {modal?.kind === 'smtp' && (
        <SmtpModal onClose={() => setModal(null)} onSave={handleConnectSmtp} />
      )}
    </div>
  )
}
