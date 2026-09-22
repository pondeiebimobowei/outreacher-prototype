import { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { CommandPalette } from '../components/CommandPalette'
import { useAuth } from '../context/AuthContext'

export function AppShell() {
  const { authed, onboarded } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Auto-close mobile nav on route changes
  useEffect(() => { setMobileNavOpen(false) }, [location.pathname])

  // Global ⌘K / Ctrl+K shortcut
  const openPalette = useCallback(() => setPaletteOpen(true), [])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        const target = e.target as HTMLElement
        // Don't intercept ⌘K when user is typing in a text field
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        e.preventDefault()
        setPaletteOpen(v => !v)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!authed) { navigate('/login', { replace: true }); return }
    if (!onboarded) { navigate('/onboarding', { replace: true }); return }
  }, [authed, onboarded, navigate])

  if (!authed || !onboarded) return null

  return (
    <div className="h-screen overflow-hidden flex" style={{ background: 'var(--color-background)' }}>
      {/* Mobile overlay backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar — fixed overlay on mobile, static flex item on desktop */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200',
          'lg:relative lg:z-30 lg:translate-x-0 lg:inset-y-auto lg:inset-x-auto lg:top-auto lg:bottom-auto',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{ width: collapsed ? 64 : 220, flexShrink: 0, height: '100%' }}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      </div>

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileNavOpen(v => !v)} onOpenSearch={openPalette} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
