import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Icon, icons } from '../../lib/icons'
import { useAuth } from '../../context/AuthContext'

type FieldError = { email?: string; password?: string }

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e: FieldError = {}
    if (!email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.'
    if (!password) e.password = 'Password is required.'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setServerError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    login(email)
    navigate('/')
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </div>
        <span className="font-bold text-[15px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>Outreacher</span>
      </div>

      <h1 className="text-[24px] font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>
        Welcome back
      </h1>
      <p className="text-[14px] mb-7" style={{ color: 'var(--color-muted-fg)' }}>
        Sign in to your account to continue.
      </p>

      {serverError && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-5 text-[13px]"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
        >
          <Icon d={icons.alertCircle} size={15} className="mt-0.5 flex-shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Email
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
              style={{
                border: `1px solid ${errors.email ? '#FCA5A5' : 'var(--color-border)'}`,
                background: errors.email ? '#FEF2F2' : 'var(--color-card)',
                color: 'var(--color-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => { if (!errors.email) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { if (!errors.email) e.currentTarget.style.borderColor = 'var(--color-border)' }}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}>
              <Icon d={icons.alertCircle} size={12} /> {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[12.5px] font-medium transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-fg)' }}>
              <Icon d={icons.lock} size={15} />
            </div>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(v => ({ ...v, password: undefined })) }}
              placeholder="Your password"
              autoComplete="current-password"
              className="w-full pl-9 pr-10 py-2.5 rounded-lg text-[14px] outline-none transition-all"
              style={{
                border: `1px solid ${errors.password ? '#FCA5A5' : 'var(--color-border)'}`,
                background: errors.password ? '#FEF2F2' : 'var(--color-card)',
                color: 'var(--color-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => { if (!errors.password) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { if (!errors.password) e.currentTarget.style.borderColor = 'var(--color-border)' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--color-muted-fg)' }}
            >
              <Icon d={showPw ? icons.eyeOff : icons.eye} size={15} />
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}>
              <Icon d={icons.alertCircle} size={12} /> {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all mt-1 flex items-center justify-center gap-2"
          style={{
            background: loading ? 'rgba(14,23,38,0.5)' : 'var(--color-primary)',
            color: 'white',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <Spinner /> Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="text-center text-[13px] mt-6" style={{ color: 'var(--color-muted-fg)' }}>
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold transition-colors"
          style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
