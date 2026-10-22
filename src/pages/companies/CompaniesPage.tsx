import { useState, useRef, useEffect, useId } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import {
  type CompanyEntry,
  type OppStatus,
  type CompanyStatus,
  loadWorkspace,
  saveWorkspace,
  newCompanyEntry,
  DEMO_ENTRIES,
  DEMO_CAMPAIGNS,
  DEMO_TEMPLATES,
  DEMO_PEOPLE,
  DEMO_PERSON_COMPANY_ASSOCIATIONS,
  DEMO_INTEGRATIONS,
  DEMO_SENDER_ACCOUNTS,
  DEMO_OUTREACHES,
  deriveStateLabel,
  deriveNextAction,
  deriveActionable,
} from '../../lib/workspaceStore'

export type { OppStatus }

// ─── Status config ─────────────────────────────────────────────────────────────

const oppConfig: Record<OppStatus, { color: string; bg: string; border: string; dot: string; label: string }> = {
  CONFIRMED: { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981', label: 'CONFIRMED' },
  PROACTIVE: { color: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE', dot: '#4F46E5', label: 'PROACTIVE' },
  UNCLASSIFIED: { color: '#713F12', bg: '#FEFCE8', border: '#FDE68A', dot: '#F59E0B', label: 'UNCLASSIFIED' },
}

function StatusBadge({ status }: { status: OppStatus }) {
  const cfg = oppConfig[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

// ─── Company monogram ─────────────────────────────────────────────────────────

const MONOGRAM_COLORS: Record<string, { bg: string; text: string }> = {
  kuda: { bg: '#1B4DFF', text: '#fff' },
  stripe: { bg: '#635BFF', text: '#fff' },
  paystack: { bg: '#00C3F7', text: '#fff' },
  vercel: { bg: '#0E1726', text: '#fff' },
  flutterwave: { bg: '#F5A623', text: '#fff' },
  linear: { bg: '#5E6AD2', text: '#fff' },
  moniepoint: { bg: '#0066FF', text: '#fff' },
}

function Monogram({ name, id, archived }: { name: string; id: string; archived?: boolean }) {
  const base = MONOGRAM_COLORS[id] ?? { bg: 'var(--color-muted)', text: 'var(--color-primary)' }
  const colors = archived ? { bg: 'var(--color-muted)', text: 'var(--color-muted-fg)' } : base
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[14px] shrink-0 select-none"
      style={{ background: colors.bg, color: colors.text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {name[0]}
    </div>
  )
}

// ─── Column headers ───────────────────────────────────────────────────────────

function ColumnHeaders() {
  return (
    <div className="hidden sm:flex items-center gap-4 px-5 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="w-[220px] shrink-0"><ColLabel>Company</ColLabel></div>
      <div className="w-[140px] shrink-0"><ColLabel>Status</ColLabel></div>
      <div className="flex-1 min-w-0"><ColLabel>Current state</ColLabel></div>
      <div className="w-[100px] shrink-0 text-right"><ColLabel>Last activity</ColLabel></div>
      <div className="w-[160px] shrink-0"><ColLabel>Next action</ColLabel></div>
      <div className="w-8 shrink-0" />
    </div>
  )
}

function ColLabel({ children }: { children: string }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
      {children}
    </span>
  )
}

// ─── Company row ──────────────────────────────────────────────────────────────

function CompanyRow({ entry, onClick, onEdit, onArchive, onUnarchive }: {
  entry: CompanyEntry
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onArchive: (e: React.MouseEvent) => void
  onUnarchive: (e: React.MouseEvent) => void
}) {
  const stateLabel = deriveStateLabel(entry)
  const nextAction = deriveNextAction(entry)
  const actionable = deriveActionable(entry)
  const isArchived = entry.companyStatus === 'ARCHIVED'
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  return (
    <div
      className="cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid var(--color-border)', opacity: isArchived ? 0.6 : 1 }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Mobile card */}
      <div className="sm:hidden px-4 py-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Monogram name={entry.name} id={entry.id} archived={isArchived} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {entry.name}
                </p>
                {isArchived && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Archived
                  </span>
                )}
              </div>
              <p className="text-[12px] truncate" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {entry.domain}
                {entry.industry && ` · ${entry.industry}`}
              </p>
            </div>
          </div>
          <div className="shrink-0 pt-0.5">
            <StatusBadge status={entry.oppStatus} />
          </div>
        </div>
        <p className="text-[12.5px] leading-snug" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          {stateLabel}
          {entry.isDemo && <span className="ml-2 text-[10.5px] px-1.5 py-0.5 rounded" style={{ background: '#FEF9C3', color: '#713F12' }}>Demo</span>}
        </p>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>{entry.lastActivity}</span>
          <span className="flex items-center gap-1 text-[12.5px] font-medium" style={{ color: actionable ? 'var(--color-accent)' : 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontStyle: actionable ? 'normal' : 'italic' }}>
            {nextAction} <Icon d={icons.arrowRight} size={12} />
          </span>
        </div>
      </div>

      {/* Desktop row */}
      <div className="hidden sm:flex items-center gap-4 px-5 py-3.5">
        <div className="w-[220px] shrink-0 flex items-center gap-3 min-w-0">
          <Monogram name={entry.name} id={entry.id} archived={isArchived} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {entry.name}
              </p>
              {entry.isDemo && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: '#FEF9C3', color: '#713F12', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Demo
                </span>
              )}
              {isArchived && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Archived
                </span>
              )}
            </div>
            <p className="text-[12px] truncate" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
              {entry.domain}
              {entry.industry && ` · ${entry.industry}`}
            </p>
          </div>
        </div>
        <div className="w-[140px] shrink-0"><StatusBadge status={entry.oppStatus} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] truncate" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{stateLabel}</p>
        </div>
        <div className="w-[100px] shrink-0 text-right">
          <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{entry.lastActivity}</p>
        </div>
        <div className="w-[160px] shrink-0">
          <span className="text-[13px] font-medium truncate block" style={{ color: actionable ? 'var(--color-accent)' : 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontStyle: actionable ? 'normal' : 'italic' }}>
            {nextAction}
          </span>
        </div>
        {/* Row actions */}
        <div className="w-8 shrink-0 relative" ref={menuRef}>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
            style={{ color: 'var(--color-muted-fg)' }}
            onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
            title="More actions"
          >
            <Icon d={icons.moreHorizontal ?? 'M5 12h.01M12 12h.01M19 12h.01'} size={15} />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-9 w-44 rounded-xl shadow-xl z-20 py-1.5"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <button
                className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onClick={e => { setShowMenu(false); onEdit(e) }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: 'var(--color-muted-fg)' }}><Icon d={icons.edit ?? 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'} size={13} /></span>
                Edit company
              </button>
              {isArchived ? (
                <button
                  className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                  style={{ color: '#065F46', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onClick={e => { setShowMenu(false); onUnarchive(e) }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#ECFDF5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: '#10B981' }}><Icon d={icons.arrowRight ?? ''} size={13} /></span>
                  Unarchive
                </button>
              ) : (
                <button
                  className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                  style={{ color: '#B45309', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onClick={e => { setShowMenu(false); onArchive(e) }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FFFBEB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: '#F59E0B' }}><Icon d={icons.archive ?? 'M21 8v13H3V8M1 3h22v5H1zM10 12h4'} size={13} /></span>
                  Archive company
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyState({ searching, onAdd, onLoadDemo }: { searching: boolean; onAdd: () => void; onLoadDemo: () => void }) {
  if (searching) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
          <Icon d={icons.search} size={18} />
        </div>
        <p className="text-[15px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          No companies matched
        </p>
        <p className="text-[13.5px] text-center max-w-[300px]" style={{ color: 'var(--color-muted-fg)' }}>
          Try a different name or clear the search to see all companies.
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 px-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
        <Icon d={icons.companies} size={26} strokeWidth={1.6} />
      </div>
      <div className="text-center max-w-[380px]">
        <p className="text-[18px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          No companies yet
        </p>
        <p className="text-[14px] mt-2 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Start with a company you genuinely want to work with. Research it, find the right person, and reach out with evidence.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-3 rounded-lg text-[14px] font-semibold transition-all"
        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        <Icon d={icons.plus} size={16} /> Add your first company
      </button>
      <div className="flex items-center gap-3">
        <div className="h-px w-16" style={{ background: 'var(--color-border)' }} />
        <span className="text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>or</span>
        <div className="h-px w-16" style={{ background: 'var(--color-border)' }} />
      </div>
      <button
        onClick={onLoadDemo}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
        style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted-fg)', background: 'transparent', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
      >
        <Icon d={icons.eye} size={14} /> Explore sample workspace
      </button>
      <p className="text-[11.5px] text-center max-w-[320px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        Loads clearly-labeled demo companies showing different stages of the workflow. Won't affect your real workspace.
      </p>
    </div>
  )
}

// ─── Company form (shared by Add + Edit) ──────────────────────────────────────

const STATUS_DESCRIPTIONS: Record<OppStatus, string> = {
  CONFIRMED: 'Evidence of a relevant opening exists.',
  PROACTIVE: 'Company fit supports outreach despite no confirmed opening.',
  UNCLASSIFIED: 'Not enough evidence yet. Start here if unsure.',
}

interface CompanyFormProps {
  initial?: CompanyEntry
  mode: 'add' | 'edit'
  onClose: () => void
  onSave: (entry: CompanyEntry) => void
}

function CompanyFormModal({ initial, mode, onClose, onSave }: CompanyFormProps) {
  const nameId = useId()
  const domainId = useId()
  const industryId = useId()
  const locationId = useId()
  const descriptionId = useId()

  const [name, setName] = useState(initial?.name ?? '')
  const [domain, setDomain] = useState(initial?.domain ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<OppStatus>(initial?.oppStatus ?? 'UNCLASSIFIED')
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [saving, setSaving] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSave() {
    if (!name.trim()) { setErrors({ name: 'Company name is required.' }); return }
    setErrors({})
    setSaving(true)
    await new Promise(r => setTimeout(r, 480))
    setSaving(false)

    if (mode === 'edit' && initial) {
      onSave({ ...initial, name: name.trim(), domain: domain.trim() || initial.domain, oppStatus: status, industry: industry.trim() || undefined, location: location.trim() || undefined, description: description.trim() || undefined })
    } else {
      const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const entry = newCompanyEntry(id, name.trim(), domain.trim() || `${id}.com`, status, { industry: industry.trim() || undefined, location: location.trim() || undefined, description: description.trim() || undefined })
      onSave(entry)
    }
    onClose()
  }

  const isEdit = mode === 'edit'

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(14,23,38,0.4)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-[500px] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 className="text-[17px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {isEdit ? 'Edit company' : 'Add company'}
            </h2>
            <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>
              {isEdit ? 'Update company details and status.' : 'Start the research and outreach workflow for this company.'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--color-muted-fg)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}>
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Name */}
          <div>
            <label htmlFor={nameId} className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Company name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              id={nameId} ref={nameRef} type="text" value={name}
              onChange={e => { setName(e.target.value); if (errors.name) setErrors({}) }}
              placeholder="e.g. Stripe"
              className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-all"
              style={{ border: `1px solid ${errors.name ? '#FCA5A5' : 'var(--color-border)'}`, background: errors.name ? '#FEF2F2' : 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              onFocus={e => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--color-border)' }}
              onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            />
            {errors.name && (
              <p className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}>
                <Icon d={icons.alertCircle} size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Domain */}
          <div>
            <label htmlFor={domainId} className="flex items-center gap-1.5 text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Website / domain <span className="text-[11px] font-normal" style={{ color: 'var(--color-muted-fg)' }}>(optional)</span>
            </label>
            <input
              id={domainId} type="text" value={domain} onChange={e => setDomain(e.target.value)}
              placeholder="e.g. stripe.com"
              className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-all"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>

          {/* Industry + Location row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={industryId} className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Industry <span className="text-[11px] font-normal" style={{ color: 'var(--color-muted-fg)' }}>(optional)</span>
              </label>
              <input
                id={industryId} type="text" value={industry} onChange={e => setIndustry(e.target.value)}
                placeholder="e.g. Fintech"
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-all"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>
            <div>
              <label htmlFor={locationId} className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Location <span className="text-[11px] font-normal" style={{ color: 'var(--color-muted-fg)' }}>(optional)</span>
              </label>
              <input
                id={locationId} type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Nigeria"
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-all"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor={descriptionId} className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Description <span className="text-[11px] font-normal" style={{ color: 'var(--color-muted-fg)' }}>(optional)</span>
            </label>
            <textarea
              id={descriptionId} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief description — what they do, why you're interested…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-all resize-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>

          {/* Status */}
          <div>
            <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {isEdit ? 'Status' : 'Initial status'}
            </p>
            <div className="flex flex-col gap-2">
              {(['UNCLASSIFIED', 'PROACTIVE', 'CONFIRMED'] as OppStatus[]).map(s => {
                const cfg = oppConfig[s]
                const selected = status === s
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className="flex items-start gap-3 p-3 rounded-lg text-left transition-all"
                    style={{ border: `1px solid ${selected ? cfg.border : 'var(--color-border)'}`, background: selected ? cfg.bg : 'transparent' }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--color-muted)' }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0" style={{ background: selected ? cfg.dot : 'var(--color-border)' }} />
                    <div>
                      <p className="text-[12.5px] font-bold" style={{ color: selected ? cfg.color : 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}>{s}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>{STATUS_DESCRIPTIONS[s]}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: saving ? 'rgba(14,23,38,0.5)' : 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? (
              <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>{isEdit ? 'Saving…' : 'Adding…'}</>
            ) : isEdit ? 'Save changes' : 'Add company'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Archive confirmation ─────────────────────────────────────────────────────

function ArchiveConfirmModal({ company, onClose, onConfirm }: { company: CompanyEntry; onClose: () => void; onConfirm: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(14,23,38,0.4)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-100 rounded-2xl shadow-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="px-6 py-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: '#FFFBEB' }}>
            <span style={{ color: '#F59E0B' }}><Icon d={icons.archive ?? 'M21 8v13H3V8M1 3h22v5H1zM10 12h4'} size={18} /></span>
          </div>
          <h2 className="text-[16px] font-bold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Archive {company.name}?
          </h2>
          <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            This company will be moved to the archived list. All contacts, outreaches, and history are preserved. You can unarchive it at any time.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: '#F59E0B', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#D97706')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}>
            Archive company
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status filter bar ────────────────────────────────────────────────────────

type StatusFilter = 'ALL' | OppStatus
type ArchiveFilter = 'ACTIVE' | 'ARCHIVED'

function FilterBar({ entries, activeFilter, onFilter, archiveFilter, onArchiveFilter, search, onSearch }: {
  entries: CompanyEntry[]
  activeFilter: StatusFilter
  onFilter: (f: StatusFilter) => void
  archiveFilter: ArchiveFilter
  onArchiveFilter: (f: ArchiveFilter) => void
  search: string
  onSearch: (s: string) => void
}) {
  const activeEntries = entries.filter(e => e.companyStatus !== 'ARCHIVED')
  const archivedEntries = entries.filter(e => e.companyStatus === 'ARCHIVED')
  const working = archiveFilter === 'ACTIVE' ? activeEntries : archivedEntries

  const counts: Record<StatusFilter, number> = {
    ALL: working.length,
    CONFIRMED: working.filter(c => c.oppStatus === 'CONFIRMED').length,
    PROACTIVE: working.filter(c => c.oppStatus === 'PROACTIVE').length,
    UNCLASSIFIED: working.filter(c => c.oppStatus === 'UNCLASSIFIED').length,
  }
  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROACTIVE', label: 'Proactive' },
    { key: 'UNCLASSIFIED', label: 'Unclassified' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Archive toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--color-muted)' }}>
        {(['ACTIVE', 'ARCHIVED'] as ArchiveFilter[]).map(f => {
          const active = archiveFilter === f
          return (
            <button key={f} onClick={() => onArchiveFilter(f)}
              className="px-3.5 py-1.5 rounded-md text-[12.5px] font-semibold transition-all"
              style={{
                background: active ? 'var(--color-card)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-muted-fg)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
              {f === 'ACTIVE' ? `Active · ${activeEntries.length}` : `Archived · ${archivedEntries.length}`}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 sm:shrink-0" style={{ minWidth: 180 }}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
            <Icon d={icons.search} size={14} />
          </div>
          <input
            type="text" value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Search companies…"
            className="w-full pl-8 pr-9 py-2 text-[13px] rounded-lg outline-none transition-all"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
          {search && (
            <button onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center"
              style={{ color: 'var(--color-muted-fg)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}>
              <Icon d={icons.x} size={12} strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="h-5 w-px" style={{ background: 'var(--color-border)' }} />
        <div className="flex items-center gap-1">
          {filters.map(f => {
            const active = activeFilter === f.key
            const cfg = f.key !== 'ALL' ? oppConfig[f.key as OppStatus] : null
            return (
              <button key={f.key} onClick={() => onFilter(f.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background: active ? (cfg ? cfg.bg : 'var(--color-primary)') : 'transparent',
                  color: active ? (cfg ? cfg.color : 'white') : 'var(--color-muted-fg)',
                  border: `1px solid ${active ? (cfg ? cfg.border : 'var(--color-primary)') : 'transparent'}`,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' } }}
              >
                {cfg && <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? cfg.dot : 'var(--color-muted-fg)' }} />}
                {f.label}
                <span className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: active ? (cfg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)') : 'var(--color-muted)', color: active ? (cfg ? cfg.color : 'white') : 'var(--color-muted-fg)' }}>
                  {counts[f.key]}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="sm:hidden px-4 py-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg shrink-0 animate-pulse" style={{ background: 'var(--color-muted)' }} />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 rounded animate-pulse" style={{ background: 'var(--color-muted)' }} />
              <div className="h-2.5 w-20 rounded animate-pulse" style={{ background: 'var(--color-muted)' }} />
            </div>
          </div>
          <div className="h-6 w-20 rounded-full animate-pulse" style={{ background: 'var(--color-muted)' }} />
        </div>
        <div className="h-3 w-3/4 rounded animate-pulse" style={{ background: 'var(--color-muted)' }} />
        <div className="flex justify-between">
          <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--color-muted)' }} />
          <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--color-muted)' }} />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4 px-5 py-3.5">
        <div className="w-[220px] shrink-0 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg shrink-0 animate-pulse" style={{ background: 'var(--color-muted)' }} />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 rounded animate-pulse" style={{ background: 'var(--color-muted)', width: '70%' }} />
            <div className="h-2.5 rounded animate-pulse" style={{ background: 'var(--color-muted)', width: '50%' }} />
          </div>
        </div>
        <div className="w-[140px]"><div className="h-6 w-24 rounded-full animate-pulse" style={{ background: 'var(--color-muted)' }} /></div>
        <div className="flex-1"><div className="h-3 rounded animate-pulse" style={{ background: 'var(--color-muted)', width: '65%' }} /></div>
        <div className="w-[100px]"><div className="h-3 rounded animate-pulse ml-auto" style={{ background: 'var(--color-muted)', width: '70%' }} /></div>
        <div className="w-[160px]"><div className="h-3 rounded animate-pulse" style={{ background: 'var(--color-muted)', width: '60%' }} /></div>
        <div className="w-8" />
      </div>
    </div>
  )
}

// ─── Demo banner ──────────────────────────────────────────────────────────────

function DemoBanner({ onClear }: { onClear: () => void }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3 rounded-xl mb-4"
      style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] font-bold px-2 py-0.5 rounded" style={{ background: '#FEF9C3', color: '#713F12', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          DEMO
        </span>
        <p className="text-[13px]" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
          You're viewing a sample workspace. These companies are not real — they're here to show the workflow.
        </p>
      </div>
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 text-[12.5px] font-semibold shrink-0 transition-colors"
        style={{ color: '#78350F', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#92400E')}
        onMouseLeave={e => (e.currentTarget.style.color = '#78350F')}
      >
        <Icon d={icons.x} size={13} /> Clear demo
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CompaniesPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<CompanyEntry[]>(() => loadWorkspace().companies)
  const [isDemoLoaded, setIsDemoLoaded] = useState(() => loadWorkspace().isDemoLoaded)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('ACTIVE')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<CompanyEntry | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<CompanyEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  function persistEntries(next: CompanyEntry[], demoLoaded?: boolean) {
    setEntries(next)
    const ws = loadWorkspace()
    saveWorkspace({ ...ws, companies: next, isDemoLoaded: demoLoaded ?? ws.isDemoLoaded })
    if (demoLoaded !== undefined) setIsDemoLoaded(demoLoaded)
  }

  function handleAdd(entry: CompanyEntry) {
    persistEntries([entry, ...entries])
  }

  function handleEdit(updated: CompanyEntry) {
    persistEntries(entries.map(e => e.id === updated.id ? updated : e))
  }

  function handleArchive(company: CompanyEntry) {
    persistEntries(entries.map(e => e.id === company.id ? { ...e, companyStatus: 'ARCHIVED' as CompanyStatus } : e))
    setArchiveTarget(null)
  }

  function handleUnarchive(company: CompanyEntry) {
    persistEntries(entries.map(e => e.id === company.id ? { ...e, companyStatus: 'ACTIVE' as CompanyStatus } : e))
  }

  function handleLoadDemo() {
    const ws = loadWorkspace()
    const withCampaigns = ws.campaigns.length === 0 ? DEMO_CAMPAIGNS : ws.campaigns
    const withTemplates = ws.templates.length === 0 ? DEMO_TEMPLATES : ws.templates
    const withContacts = ws.people.length === 0 ? DEMO_PEOPLE : ws.people
    const withAssociations = ws.personCompanyAssociations.length === 0 ? DEMO_PERSON_COMPANY_ASSOCIATIONS : ws.personCompanyAssociations
    const withIntegrations = ws.integrations.length === 0 ? DEMO_INTEGRATIONS : ws.integrations
    const withSenderAccounts = ws.senderAccounts.length === 0 ? DEMO_SENDER_ACCOUNTS : ws.senderAccounts
    const withOutreaches = ws.outreaches.length === 0 ? DEMO_OUTREACHES : ws.outreaches
    setEntries(DEMO_ENTRIES)
    setIsDemoLoaded(true)
    saveWorkspace({
      ...ws,
      companies: DEMO_ENTRIES,
      campaigns: withCampaigns,
      templates: withTemplates,
      people: withContacts,
      personCompanyAssociations: withAssociations,
      integrations: withIntegrations,
      senderAccounts: withSenderAccounts,
      outreaches: withOutreaches,
      careerProfile: ws.careerProfile ?? {},
      isDemoLoaded: true,
    })
  }

  function handleClearDemo() {
    const userEntries = entries.filter(e => !e.isDemo)
    const ws = loadWorkspace()
    saveWorkspace({
      ...ws,
      companies: userEntries,
      campaigns: ws.campaigns.filter(c => !c.isDemo),
      people: ws.people.filter(c => c.source !== 'DISCOVERED'),
      personCompanyAssociations: ws.personCompanyAssociations.filter(a => a.source !== 'DISCOVERED'),
      integrations: [],
      senderAccounts: [],
      outreaches: ws.outreaches.filter(o => !o.isDemo),
      isDemoLoaded: false,
    })
    setEntries(userEntries)
    setIsDemoLoaded(false)
  }

  // Split entries by archive status
  const activeEntries = entries.filter(e => e.companyStatus !== 'ARCHIVED')
  const workingEntries = archiveFilter === 'ACTIVE'
    ? entries.filter(e => e.companyStatus !== 'ARCHIVED')
    : entries.filter(e => e.companyStatus === 'ARCHIVED')

  const filtered = workingEntries.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.domain.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || e.oppStatus === statusFilter
    return matchSearch && matchStatus
  })

  const isEmpty = entries.length === 0
  const isWorkingEmpty = !isEmpty && workingEntries.length === 0
  const isSearchEmpty = !isEmpty && !isWorkingEmpty && filtered.length === 0
  const isSearching = search.length > 0 || statusFilter !== 'ALL'
  const hasArchivedEntries = entries.some(e => e.companyStatus === 'ARCHIVED')

  return (
    <>
      <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Companies
            </h1>
            <p className="text-[14.5px] mt-1 max-w-[480px] leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
              Companies are the starting point for every opportunity. Research a company, find the right person, and reach out with evidence.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            <Icon d={icons.plus} size={15} /> Add company
          </button>
        </div>

        {isDemoLoaded && <DemoBanner onClear={handleClearDemo} />}

        {!isEmpty && (
          <div className="mb-4">
            <FilterBar
              entries={entries}
              activeFilter={statusFilter}
              onFilter={setStatusFilter}
              archiveFilter={archiveFilter}
              onArchiveFilter={f => { setArchiveFilter(f); setStatusFilter('ALL'); setSearch('') }}
              search={search}
              onSearch={setSearch}
            />
          </div>
        )}

        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          {loading ? (
            <><ColumnHeaders />{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</>
          ) : isEmpty ? (
            <EmptyState searching={false} onAdd={() => setShowModal(true)} onLoadDemo={handleLoadDemo} />
          ) : isWorkingEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
                <Icon d={icons.archive ?? 'M21 8v13H3V8M1 3h22v5H1zM10 12h4'} size={18} />
              </div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                No archived companies
              </p>
              <p className="text-[13.5px] text-center max-w-[280px]" style={{ color: 'var(--color-muted-fg)' }}>
                Archive a company to remove it from your active pipeline while keeping its history.
              </p>
              <button onClick={() => setArchiveFilter('ACTIVE')} className="text-[13px] font-medium" style={{ color: 'var(--color-accent)' }}>
                View active companies →
              </button>
            </div>
          ) : isSearchEmpty ? (
            <><ColumnHeaders /><EmptyState searching={true} onAdd={() => setShowModal(true)} onLoadDemo={handleLoadDemo} /></>
          ) : (
            <>
              <ColumnHeaders />
              {filtered.map(entry => (
                <CompanyRow
                  key={entry.id}
                  entry={entry}
                  onClick={() => navigate(`/companies/${entry.id}`)}
                  onEdit={e => { e.stopPropagation(); setEditTarget(entry) }}
                  onArchive={e => { e.stopPropagation(); setArchiveTarget(entry) }}
                  onUnarchive={e => { e.stopPropagation(); handleUnarchive(entry) }}
                />
              ))}
              {isSearching && (
                <div className="px-5 py-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <span className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)' }}>
                    Showing {filtered.length} of {workingEntries.length} {workingEntries.length === 1 ? 'company' : 'companies'}
                  </span>
                  <button onClick={() => { setSearch(''); setStatusFilter('ALL') }}
                    className="text-[12.5px] font-medium" style={{ color: 'var(--color-accent)' }}>
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Archived hint when on active view */}
        {!isEmpty && archiveFilter === 'ACTIVE' && hasArchivedEntries && activeEntries.length > 0 && (
          <div className="mt-3 flex items-center justify-center">
            <button
              onClick={() => { setArchiveFilter('ARCHIVED'); setStatusFilter('ALL'); setSearch('') }}
              className="text-[12.5px] font-medium transition-colors"
              style={{ color: 'var(--color-muted-fg)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
            >
              View archived companies ({entries.filter(e => e.companyStatus === 'ARCHIVED').length}) →
            </button>
          </div>
        )}
      </div>

      {showModal && <CompanyFormModal mode="add" onClose={() => setShowModal(false)} onSave={handleAdd} />}
      {editTarget && <CompanyFormModal mode="edit" initial={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />}
      {archiveTarget && <ArchiveConfirmModal company={archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={() => handleArchive(archiveTarget)} />}
    </>
  )
}
