import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import { useAuth } from '../../context/AuthContext'
import type { UserProfile } from '../../context/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = 'name' | 'role' | 'experience' | 'goals' | 'summary' | 'links'

const STEPS: { id: StepId; label: string; hint: string }[] = [
  { id: 'name', label: 'Your name', hint: 'How should Outreacher address you?' },
  { id: 'role', label: 'Your role', hint: 'Where you are and where you\'re headed.' },
  { id: 'experience', label: 'Experience', hint: 'Shape how Outreacher evaluates fit.' },
  { id: 'goals', label: 'Goals', hint: 'Define what success looks like.' },
  { id: 'summary', label: 'Summary', hint: 'How you\'d introduce yourself professionally.' },
  { id: 'links', label: 'Presence', hint: 'Optional links to your work.' },
]

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '6–9 years', '10+ years']

const SKILL_SUGGESTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Product Design', 'Figma',
  'Product Management', 'Data Analysis', 'SQL', 'Leadership', 'Go', 'Rust',
  'UX Research', 'Growth', 'iOS', 'Android', 'Fintech', 'Machine Learning',
]

// ─── Shared input styles ──────────────────────────────────────────────────────

function inputStyle(hasError?: boolean) {
  return {
    border: `1px solid ${hasError ? '#FCA5A5' : 'var(--color-border)'}`,
    background: hasError ? '#FEF2F2' : 'var(--color-card)',
    color: 'var(--color-primary)',
    fontFamily: 'Inter, sans-serif',
  }
}

function FieldLabel({ children, optional }: { children: string; optional?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {children}
      {optional && (
        <span className="text-[11px] font-normal px-1.5 py-0.5 rounded" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
          Optional
        </span>
      )}
    </label>
  )
}

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}>
      <Icon d={icons.alertCircle} size={12} /> {msg}
    </p>
  )
}

// ─── Step: Name ───────────────────────────────────────────────────────────────

