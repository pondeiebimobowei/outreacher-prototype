import { useState, useRef, useEffect } from 'react'
import { Icon, icons } from '../lib/icons'
import { useAuth } from '../context/AuthContext'
import type { UserProfile } from '../context/AuthContext'
import { loadWorkspace, saveWorkspace, type CareerProfile } from '../lib/workspaceStore'

// ─── Completeness ─────────────────────────────────────────────────────────────

type CompletenessItem = {
  label: string
  done: boolean
  impact: string
  points: number
}

function computeCompleteness(u: UserProfile | null): { score: number; items: CompletenessItem[] } {
  const items: CompletenessItem[] = [
    { label: 'Full name', done: !!(u?.firstName?.trim() && u?.lastName?.trim()), impact: 'Personalises your outreach', points: 10 },
    { label: 'Current role', done: !!(u?.currentRole?.trim()), impact: 'Anchors your professional context', points: 12 },
    { label: 'Target role', done: !!(u?.targetRole?.trim()), impact: 'Focuses company and opportunity matching', points: 13 },
    { label: 'Years of experience', done: !!(u?.yearsExperience), impact: 'Filters contact seniority', points: 10 },
    { label: 'Core skills (3+)', done: (u?.skills?.length ?? 0) >= 3, impact: 'Shapes contact and opportunity relevance', points: 15 },
    { label: 'Career goals', done: (u?.careerGoals?.length ?? 0) >= 30, impact: 'Evaluates company and role fit', points: 15 },
    { label: 'Professional summary', done: (u?.summary?.length ?? 0) >= 50, impact: 'May appear verbatim in outreach', points: 15 },
    { label: 'A professional link', done: !!(u?.linkedin || u?.github || u?.portfolio), impact: 'Provides research context', points: 10 },
  ]
  const total = items.reduce((s, i) => s + i.points, 0)
  const earned = items.filter(i => i.done).reduce((s, i) => s + i.points, 0)
  return { score: Math.round((earned / total) * 100), items }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: string; optional?: boolean }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
      {children}{optional && <span className="ml-1.5 normal-case tracking-normal text-[11px]" style={{ color: 'var(--color-muted-fg)', opacity: 0.7 }}>(optional)</span>}
    </p>
  )
}

function FieldValue({ children, empty }: { children?: string | null; empty?: string }) {
  const val = children?.trim()
  return val
    ? <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>{val}</p>
    : <p className="text-[14px] italic" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{empty ?? 'Not set'}</p>
}

