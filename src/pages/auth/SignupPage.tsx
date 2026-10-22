import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import { useAuth } from '../../context/AuthContext'

type FieldError = { email?: string; password?: string; confirm?: string; terms?: string }

function passwordStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: '' }
  if (pw.length < 6) return { score: 1, label: 'Too short', color: '#EF4444' }
  const hasUpper = /[A-Z]/.test(pw)
  const hasNum = /\d/.test(pw)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw)
  const score = 1 + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0) + (pw.length >= 12 ? 1 : 0)
  if (score <= 2) return { score: 2, label: 'Weak', color: '#F59E0B' }
  if (score <= 3) return { score: 3, label: 'Fair', color: '#3B82F6' }
  return { score: 4, label: 'Strong', color: '#10B981' }
}

function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [loading, setLoading] = useState(false)
  const strength = passwordStrength(password)

  function validate() {
    const e: FieldError = {}
    if (!email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.'
    if (!password) e.password = 'Password is required.'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!confirm) e.confirm = 'Please confirm your password.'
    else if (confirm !== password) e.confirm = 'Passwords do not match.'
    if (!agreed) e.terms = 'You must agree to continue.'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    await new Promise(r => setTimeout(r, 1100))
    setLoading(false)
    signup(email)
    navigate('/onboarding')
  }

  const fieldBase = (err?: string) => ({
    border: `1px solid ${err ? '#FCA5A5' : 'var(--color-border)'}`,
    background: err ? '#FEF2F2' : 'var(--color-card)',
    color: 'var(--color-primary)',
    fontFamily: 'Inter, sans-serif',
  })

  return (
    <div className="w-full max-w-105">
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </div>
        <span className="font-bold text-[15px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>Outreacher</span>
      </div>

      <h1 className="text-[24px] font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>
        Create your account
      </h1>
      <p className="text-[14px] mb-7" style={{ color: 'var(--color-muted-fg)' }}>
        You'll build your career profile after this.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Work or personal email
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
              <Icon d={icons.mail} size={15} />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(v => ({ ...v, email: undefined })) }}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
              style={fieldBase(errors.email)}
              onFocus={e => { if (!errors.email) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { if (!errors.email) e.currentTarget.style.borderColor = 'var(--color-border)' }}
            />
          </div>
          {errors.email && <FieldErr msg={errors.email} />}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Password
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
              <Icon d={icons.lock} size={15} />
            </div>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(v => ({ ...v, password: undefined })) }}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="w-full pl-9 pr-10 py-2.5 rounded-lg text-[14px] outline-none transition-all"
              style={fieldBase(errors.password)}
              onFocus={e => { if (!errors.password) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { if (!errors.password) e.currentTarget.style.borderColor = 'var(--color-border)' }}
            />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
              <Icon d={showPw ? icons.eyeOff : icons.eye} size={15} />
            </button>
          </div>
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= strength.score ? strength.color : 'var(--color-border)' }} />
                ))}
              </div>
              <span className="text-[11.5px] font-medium" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
          {errors.password && <FieldErr msg={errors.password} />}
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Confirm password
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
              <Icon d={icons.lock} size={15} />
            </div>
            <input
              type="password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); if (errors.confirm) setErrors(v => ({ ...v, confirm: undefined })) }}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
              style={fieldBase(errors.confirm)}
              onFocus={e => { if (!errors.confirm) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { if (!errors.confirm) e.currentTarget.style.borderColor = 'var(--color-border)' }}
            />
            {confirm && confirm === password && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#10B981' }}>
                <Icon d={icons.check} size={15} strokeWidth={2.5} />
              </div>
            )}
          </div>
          {errors.confirm && <FieldErr msg={errors.confirm} />}
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => { setAgreed(e.target.checked); if (errors.terms) setErrors(v => ({ ...v, terms: undefined })) }}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{
                  background: agreed ? 'var(--color-accent)' : 'var(--color-card)',
                  border: `1.5px solid ${errors.terms ? '#FCA5A5' : agreed ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                {agreed && <Icon d={icons.check} size={10} strokeWidth={2.5} className="text-white" />}
              </div>
            </div>
            <span className="text-[12.5px]" style={{ color: 'var(--color-muted-fg)' }}>
              I agree to the{' '}
              <span className="font-medium" style={{ color: 'var(--color-accent)' }}>Terms of Service</span>
              {' '}and{' '}
              <span className="font-medium" style={{ color: 'var(--color-accent)' }}>Privacy Policy</span>
            </span>
          </label>
          {errors.terms && <FieldErr msg={errors.terms} />}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: loading ? 'rgba(14,23,38,0.5)' : 'var(--color-primary)',
            color: 'white',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? <><Spinner /> Creating account…</> : 'Create account'}
        </button>
      </form>

      <p className="text-center text-[13px] mt-6" style={{ color: 'var(--color-muted-fg)' }}>
        Already have an account?{' '}
        <Link to="/login" className="font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}

function FieldErr({ msg }: { msg: string }) {
  return (
    <p className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}>
      <Icon d={icons.alertCircle} size={12} /> {msg}
    </p>
  )
}
