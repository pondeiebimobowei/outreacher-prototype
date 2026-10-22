import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export function AuthLayout() {
  const { authed, onboarded } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authed && onboarded) navigate('/', { replace: true })
    else if (authed && !onboarded) navigate('/onboarding', { replace: true })
  }, [authed, onboarded, navigate])

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-background)' }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 p-10"
        style={{ background: 'var(--color-sidebar)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: 'var(--color-accent)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </div>
          <span
            className="font-bold text-white text-[17px] tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Outreacher
          </span>
        </div>

        <div>
          <p
            className="text-[28px] font-bold text-white leading-snug"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Career outreach,<br />done deliberately.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Research companies, identify the right contacts, and send outreach grounded in evidence — not guesswork.
          </p>
        </div>

        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2026 Outreacher
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  )
}