function FormInput({
  label, value, onChange, placeholder, type = 'text', readOnly, optional, error,
}: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; readOnly?: boolean; optional?: boolean; error?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <input
        type={type}
        readOnly={readOnly}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-all"
        style={{
          border: `1px solid ${error ? '#FCA5A5' : focused ? 'var(--color-accent)' : 'var(--color-border)'}`,
          background: readOnly ? 'var(--color-muted)' : error ? '#FEF2F2' : 'var(--color-card)',
          color: 'var(--color-primary)',
          fontFamily: 'Inter, sans-serif',
          cursor: readOnly ? 'default' : 'text',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && <p className="mt-1 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}><Icon d={icons.alertCircle} size={12} />{error}</p>}
      {readOnly && <p className="mt-1 text-[11.5px]" style={{ color: 'var(--color-muted-fg)' }}>Email cannot be changed here.</p>}
    </div>
  )
}

function FormTextarea({
  label, value, onChange, placeholder, maxLength, hint, optional, error,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  maxLength?: number; hint?: string; optional?: boolean; error?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      {hint && <p className="text-[12px] mb-2 leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>{hint}</p>}
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-all resize-none"
          style={{
            border: `1px solid ${error ? '#FCA5A5' : focused ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: error ? '#FEF2F2' : 'var(--color-card)',
            color: 'var(--color-primary)',
            fontFamily: 'Inter, sans-serif',
            lineHeight: '1.65',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {maxLength && (
          <span className="absolute bottom-2.5 right-3 text-[11.5px]" style={{ color: value.length > maxLength * 0.9 ? '#F59E0B' : 'var(--color-muted-fg)' }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}><Icon d={icons.alertCircle} size={12} />{error}</p>}
    </div>
  )
}

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '6–9 years', '10+ years']
const SKILL_SUGGESTIONS = ['React', 'TypeScript', 'Node.js', 'Python', 'Product Design', 'Figma', 'Product Management', 'Data Analysis', 'SQL', 'Leadership', 'Go', 'Rust', 'iOS', 'Android', 'Machine Learning', 'UX Research']

function SkillsInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState('')
  function add(s: string) {
    const t = s.trim()
    if (t && !skills.includes(t) && skills.length < 12) onChange([...skills, t])
    setInput('')
  }
  function remove(s: string) { onChange(skills.filter(x => x !== s)) }
  return (
    <div>
      <FieldLabel>Core skills</FieldLabel>
      <p className="text-[12px] mb-2" style={{ color: 'var(--color-muted-fg)' }}>Up to 12 skills. Used to evaluate contact and opportunity relevance.</p>
      <div
        className="min-h-12 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 cursor-text"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
        onClick={() => (document.getElementById('profile-skill-input') as HTMLInputElement)?.focus()}
      >
        {skills.map(s => (
          <span key={s} className="flex items-center gap-1 text-[12.5px] px-2.5 py-1 rounded-md font-medium" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            {s}
            <button type="button" onClick={() => remove(s)} className="opacity-60 hover:opacity-100 transition-opacity">
              <Icon d={icons.x} size={10} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        {skills.length < 12 && (
          <input id="profile-skill-input" type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
              if (e.key === 'Backspace' && !input && skills.length) remove(skills[skills.length - 1])
            }}
            placeholder={skills.length === 0 ? 'Type a skill and press Enter…' : ''}
            className="outline-none text-[13px] bg-transparent min-w-30 flex-1 py-0.5"
            style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
          <button key={s} type="button" onClick={() => add(s)}
            className="text-[11.5px] px-2.5 py-1 rounded-md transition-all"
            style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
          >+ {s}</button>
        ))}
      </div>
    </div>
  )
}

// ─── Section card chrome ──────────────────────────────────────────────────────

type SectionStatus = 'view' | 'editing' | 'saving' | 'saved' | 'error'

function SectionCard({
  title, impact, status, onEdit, onSave, onCancel, saveLabel = 'Save changes',
  children, editChildren, error: externalError,
}: {
  title: string; impact: string; status: SectionStatus;
  onEdit: () => void; onSave: () => void; onCancel: () => void;
  saveLabel?: string; children: React.ReactNode; editChildren: React.ReactNode;
  error?: string;
}) {
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true)
      savedTimeout.current = setTimeout(() => setShowSaved(false), 2500)
    }
    return () => { if (savedTimeout.current) clearTimeout(savedTimeout.current) }
  }, [status])

  const isEditing = status === 'editing' || status === 'saving'

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      {/* Card header */}
      <div className="flex items-start justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h3 className="text-[15px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>{impact}</p>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          {showSaved && (
            <span className="flex items-center gap-1 text-[12.5px] font-medium" style={{ color: '#10B981' }}>
              <Icon d={icons.checkCircle} size={14} /> Saved
            </span>
          )}
          {!isEditing && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {isEditing ? editChildren : children}
      </div>

      {/* Edit footer */}
      {isEditing && (
        <div className="px-6 pb-5 flex items-center justify-between">
          <div>
            {externalError && (
              <p className="text-[12.5px] flex items-center gap-1.5" style={{ color: '#EF4444' }}>
                <Icon d={icons.alertCircle} size={13} /> {externalError}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={status === 'saving'}
              className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: status === 'saving' ? 0.5 : 1 }}
              onMouseEnter={e => { if (status !== 'saving') { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={status === 'saving'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
              style={{
                background: status === 'saving' ? 'rgba(14,23,38,0.5)' : 'var(--color-primary)',
                color: 'white',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                cursor: status === 'saving' ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'saving' ? (
                <><Spinner />{saveLabel === 'Save changes' ? 'Saving…' : saveLabel}</>
              ) : saveLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

// ─── Section 1 — Personal ─────────────────────────────────────────────────────

function PersonalSection({ user, onUpdate }: { user: UserProfile; onUpdate: (p: Partial<UserProfile>) => Promise<void> }) {
  const [status, setStatus] = useState<SectionStatus>('view')
  const [form, setForm] = useState({ firstName: user.firstName ?? '', lastName: user.lastName ?? '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  function reset() {
    setForm({ firstName: user.firstName ?? '', lastName: user.lastName ?? '' })
    setErrors({})
    setServerError('')
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required.'
    if (!form.lastName.trim()) e.lastName = 'Last name is required.'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStatus('saving')
    try {
      await onUpdate({ firstName: form.firstName.trim(), lastName: form.lastName.trim() })
      setStatus('saved')
    } catch {
      setServerError('Failed to save. Please try again.')
      setStatus('editing')
    }
  }

  return (
    <SectionCard
      title="Personal"
      impact="Name is used to personalise your outreach drafts."
      status={status}
      onEdit={() => { reset(); setStatus('editing') }}
      onSave={handleSave}
      onCancel={() => { reset(); setStatus('view') }}
      error={serverError}
      editChildren={
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="First name" value={form.firstName} onChange={v => { setForm(f => ({ ...f, firstName: v })); if (errors.firstName) setErrors(e => { const n = { ...e }; delete n.firstName; return n }) }} placeholder="Alex" error={errors.firstName} />
            <FormInput label="Last name" value={form.lastName} onChange={v => { setForm(f => ({ ...f, lastName: v })); if (errors.lastName) setErrors(e => { const n = { ...e }; delete n.lastName; return n }) }} placeholder="Chen" error={errors.lastName} />
          </div>
          <FormInput label="Email" value={user.email ?? ''} type="email" readOnly />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Name</FieldLabel>
          <FieldValue empty="Not set">
            {[user.firstName, user.lastName].filter(Boolean).join(' ') || undefined}
          </FieldValue>
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <FieldValue>{user.email}</FieldValue>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Section 2 — Professional Identity ───────────────────────────────────────

function ProfessionalIdentitySection({ user, onUpdate }: { user: UserProfile; onUpdate: (p: Partial<UserProfile>) => Promise<void> }) {
  const [status, setStatus] = useState<SectionStatus>('view')
  const [form, setForm] = useState({
    currentRole: user.currentRole ?? '',
    targetRole: user.targetRole ?? '',
    yearsExperience: user.yearsExperience ?? '',
    skills: user.skills ?? [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  function reset() {
    setForm({ currentRole: user.currentRole ?? '', targetRole: user.targetRole ?? '', yearsExperience: user.yearsExperience ?? '', skills: user.skills ?? [] })
    setErrors({})
    setServerError('')
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.currentRole.trim()) e.currentRole = 'Current role is required.'
    if (!form.targetRole.trim()) e.targetRole = 'Target role is required.'
    if (!form.yearsExperience) e.yearsExperience = 'Please select your experience range.'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('saving')
    try {
      await onUpdate({ currentRole: form.currentRole.trim(), targetRole: form.targetRole.trim(), yearsExperience: form.yearsExperience, skills: form.skills })
      setStatus('saved')
    } catch {
      setServerError('Failed to save. Please try again.')
      setStatus('editing')
    }
  }

  return (
    <SectionCard
      title="Professional Identity"
      impact="Drives company research targeting, opportunity scoring, and contact relevance."
      status={status}
      onEdit={() => { reset(); setStatus('editing') }}
      onSave={handleSave}
      onCancel={() => { reset(); setStatus('view') }}
      error={serverError}
      editChildren={
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Current role"
              value={form.currentRole}
              onChange={v => { setForm(f => ({ ...f, currentRole: v })); if (errors.currentRole) setErrors(e => { const n = { ...e }; delete n.currentRole; return n }) }}
              placeholder="e.g. Software Engineer at Paystack"
              error={errors.currentRole}
            />
            <FormInput
              label="Target role"
              value={form.targetRole}
              onChange={v => { setForm(f => ({ ...f, targetRole: v })); if (errors.targetRole) setErrors(e => { const n = { ...e }; delete n.targetRole; return n }) }}
              placeholder="e.g. Senior Design Engineer"
              error={errors.targetRole}
            />
          </div>
          <div>
            <FieldLabel>Years of experience</FieldLabel>
            <div className="flex flex-wrap gap-2 mt-1">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button key={opt} type="button"
                  onClick={() => { setForm(f => ({ ...f, yearsExperience: opt })); if (errors.yearsExperience) setErrors(e => { const n = { ...e }; delete n.yearsExperience; return n }) }}
                  className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={{
                    background: form.yearsExperience === opt ? 'var(--color-primary)' : 'var(--color-card)',
                    color: form.yearsExperience === opt ? 'white' : 'var(--color-primary)',
                    border: `1px solid ${form.yearsExperience === opt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >{opt}</button>
              ))}
            </div>
            {errors.yearsExperience && <p className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}><Icon d={icons.alertCircle} size={12} />{errors.yearsExperience}</p>}
          </div>
          <SkillsInput skills={form.skills} onChange={s => setForm(f => ({ ...f, skills: s }))} />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Current role</FieldLabel>
          <FieldValue empty="Not set">{user.currentRole}</FieldValue>
        </div>
        <div>
          <FieldLabel>Target role</FieldLabel>
          <FieldValue empty="Not set">{user.targetRole}</FieldValue>
        </div>
        <div>
          <FieldLabel>Experience</FieldLabel>
          <FieldValue empty="Not set">{user.yearsExperience}</FieldValue>
        </div>
        <div>
          <FieldLabel>Skills</FieldLabel>
          {(user.skills?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {user.skills.map(s => (
                <span key={s} className="text-[12.5px] px-2.5 py-1 rounded-md font-medium" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <FieldValue empty="No skills added" />
          )}
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Section 3 — Career Goals ─────────────────────────────────────────────────

function CareerGoalsSection({ user, onUpdate }: { user: UserProfile; onUpdate: (p: Partial<UserProfile>) => Promise<void> }) {
  const [status, setStatus] = useState<SectionStatus>('view')
  const [form, setForm] = useState({ careerGoals: user.careerGoals ?? '', summary: user.summary ?? '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  function reset() {
    setForm({ careerGoals: user.careerGoals ?? '', summary: user.summary ?? '' })
    setErrors({})
    setServerError('')
  }

  function validate() {
    const e: Record<string, string> = {}
    if (form.careerGoals.trim().length > 0 && form.careerGoals.trim().length < 20)
      e.careerGoals = 'Please write at least 20 characters, or leave blank.'
    if (form.summary.trim().length > 0 && form.summary.trim().length < 30)
      e.summary = 'Please write at least 30 characters, or leave blank.'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('saving')
    try {
      await onUpdate({ careerGoals: form.careerGoals, summary: form.summary })
      setStatus('saved')
    } catch {
      setServerError('Failed to save. Please try again.')
      setStatus('editing')
    }
  }

  return (
    <SectionCard
      title="Career Goals"
      impact="Career goals shape opportunity scoring. Summary may appear verbatim in outreach drafts."
      status={status}
      onEdit={() => { reset(); setStatus('editing') }}
      onSave={handleSave}
      onCancel={() => { reset(); setStatus('view') }}
      error={serverError}
      editChildren={
        <div className="flex flex-col gap-5">
          <FormTextarea
            label="Career goals"
            value={form.careerGoals}
            onChange={v => { setForm(f => ({ ...f, careerGoals: v })); if (errors.careerGoals) setErrors(e => { const n = { ...e }; delete n.careerGoals; return n }) }}
            placeholder="e.g. Join a product-led fintech company as a senior engineer where I can own meaningful infrastructure problems…"
            maxLength={400}
            hint="Be specific about the kind of company, role, and impact you're looking for."
            error={errors.careerGoals}
          />
          <FormTextarea
            label="Professional summary"
            value={form.summary}
            onChange={v => { setForm(f => ({ ...f, summary: v })); if (errors.summary) setErrors(e => { const n = { ...e }; delete n.summary; return n }) }}
            placeholder="e.g. I'm a software engineer with 6 years of experience building payment infrastructure at scale…"
            maxLength={600}
            hint="Write as you'd introduce yourself. This may appear verbatim in outreach — never invented."
            error={errors.summary}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Career goals</FieldLabel>
          <FieldValue empty="Not set">{user.careerGoals}</FieldValue>
        </div>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <FieldLabel>Professional summary</FieldLabel>
          <FieldValue empty="Not set">{user.summary}</FieldValue>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Section 4 — Career Targeting ────────────────────────────────────────────

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  function addTag(val: string) {
    const v = val.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setInput('')
  }
  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg min-h-11" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      {tags.map(t => (
        <span key={t} className="inline-flex items-center gap-1 text-[12.5px] font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {t}
          <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="transition-opacity opacity-60 hover:opacity-100 ml-0.5">
            <Icon d={icons.x} size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
          if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1))
        }}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length ? '' : placeholder}
        className="flex-1 outline-none min-w-30 text-[13px]"
        style={{ background: 'transparent', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
      />
    </div>
  )
}

function CareerTargetingSection() {
  const [status, setStatus] = useState<SectionStatus>('view')
  const [form, setForm] = useState<CareerProfile>(() => loadWorkspace().careerProfile ?? {})

  function reset() {
    setForm(loadWorkspace().careerProfile ?? {})
  }

  function handleSave() {
    setStatus('saving')
    setTimeout(() => {
      const ws = loadWorkspace()
      saveWorkspace({ ...ws, careerProfile: form })
      setStatus('saved')
    }, 500)
  }

  return (
    <SectionCard
      title="Career Targeting"
      impact="Helps Outreacher focus on companies and roles aligned with where you want to go."
      status={status}
      onEdit={() => { reset(); setStatus('editing') }}
      onSave={handleSave}
      onCancel={() => { reset(); setStatus('view') }}
      editChildren={
        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel optional>Professional headline</FieldLabel>
            <input
              value={form.professionalHeadline ?? ''}
              onChange={e => setForm(f => ({ ...f, professionalHeadline: e.target.value }))}
              placeholder="e.g. Staff engineer with 8 years in payments infrastructure"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13.5px] outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <div>
            <FieldLabel optional>Background & positioning</FieldLabel>
            <textarea
              value={form.backgroundAndPositioning ?? ''}
              onChange={e => setForm(f => ({ ...f, backgroundAndPositioning: e.target.value }))}
              placeholder="Summarize your professional background and what makes you a compelling candidate for your target roles…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13.5px] outline-none resize-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <div>
            <FieldLabel optional>Target industries</FieldLabel>
            <TagInput
              tags={form.targetIndustries ?? []}
              onChange={v => setForm(f => ({ ...f, targetIndustries: v }))}
              placeholder="Type and press Enter (e.g. Fintech, Climate)"
            />
            <p className="mt-1.5 text-[11.5px]" style={{ color: 'var(--color-muted-fg)' }}>Press Enter or comma to add each industry</p>
          </div>
          <div>
            <FieldLabel optional>Target locations</FieldLabel>
            <TagInput
              tags={form.targetLocations ?? []}
              onChange={v => setForm(f => ({ ...f, targetLocations: v }))}
              placeholder="Type and press Enter (e.g. Lagos, Remote)"
            />
          </div>
          <div>
            <FieldLabel optional>Experience highlights</FieldLabel>
            <textarea
              value={form.experienceHighlights ?? ''}
              onChange={e => setForm(f => ({ ...f, experienceHighlights: e.target.value }))}
              placeholder="Key projects, accomplishments, or contexts that make you particularly relevant for your target companies…"
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13.5px] outline-none resize-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Professional headline</FieldLabel>
          <FieldValue empty="Not set">{form.professionalHeadline}</FieldValue>
        </div>
        {form.backgroundAndPositioning && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <FieldLabel>Background & positioning</FieldLabel>
            <FieldValue empty="Not set">{form.backgroundAndPositioning}</FieldValue>
          </div>
        )}
        {(form.targetIndustries?.length ?? 0) > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <FieldLabel>Target industries</FieldLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.targetIndustries!.map(t => (
                <span key={t} className="text-[12.5px] font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t}</span>
              ))}
            </div>
          </div>
        )}
        {(form.targetLocations?.length ?? 0) > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <FieldLabel>Target locations</FieldLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.targetLocations!.map(t => (
                <span key={t} className="text-[12.5px] font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t}</span>
              ))}
            </div>
          </div>
        )}
        {form.experienceHighlights && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <FieldLabel>Experience highlights</FieldLabel>
            <FieldValue empty="Not set">{form.experienceHighlights}</FieldValue>
          </div>
        )}
        {!form.professionalHeadline && !form.backgroundAndPositioning && !form.targetIndustries?.length && !form.targetLocations?.length && !form.experienceHighlights && (
          <p className="text-[13px] italic" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Add targeting context to help Outreacher focus on the right companies and roles.
          </p>
        )}
      </div>
    </SectionCard>
  )
}

