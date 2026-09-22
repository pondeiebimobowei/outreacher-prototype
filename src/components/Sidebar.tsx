import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Icon, icons } from '../lib/icons'
import { navItems, bottomNavItems } from '../lib/nav'
import { useWorkspace } from '../context/WorkspaceContext'

// ─── Workspace Switcher ───────────────────────────────────────────────────────

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { workspaces, activeWorkspaceId, activeWorkspaceName, switchWorkspace, createWorkspace } = useWorkspace()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const dropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (!dropRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); setCreating(false) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (creating) inputRef.current?.focus()
  }, [creating])

  function handleSwitch(id: string) {
    if (id === activeWorkspaceId) { setOpen(false); return }
    switchWorkspace(id)
    setOpen(false)
    navigate('/dashboard', { replace: true })
  }

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    createWorkspace(name)
    setNewName('')
    setCreating(false)
    setOpen(false)
    navigate('/dashboard', { replace: true })
  }

  // Collapsed mode: just show a tooltip-equipped dot button
  if (collapsed) {
    return (
      <div
        className="mx-2 my-2 relative"
        title={`Workspace: ${activeWorkspaceName}`}
      >
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full h-8 rounded-md flex items-center justify-center transition-colors"
          style={{ background: open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)')}
        >
          <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">
            {activeWorkspaceName.slice(0, 2)}
          </span>
        </button>
        {open && (
          <div
            ref={dropRef}
            className="absolute top-0 left-full ml-2 z-50 rounded-lg overflow-hidden"
            style={{ minWidth: 220, background: '#1c1c28', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <WorkspaceDropdownContent
              workspaces={workspaces}
              activeId={activeWorkspaceId}
              creating={creating}
              newName={newName}
              inputRef={inputRef}
              onSwitch={handleSwitch}
              onStartCreate={() => setCreating(true)}
              onCancelCreate={() => { setCreating(false); setNewName('') }}
              onConfirmCreate={handleCreate}
              onNameChange={setNewName}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative mx-2 my-2" ref={dropRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors"
        style={{
          background: open ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.85)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = open ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)')}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <span className="text-[9px] font-bold text-white uppercase tracking-tight leading-none">
            {activeWorkspaceName.slice(0, 2)}
          </span>
        </div>
        <span
          className="flex-1 text-[12.5px] font-medium truncate"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {activeWorkspaceName}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="absolute top-full mt-1 left-0 right-0 z-50 rounded-lg overflow-hidden"
          style={{ background: '#1c1c28', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <WorkspaceDropdownContent
            workspaces={workspaces}
            activeId={activeWorkspaceId}
            creating={creating}
            newName={newName}
            inputRef={inputRef}
            onSwitch={handleSwitch}
            onStartCreate={() => setCreating(true)}
            onCancelCreate={() => { setCreating(false); setNewName('') }}
            onConfirmCreate={handleCreate}
            onNameChange={setNewName}
          />
        </div>
      )}
    </div>
  )
}

// ─── Dropdown content (shared between collapsed/expanded modes) ───────────────

interface DropdownProps {
  workspaces: { id: string; name: string }[]
  activeId: string
  creating: boolean
  newName: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onSwitch: (id: string) => void
  onStartCreate: () => void
  onCancelCreate: () => void
  onConfirmCreate: () => void
  onNameChange: (v: string) => void
}

function WorkspaceDropdownContent({ workspaces, activeId, creating, newName, inputRef, onSwitch, onStartCreate, onCancelCreate, onConfirmCreate, onNameChange }: DropdownProps) {
  return (
    <div className="py-1">
      <div className="px-3 py-1.5">
        <span className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Workspaces
        </span>
      </div>
      {workspaces.map(ws => (
        <button
          key={ws.id}
          onClick={() => onSwitch(ws.id)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
          style={{ color: 'rgba(255,255,255,0.85)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: ws.id === activeId ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }}
          >
            <span className="text-[9px] font-bold text-white uppercase tracking-tight leading-none">
              {ws.name.slice(0, 2)}
            </span>
          </div>
          <span className="flex-1 text-[12.5px] font-medium truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {ws.name}
          </span>
          {ws.id === activeId && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </button>
      ))}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 4, paddingTop: 4 }}>
        {creating ? (
          <div className="px-3 py-2 flex flex-col gap-2">
            <input
              ref={inputRef}
              value={newName}
              onChange={e => onNameChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onConfirmCreate()
                if (e.key === 'Escape') onCancelCreate()
              }}
              placeholder="Workspace name"
              className="w-full rounded-md px-2.5 py-1.5 text-[12.5px] outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            />
            <div className="flex gap-1.5">
              <button
                onClick={onConfirmCreate}
                disabled={!newName.trim()}
                className="flex-1 rounded-md py-1 text-[11.5px] font-semibold transition-colors"
                style={{
                  background: newName.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: newName.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                Create
              </button>
              <button
                onClick={onCancelCreate}
                className="flex-1 rounded-md py-1 text-[11.5px] font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onStartCreate}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-[12.5px] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Create workspace
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  const activeId =
    navItems.find(n => n.path !== '/' && location.pathname.startsWith(n.path))?.id ??
    bottomNavItems.find(n => location.pathname.startsWith(n.path))?.id ??
    (location.pathname === '/' ? 'dashboard' : '')

  return (
    <aside
      className="h-full flex flex-col"
      style={{ width: collapsed ? 64 : 220, background: 'var(--color-sidebar)', color: 'var(--color-sidebar-fg)' }}
    >
      {/* Logo row */}
      <div
        className="flex items-center h-[60px] px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-accent)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-[15px] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Outreacher
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex-shrink-0 rounded-md p-1 transition-colors"
          style={{ color: 'var(--color-sidebar-fg)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon d={collapsed ? icons.chevronRight : icons.chevronLeft} size={16} />
        </button>
      </div>

      {/* Workspace switcher */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {navItems.map(item => {
          const isActive = activeId === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 w-full rounded-md px-2.5 py-2.5 lg:py-2 text-left transition-all relative"
              style={{
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-sidebar-fg)',
                minHeight: 44,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ background: 'var(--color-accent)' }}
                />
              )}
              <span className="flex-shrink-0" style={{ color: isActive ? 'white' : 'var(--color-sidebar-fg)' }}>
                <Icon d={icons[item.iconKey]} size={17} strokeWidth={isActive ? 1.8 : 1.5} />
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-[13.5px] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--color-accent)', color: 'white', lineHeight: '1' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom nav */}
      <div
        className="flex-shrink-0 py-3 px-2 flex flex-col gap-0.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {bottomNavItems.map(item => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 w-full rounded-md px-2.5 py-2.5 lg:py-2 text-left transition-all"
              style={{
                color: isActive ? 'white' : 'var(--color-sidebar-fg)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                minHeight: 44,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <span className="flex-shrink-0">
                <Icon d={icons[item.iconKey]} size={17} strokeWidth={1.5} />
              </span>
              {!collapsed && (
                <span className="text-[13.5px] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
