import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../lib/icons'
import { useAuth } from '../context/AuthContext'

export function Header({ onMenuClick, onOpenSearch }: { onMenuClick: () => void; onOpenSearch: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase()

  const displayName = user?.firstName ?? user?.email?.split('@')[0] ?? 'You'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="sticky top-0 z-20 h-[60px] flex items-center px-3 sm:px-6 gap-3"
      style={{
        background: 'rgba(247,247,245,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      {/* Mobile: hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors flex-shrink-0"
        style={{ color: 'var(--color-muted-fg)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
        aria-label="Open navigation"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile: logo text (only shown when sidebar is hidden) */}
      <span
        className="lg:hidden font-bold text-[14px] tracking-tight flex-shrink-0"
        style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        Outreacher
      </span>

      {/* Search trigger — full bar on desktop, icon button on mobile */}
      <button
        onClick={onOpenSearch}
        className="hidden sm:flex flex-1 max-w-[480px] items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          cursor: 'text',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        aria-label="Open search (⌘K)"
      >
        <Icon d={icons.search} size={15} strokeWidth={1.8} className="" />
        <span
          className="flex-1 text-[13px] truncate"
          style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
        >
          Search companies, people, opportunities...
        </span>
        <kbd
          className="text-[11px] px-1.5 py-0.5 rounded hidden md:flex items-center flex-shrink-0"
          style={{
            background: 'var(--color-muted)',
            color: 'var(--color-muted-fg)',
            fontFamily: 'Inter, sans-serif',
            border: '1px solid var(--color-border)',
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Mobile: search icon */}
      <button
        onClick={onOpenSearch}
        className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
        style={{ color: 'var(--color-muted-fg)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
        aria-label="Open search"
      >
        <Icon d={icons.search} size={18} />
      </button>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--color-muted-fg)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
          >
            <Icon d={icons.bell} size={18} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
              style={{ background: 'var(--color-accent)' }}
            />
          </button>
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-[320px] rounded-xl shadow-xl overflow-hidden z-50"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span className="text-[13px] font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Notifications
                </span>
              </div>
              {[
                { title: 'Reply from Kuda', body: 'Alex Obi replied to your outreach', time: '1 hr ago' },
                { title: 'Research complete', body: 'Vercel research has finished', time: '12 min ago' },
              ].map((n, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex gap-3 cursor-pointer transition-colors"
                  style={{ borderBottom: i < 1 ? '1px solid var(--color-border)' : undefined }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {n.title}
                    </p>
                    <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>{n.body}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2.5 pl-1 pr-2 sm:pr-3 py-1 rounded-lg transition-all"
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {displayName}
              </p>
              <p className="text-[11px] leading-tight" style={{ color: 'var(--color-muted-fg)' }}>Pro plan</p>
            </div>
          </button>
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-[200px] rounded-xl shadow-xl overflow-hidden z-50"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <p className="text-[13px] font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>
                  {displayName}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>{user?.email ?? ''}</p>
              </div>
              {[
                { label: 'Profile', icon: icons.user, path: '/profile' },
                { label: 'Settings', icon: icons.settings, path: '/settings' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setDropdownOpen(false); navigate(item.path) }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-[13px] transition-colors"
                  style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif', minHeight: 44 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon d={item.icon} size={15} />
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-[13px] transition-colors"
                  style={{ color: '#EF4444', fontFamily: 'Inter, sans-serif', minHeight: 44 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon d={icons.logOut} size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