// ─── Section 5 — Links ────────────────────────────────────────────────────────

function LinksSection({ user, onUpdate }: { user: UserProfile; onUpdate: (p: Partial<UserProfile>) => Promise<void> }) {
  const [status, setStatus] = useState<SectionStatus>('view')
  const [form, setForm] = useState({ linkedin: user.linkedin ?? '', github: user.github ?? '', portfolio: user.portfolio ?? '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  function reset() {
    setForm({ linkedin: user.linkedin ?? '', github: user.github ?? '', portfolio: user.portfolio ?? '' })
    setErrors({})
    setServerError('')
  }

  function validateUrl(v: string) {
    if (!v.trim()) return true
    return /^https?:\/\/.+/.test(v.trim())
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!validateUrl(form.linkedin)) e.linkedin = 'Enter a valid URL starting with http:// or https://'
    if (!validateUrl(form.github)) e.github = 'Enter a valid URL starting with http:// or https://'
    if (!validateUrl(form.portfolio)) e.portfolio = 'Enter a valid URL starting with http:// or https://'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('saving')
    try {
      await onUpdate({ linkedin: form.linkedin, github: form.github, portfolio: form.portfolio })
      setStatus('saved')
    } catch {
      setServerError('Failed to save. Please try again.')
      setStatus('editing')
    }
  }

  return (
    <SectionCard
      title="Professional Links"
      impact="Provides additional context for research and evidence gathering."
      status={status}
      onEdit={() => { reset(); setStatus('editing') }}
      onSave={handleSave}
      onCancel={() => { reset(); setStatus('view') }}
      error={serverError}
      editChildren={
        <div className="flex flex-col gap-4">
          {[
            { key: 'linkedin' as const, label: 'LinkedIn', icon: icons.linkedin, placeholder: 'https://linkedin.com/in/yourname' },
            { key: 'github' as const, label: 'GitHub', icon: icons.github, placeholder: 'https://github.com/yourhandle' },
            { key: 'portfolio' as const, label: 'Portfolio / website', icon: icons.link, placeholder: 'https://yoursite.com' },
          ].map(field => (
            <div key={field.key}>
              <FieldLabel optional>{field.label}</FieldLabel>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
                  <Icon d={field.icon} size={15} />
                </div>
                <input
                  type="url"
                  value={form[field.key]}
                  onChange={e => { setForm(f => ({ ...f, [field.key]: e.target.value })); if (errors[field.key]) setErrors(ev => { const n = { ...ev }; delete n[field.key]; return n }) }}
                  placeholder={field.placeholder}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
                  style={{ border: `1px solid ${errors[field.key] ? '#FCA5A5' : 'var(--color-border)'}`, background: errors[field.key] ? '#FEF2F2' : 'var(--color-card)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                  onFocus={e => { if (!errors[field.key]) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { if (!errors[field.key]) e.currentTarget.style.borderColor = 'var(--color-border)' }}
                />
              </div>
              {errors[field.key] && <p className="mt-1 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}><Icon d={icons.alertCircle} size={12} />{errors[field.key]}</p>}
            </div>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {[
          { label: 'LinkedIn', value: user.linkedin, icon: icons.linkedin },
          { label: 'GitHub', value: user.github, icon: icons.github },
          { label: 'Portfolio', value: user.portfolio, icon: icons.link },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span style={{ color: 'var(--color-muted-fg)' }}><Icon d={item.icon} size={15} /></span>
            <div>
              <span className="text-[11.5px] font-semibold uppercase tracking-wide mr-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>{item.label}</span>
              {item.value?.trim()
                ? <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-[13.5px] transition-colors" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }} onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}>{item.value}</a>
                : <span className="text-[13.5px] italic" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>Not set</span>
              }
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Completeness Sidebar ─────────────────────────────────────────────────────

function CompletionSidebar({ user }: { user: UserProfile }) {
  const { score, items } = computeCompleteness(user)
  const done = items.filter(i => i.done)
  const missing = items.filter(i => !i.done)

  const barColor = score >= 80 ? '#10B981' : score >= 50 ? 'var(--color-accent)' : '#F59E0B'

  return (
    <div className="rounded-xl overflow-hidden sticky top-6" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Profile completeness</h3>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>A complete profile produces better results.</p>
      </div>

      <div className="px-5 py-4">
        {/* Score */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[30px] font-bold leading-none" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{score}%</span>
          <span className="text-[13px]" style={{ color: 'var(--color-muted-fg)' }}>complete</span>
        </div>

        {/* Bar */}
        <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--color-muted)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: barColor }}
          />
        </div>

        {/* What's missing */}
        {missing.length > 0 && (
          <div className="mb-4">
            <p className="text-[11.5px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
              Would help
            </p>
            <div className="flex flex-col gap-2">
              {missing.map(item => (
                <div key={item.label} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center" style={{ background: 'var(--color-muted)', border: '1.5px solid var(--color-border)' }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-muted-fg)' }} />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</p>
                    <p className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)' }}>{item.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What's done */}
        {done.length > 0 && (
          <div>
            <p className="text-[11.5px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
              Complete
            </p>
            <div className="flex flex-col gap-1.5">
              {done.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0' }}>
                    <Icon d={icons.check} size={9} strokeWidth={2.5} className="text-green-600" />
                  </div>
                  <p className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user, updateProfile } = useAuth()

  // Optimistic local user state so sidebar updates immediately
  const [localUser, setLocalUser] = useState<UserProfile>(user ?? {} as UserProfile)

  useEffect(() => {
    if (user) setLocalUser(user)
  }, [user])

  async function handleUpdate(patch: Partial<UserProfile>) {
    // Simulate network latency (prototype)
    await new Promise(r => setTimeout(r, 700))
    updateProfile(patch)
    setLocalUser(u => ({ ...u, ...patch }))
  }

  return (
    <div className="max-w-265 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Career Profile
        </h1>
        <p className="text-[15px] mt-1 max-w-130 leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
          Keep your professional context up to date so Outreacher can make better recommendations.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Main: sections */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <PersonalSection user={localUser} onUpdate={handleUpdate} />
          <ProfessionalIdentitySection user={localUser} onUpdate={handleUpdate} />
          <CareerGoalsSection user={localUser} onUpdate={handleUpdate} />
          <CareerTargetingSection />
          <LinksSection user={localUser} onUpdate={handleUpdate} />
        </div>

        {/* Sidebar: completeness */}
        <div className="w-full xl:w-65 shrink-0">
          <CompletionSidebar user={localUser} />
        </div>
      </div>
    </div>
  )
}
