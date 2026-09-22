import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type SenderAccount,
  type Integration,
  loadWorkspace,
  saveWorkspace,
} from '../../lib/workspaceStore'

function genId() {
  return `sa-${Math.random().toString(36).slice(2, 10)}`
}

// ─── Form modal ───────────────────────────────────────────────────────────────

type FormState = { name: string; email: string; replyTo: string; integrationId: string; isDefault: boolean; dailyLimit: string }
const EMPTY_FORM: FormState = { name: '', email: '', replyTo: '', integrationId: '', isDefault: false, dailyLimit: '' }

function SenderAccountModal({
  initial,
  integrations,
  onClose,
  onSave,
}: {
  initial?: SenderAccount
  integrations: Integration[]
  onClose: () => void
  onSave: (form: FormState) => void
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? { name: initial.name, email: initial.email, replyTo: initial.replyTo ?? '', integrationId: initial.integrationId, isDefault: initial.isDefault ?? false, dailyLimit: initial.dailyLimit != null ? String(initial.dailyLimit) : '' }
      : { ...EMPTY_FORM, integrationId: integrations[0]?.id ?? '' }
  )
  const [saving, setSaving] = useState(false)

  const isEdit = !!initial
  const valid = form.name.trim() && form.email.trim() && form.integrationId

  function handleSave() {
    if (!valid) return
    setSaving(true)
    setTimeout(() => onSave(form), 400)
  }

  const connectedIntegrations = integrations.filter(i => i.status === 'CONNECTED')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {isEdit ? 'Edit sender account' : 'New sender account'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        {connectedIntegrations.length === 0 && (
          <div className="mb-5 p-3.5 rounded-xl text-[13px]" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontFamily: 'Inter, sans-serif' }}>
            No connected integrations. <strong>Connect an integration first</strong> before creating a sender account.
          </div>
        )}

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Sender Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your Name"
              className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none"
              style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>From Email</label>
            <input
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              type="email"
              className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none"
              style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Reply-To <span className="text-[12px] font-normal" style={{ color: 'var(--color-muted-fg)' }}>optional</span></label>
            <input
              value={form.replyTo}
              onChange={e => setForm(f => ({ ...f, replyTo: e.target.value }))}
              placeholder="Same as from email"
              type="email"
              className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none"
              style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Send Via</label>
            {connectedIntegrations.length === 0 ? (
              <div className="px-3 py-2.5 rounded-lg text-[13.5px]" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                No integrations connected
              </div>
            ) : (
              <select
                value={form.integrationId}
                onChange={e => setForm(f => ({ ...f, integrationId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none"
                style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              >
                {connectedIntegrations.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Daily send limit <span className="text-[12px] font-normal" style={{ color: 'var(--color-muted-fg)' }}>optional</span>
            </label>
            <input
              value={form.dailyLimit}
              onChange={e => setForm(f => ({ ...f, dailyLimit: e.target.value.replace(/[^0-9]/g, '') }))}
              placeholder="e.g. 50 (leave blank for no limit)"
              type="text"
              inputMode="numeric"
              className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none"
              style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
            />
            <p className="mt-1 text-[11.5px]" style={{ color: 'var(--color-muted-fg)' }}>Outreacher will prevent sending if this limit is reached today.</p>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span className="text-[13px]" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>Set as default sender account</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!valid || saving || connectedIntegrations.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {saving ? (
              <><Icon d={icons.loader} size={14} className="animate-spin" /> Saving…</>
            ) : isEdit ? 'Save changes' : 'Create account'}
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

// ─── Account card ─────────────────────────────────────────────────────────────

function AccountCard({ account, integration, onEdit, onDelete, onSetDefault }: {
  account: SenderAccount
  integration?: Integration
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
}) {
  return (
    <div className="p-5 rounded-xl" style={{ border: `1px solid ${account.isDefault ? 'var(--color-accent)' : 'var(--color-border)'}`, background: 'var(--color-card)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-muted)' }}>
            <span style={{ color: 'var(--color-primary)' }}><Icon d={icons.atSign} size={17} /></span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{account.name}</span>
              {account.isDefault && (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>Default</span>
              )}
            </div>
            <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{account.email}</p>
            {account.replyTo && account.replyTo !== account.email && (
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>Reply-to: {account.replyTo}</p>
            )}
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              Via {integration ? integration.name : 'Unknown integration'}
              {account.dailyLimit != null && (
                <span className="ml-2" style={{ color: (account.sentToday ?? 0) >= account.dailyLimit ? '#DC2626' : 'var(--color-muted-fg)' }}>
                  · {account.sentToday ?? 0}/{account.dailyLimit} sent today
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!account.isDefault && (
            <button
              onClick={onSetDefault}
              className="text-[12px] font-medium px-2.5 py-1 rounded-lg transition-all"
              style={{ color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Set default
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--color-muted-fg)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon d={icons.edit} size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--color-muted-fg)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon d={icons.trash} size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ModalState = { kind: 'create' } | { kind: 'edit'; account: SenderAccount }

export function SenderAccountsPage() {
  const navigate = useNavigate()
  const [ws, setWs] = useState(() => loadWorkspace())
  const [modal, setModal] = useState<ModalState | null>(null)

  function refresh() {
    setWs(loadWorkspace())
  }

  function handleSave(form: FormState, editId?: string) {
    const updated = loadWorkspace()
    let accounts = updated.senderAccounts

    const dailyLimitVal = form.dailyLimit.trim() ? parseInt(form.dailyLimit, 10) : undefined
    if (editId) {
      accounts = accounts.map(a =>
        a.id === editId
          ? { ...a, name: form.name, email: form.email, replyTo: form.replyTo || undefined, integrationId: form.integrationId, isDefault: form.isDefault, dailyLimit: dailyLimitVal }
          : form.isDefault ? { ...a, isDefault: false } : a
      )
    } else {
      const newAccount: SenderAccount = {
        id: genId(),
        name: form.name,
        email: form.email,
        replyTo: form.replyTo || undefined,
        integrationId: form.integrationId,
        isDefault: form.isDefault || accounts.length === 0,
        dailyLimit: dailyLimitVal,
        createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      }
      if (newAccount.isDefault) {
        accounts = accounts.map(a => ({ ...a, isDefault: false }))
      }
      accounts = [...accounts, newAccount]
    }

    saveWorkspace({ ...updated, senderAccounts: accounts })
    setModal(null)
    refresh()
  }

  function handleDelete(id: string) {
    const updated = loadWorkspace()
    const filtered = updated.senderAccounts.filter(a => a.id !== id)
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0] = { ...filtered[0], isDefault: true }
    }
    saveWorkspace({ ...updated, senderAccounts: filtered })
    refresh()
  }

  function handleSetDefault(id: string) {
    const updated = loadWorkspace()
    saveWorkspace({
      ...updated,
      senderAccounts: updated.senderAccounts.map(a => ({ ...a, isDefault: a.id === id })),
    })
    refresh()
  }

  const hasIntegrations = ws.integrations.some(i => i.status === 'CONNECTED')

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Sender Accounts
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Manage the email identities used when sending outreach campaigns.
          </p>
        </div>
        {hasIntegrations && (
          <button
            onClick={() => setModal({ kind: 'create' })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all flex-shrink-0"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <Icon d={icons.plus} size={15} />
            New account
          </button>
        )}
      </div>

      {/* No integrations warning */}
      {!hasIntegrations && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <span style={{ color: '#D97706', flexShrink: 0, marginTop: 1, display: 'flex' }}><Icon d={icons.alertCircle} size={18} /></span>
          <div>
            <p className="text-[13.5px] font-semibold mb-0.5" style={{ color: '#92400E', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No email integration connected</p>
            <p className="text-[13px]" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
              Connect an integration before creating sender accounts.{' '}
              <button onClick={() => navigate('/integrations')} className="underline font-semibold" style={{ color: '#92400E' }}>Go to Integrations →</button>
            </p>
          </div>
        </div>
      )}

      {/* Account list */}
      {ws.senderAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-20 px-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-muted)' }}>
            <span style={{ color: 'var(--color-muted-fg)' }}><Icon d={icons.atSign} size={26} /></span>
          </div>
          <div className="text-center max-w-[360px]">
            <h2 className="text-[18px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No sender accounts yet</h2>
            <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              Create a sender account to define who your outreach emails come from.
            </p>
          </div>
          {hasIntegrations && (
            <button
              onClick={() => setModal({ kind: 'create' })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold"
              style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <Icon d={icons.plus} size={15} />
              Create first account
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {ws.senderAccounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              integration={ws.integrations.find(i => i.id === account.integrationId)}
              onEdit={() => setModal({ kind: 'edit', account })}
              onDelete={() => handleDelete(account.id)}
              onSetDefault={() => handleSetDefault(account.id)}
            />
          ))}
          {hasIntegrations && (
            <button
              onClick={() => setModal({ kind: 'create' })}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold transition-all"
              style={{ border: '1px dashed var(--color-border)', color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Icon d={icons.plus} size={15} />
              Add sender account
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <SenderAccountModal
          initial={modal.kind === 'edit' ? modal.account : undefined}
          integrations={ws.integrations}
          onClose={() => setModal(null)}
          onSave={form => handleSave(form, modal.kind === 'edit' ? modal.account.id : undefined)}
        />
      )}
    </div>
  )
}