function StepName({
  data, onChange, errors,
}: {
  data: { firstName: string; lastName: string }
  onChange: (k: string, v: string) => void
  errors: Record<string, string>
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>First name</FieldLabel>
        <input
          autoFocus
          type="text"
          value={data.firstName}
          onChange={e => onChange('firstName', e.target.value)}
          placeholder="Alex"
          className="w-full px-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
          style={inputStyle(!!errors.firstName)}
          onFocus={e => { if (!errors.firstName) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onBlur={e => { if (!errors.firstName) e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
        <FieldErr msg={errors.firstName} />
      </div>
      <div>
        <FieldLabel>Last name</FieldLabel>
        <input
          type="text"
          value={data.lastName}
          onChange={e => onChange('lastName', e.target.value)}
          placeholder="Chen"
          className="w-full px-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
          style={inputStyle(!!errors.lastName)}
          onFocus={e => { if (!errors.lastName) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onBlur={e => { if (!errors.lastName) e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
        <FieldErr msg={errors.lastName} />
      </div>
    </div>
  )
}

// ─── Step: Role ───────────────────────────────────────────────────────────────

function StepRole({
  data, onChange, errors,
}: {
  data: { currentRole: string; targetRole: string }
  onChange: (k: string, v: string) => void
  errors: Record<string, string>
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Current role</FieldLabel>
        <p className="text-[12.5px] mb-2" style={{ color: 'var(--color-muted-fg)' }}>Your current or most recent position.</p>
        <input
          autoFocus
          type="text"
          value={data.currentRole}
          onChange={e => onChange('currentRole', e.target.value)}
          placeholder="e.g. Software Engineer at Paystack"
          className="w-full px-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
          style={inputStyle(!!errors.currentRole)}
          onFocus={e => { if (!errors.currentRole) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onBlur={e => { if (!errors.currentRole) e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
        <FieldErr msg={errors.currentRole} />
      </div>
      <div>
        <FieldLabel>Target role</FieldLabel>
        <p className="text-[12.5px] mb-2" style={{ color: 'var(--color-muted-fg)' }}>The kind of role you want next. Be specific.</p>
        <input
          type="text"
          value={data.targetRole}
          onChange={e => onChange('targetRole', e.target.value)}
          placeholder="e.g. Senior Product Designer at a fintech company"
          className="w-full px-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
          style={inputStyle(!!errors.targetRole)}
          onFocus={e => { if (!errors.targetRole) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onBlur={e => { if (!errors.targetRole) e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
        <FieldErr msg={errors.targetRole} />
      </div>
    </div>
  )
}

// ─── Step: Experience ─────────────────────────────────────────────────────────

function StepExperience({
  data, onChange, errors,
}: {
  data: { yearsExperience: string; skills: string[] }
  onChange: (k: string, v: unknown) => void
  errors: Record<string, string>
}) {
  const [skillInput, setSkillInput] = useState('')

  function addSkill(s: string) {
    const trimmed = s.trim()
    if (trimmed && !data.skills.includes(trimmed) && data.skills.length < 12) {
      onChange('skills', [...data.skills, trimmed])
    }
    setSkillInput('')
  }

  function removeSkill(s: string) {
    onChange('skills', data.skills.filter(x => x !== s))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Years */}
      <div>
        <FieldLabel>Years of experience</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {EXPERIENCE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange('yearsExperience', opt)}
              className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: data.yearsExperience === opt ? 'var(--color-primary)' : 'var(--color-card)',
                color: data.yearsExperience === opt ? 'white' : 'var(--color-primary)',
                border: `1px solid ${data.yearsExperience === opt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <FieldErr msg={errors.yearsExperience} />
      </div>

      {/* Skills */}
      <div>
        <FieldLabel>Core skills</FieldLabel>
        <p className="text-[12.5px] mb-2" style={{ color: 'var(--color-muted-fg)' }}>
          Add up to 12 skills. These shape how Outreacher evaluates company and contact relevance.
        </p>
        <div
          className="min-h-13 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 cursor-text"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
          onClick={() => (document.getElementById('skill-input') as HTMLInputElement)?.focus()}
        >
          {data.skills.map(s => (
            <span
              key={s}
              className="flex items-center gap-1 text-[12.5px] px-2.5 py-1 rounded-md font-medium"
              style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Inter, sans-serif' }}
            >
              {s}
              <button type="button" onClick={() => removeSkill(s)} className="opacity-60 hover:opacity-100 transition-opacity">
                <Icon d={icons.x} size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
          {data.skills.length < 12 && (
            <input
              id="skill-input"
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput) }
                if (e.key === 'Backspace' && !skillInput && data.skills.length) removeSkill(data.skills[data.skills.length - 1])
              }}
              placeholder={data.skills.length === 0 ? 'Type a skill and press Enter…' : ''}
              className="outline-none text-[13px] bg-transparent min-w-30 flex-1 py-0.5"
              style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
            />
          )}
        </div>
        {/* Quick-add suggestions */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SKILL_SUGGESTIONS.filter(s => !data.skills.includes(s)).slice(0, 8).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addSkill(s)}
              className="text-[11.5px] px-2.5 py-1 rounded-md transition-all"
              style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
            >
              + {s}
            </button>
          ))}
        </div>
        <FieldErr msg={errors.skills} />
      </div>
    </div>
  )
}

// ─── Step: Goals ──────────────────────────────────────────────────────────────

function StepGoals({
  data, onChange, errors,
}: {
  data: { careerGoals: string }
  onChange: (k: string, v: string) => void
  errors: Record<string, string>
}) {
  const MAX = 300
  return (
    <div>
      <FieldLabel>Career goals</FieldLabel>
      <p className="text-[12.5px] mb-2.5" style={{ color: 'var(--color-muted-fg)' }}>
        Be specific. Outreacher uses this to evaluate company and role fit.
      </p>
      <div className="relative">
        <textarea
          autoFocus
          value={data.careerGoals}
          onChange={e => onChange('careerGoals', e.target.value.slice(0, MAX))}
          placeholder="e.g. Join a product-led fintech company as a senior engineer where I can own meaningful infrastructure problems and eventually move into engineering leadership."
          rows={5}
          className="w-full px-4 py-3 rounded-lg text-[14px] outline-none transition-all resize-none"
          style={{ ...inputStyle(!!errors.careerGoals), lineHeight: '1.6' }}
          onFocus={e => { if (!errors.careerGoals) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onBlur={e => { if (!errors.careerGoals) e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
        <span
          className="absolute bottom-3 right-3 text-[11.5px]"
          style={{ color: data.careerGoals.length > MAX * 0.9 ? '#F59E0B' : 'var(--color-muted-fg)' }}
        >
          {data.careerGoals.length}/{MAX}
        </span>
      </div>
      <FieldErr msg={errors.careerGoals} />
    </div>
  )
}

// ─── Step: Summary ────────────────────────────────────────────────────────────

function StepSummary({
  data, onChange, errors,
}: {
  data: { summary: string }
  onChange: (k: string, v: string) => void
  errors: Record<string, string>
}) {
  const MAX = 500
  return (
    <div>
      <FieldLabel>Professional summary</FieldLabel>
      <p className="text-[12.5px] mb-2.5" style={{ color: 'var(--color-muted-fg)' }}>
        Write as you'd introduce yourself. This may appear in your outreach — never invented.
      </p>
      <div className="relative">
        <textarea
          autoFocus
          value={data.summary}
          onChange={e => onChange('summary', e.target.value.slice(0, MAX))}
          placeholder="e.g. I'm a software engineer with 6 years of experience building payment infrastructure at scale. I've led backend systems handling millions of transactions and I'm looking for my next challenge at a company where engineering quality is taken seriously."
          rows={7}
          className="w-full px-4 py-3 rounded-lg text-[14px] outline-none transition-all resize-none"
          style={{ ...inputStyle(!!errors.summary), lineHeight: '1.6' }}
          onFocus={e => { if (!errors.summary) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onBlur={e => { if (!errors.summary) e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
        <span
          className="absolute bottom-3 right-3 text-[11.5px]"
          style={{ color: data.summary.length > MAX * 0.9 ? '#F59E0B' : 'var(--color-muted-fg)' }}
        >
          {data.summary.length}/{MAX}
        </span>
      </div>
      <FieldErr msg={errors.summary} />
    </div>
  )
}

// ─── Step: Links ──────────────────────────────────────────────────────────────

function StepLinks({
  data, onChange,
}: {
  data: { linkedin: string; github: string; portfolio: string }
  onChange: (k: string, v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)' }}>
        All fields are optional. Add what's relevant to your target role.
      </p>
      {[
        { key: 'linkedin', label: 'LinkedIn', icon: icons.linkedin, placeholder: 'https://linkedin.com/in/yourname' },
        { key: 'github', label: 'GitHub', icon: icons.github, placeholder: 'https://github.com/yourhandle' },
        { key: 'portfolio', label: 'Portfolio / website', icon: icons.link, placeholder: 'https://yoursite.com' },
      ].map(field => (
        <div key={field.key}>
          <FieldLabel optional>{field.label}</FieldLabel>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
              <Icon d={field.icon} size={15} />
            </div>
            <input
              type="url"
              value={(data as Record<string, string>)[field.key]}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
              style={inputStyle()}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Complete Screen ──────────────────────────────────────────────────────────

function CompleteScreen({ firstName, onEnter }: { firstName: string; onEnter: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
        </svg>
      </div>
      <h2 className="text-[26px] font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>
        You're all set, {firstName}.
      </h2>
      <p className="text-[15px] max-w-85 leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
        Outreacher has everything it needs to help you find the right companies, identify relevant contacts, and send outreach grounded in evidence.
      </p>
      <button
        onClick={onEnter}
        className="mt-8 flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-[15px] transition-all"
        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        Enter Outreacher <Icon d={icons.arrowRight} size={16} />
      </button>
    </div>
  )
}

// ─── Progress indicator ───────────────────────────────────────────────────────

function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                style={{
                  background: done ? 'var(--color-accent)' : active ? 'var(--color-primary)' : 'var(--color-muted)',
                  color: done || active ? 'white' : 'var(--color-muted-fg)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                {done ? <Icon d={icons.check} size={13} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className="text-[10.5px] font-medium hidden sm:block"
                style={{ color: active ? 'var(--color-primary)' : done ? 'var(--color-accent)' : 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {step.label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className="flex-1 h-px mx-2 mb-4 transition-all"
                style={{ background: done ? 'var(--color-accent)' : 'var(--color-border)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OnboardingPage() {
  const { authed, completeOnboarding } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const cardRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    firstName: '', lastName: '',
    currentRole: '', targetRole: '',
    yearsExperience: '', skills: [] as string[],
    careerGoals: '',
    summary: '',
    linkedin: '', github: '', portfolio: '',
  })

  useEffect(() => {
    if (!authed) navigate('/login', { replace: true })
  }, [authed, navigate])

  function update(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function validateStep(): Record<string, string> {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = 'First name is required.'
      if (!form.lastName.trim()) e.lastName = 'Last name is required.'
    } else if (step === 1) {
      if (!form.currentRole.trim()) e.currentRole = 'Current role is required.'
      if (!form.targetRole.trim()) e.targetRole = 'Target role is required.'
    } else if (step === 2) {
      if (!form.yearsExperience) e.yearsExperience = 'Please select your experience range.'
      if (form.skills.length === 0) e.skills = 'Add at least one skill.'
    } else if (step === 3) {
      if (form.careerGoals.trim().length < 20) e.careerGoals = 'Please describe your goals in at least 20 characters.'
    } else if (step === 4) {
      if (form.summary.trim().length < 30) e.summary = 'Please write at least 30 characters.'
    }
    return e
  }

  async function handleNext() {
    const errs = validateStep()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
      cardRef.current?.scrollTo(0, 0)
      return
    }

    // Last step — save
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    setSaving(false)
    completeOnboarding({ ...form, email: '' } as UserProfile)
    setDone(true)
  }

  function handleBack() {
    if (step > 0) { setStep(s => s - 1); setErrors({}) }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-130">
          <CompleteScreen firstName={form.firstName} onEnter={() => navigate('/')} />
        </div>
      </div>
    )
  }

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 h-15 shrink-0" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </div>
          <span className="font-bold text-[15px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>
            Outreacher
          </span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-[12.5px] transition-colors"
          style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-fg)')}
        >
          Skip for now
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto">
        <div ref={cardRef} className="w-full max-w-135">
          {/* Stepper */}
          <Stepper current={step} total={STEPS.length} />

          {/* Card */}
          <div className="rounded-2xl p-5 sm:p-8" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="mb-6">
              <h2
                className="text-[22px] font-bold leading-tight"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}
              >
                {currentStep.label}
              </h2>
              <p className="text-[14px] mt-1" style={{ color: 'var(--color-muted-fg)' }}>
                {currentStep.hint}
              </p>
            </div>

            {/* Step content */}
            {step === 0 && <StepName data={form} onChange={update} errors={errors} />}
            {step === 1 && <StepRole data={form} onChange={update} errors={errors} />}
            {step === 2 && <StepExperience data={form} onChange={update} errors={errors} />}
            {step === 3 && <StepGoals data={form} onChange={update} errors={errors} />}
            {step === 4 && <StepSummary data={form} onChange={update} errors={errors} />}
            {step === 5 && <StepLinks data={form} onChange={update} />}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center gap-1.5 text-[13.5px] font-medium transition-all"
                style={{ color: step === 0 ? 'transparent' : 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif', pointerEvents: step === 0 ? 'none' : 'auto' }}
                onMouseEnter={e => { if (step > 0) e.currentTarget.style.color = 'var(--color-primary)' }}
                onMouseLeave={e => { if (step > 0) e.currentTarget.style.color = 'var(--color-muted-fg)' }}
              >
                <Icon d={icons.arrowLeft} size={15} /> Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
                style={{
                  background: saving ? 'rgba(14,23,38,0.5)' : 'var(--color-primary)',
                  color: 'white',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#1E2D4A' }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--color-primary)' }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Saving…
                  </>
                ) : isLastStep ? (
                  <>Complete profile <Icon d={icons.check} size={14} strokeWidth={2.5} /></>
                ) : (
                  <>Continue <Icon d={icons.arrowRight} size={14} /></>
                )}
              </button>
            </div>
          </div>

          {/* Reassurance */}
          <p className="text-center text-[12px] mt-4" style={{ color: 'var(--color-muted-fg)' }}>
            You can update this information at any time in your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}
