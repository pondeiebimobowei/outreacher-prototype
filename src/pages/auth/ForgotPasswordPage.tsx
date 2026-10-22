import { useState } from 'react'
import { Link } from 'react-router'
import { Icon, icons } from '../../lib/icons'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return }
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="w-full max-w-100">
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </div>
        <span className="font-bold text-[15px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>Outreacher</span>
      </div>

      {sent ? (
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: '#ECFDF5', color: '#10B981' }}
          >
            <Icon d={icons.checkCircle} size={24} strokeWidth={1.8} />
          </div>
          <h1 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>
            Check your email
          </h1>
          <p className="text-[14px] mb-6" style={{ color: 'var(--color-muted-fg)', lineHeight: '1.6' }}>
            We sent a reset link to <strong style={{ color: 'var(--color-primary)' }}>{email}</strong>. It expires in 15 minutes.
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)' }}>
            Didn't receive it?{' '}
            <button
              onClick={() => setSent(false)}
              className="font-semibold"
              style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Try again
            </button>
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="text-[13px] flex items-center justify-center gap-1.5"
              style={{ color: 'var(--color-muted-fg)' }}
            >
              <Icon d={icons.arrowLeft} size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-[24px] font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>
            Reset your password
          </h1>
          <p className="text-[14px] mb-7" style={{ color: 'var(--color-muted-fg)' }}>
            Enter your email and we'll send a reset link.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
                  onChange={e => { setEmail(e.target.value); if (error) setError('') }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
                  style={{
                    border: `1px solid ${error ? '#FCA5A5' : 'var(--color-border)'}`,
                    background: error ? '#FEF2F2' : 'var(--color-card)',
                    color: 'var(--color-primary)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => { if (!error) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { if (!error) e.currentTarget.style.borderColor = 'var(--color-border)' }}
                />
              </div>
              {error && (
                <p className="mt-1.5 text-[12px] flex items-center gap-1" style={{ color: '#EF4444' }}>
                  <Icon d={icons.alertCircle} size={12} /> {error}
                </p>
              )}
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
              {loading ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-[13px] flex items-center justify-center gap-1.5"
              style={{ color: 'var(--color-muted-fg)' }}
            >
              <Icon d={icons.arrowLeft} size={14} /> Back to sign in
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
