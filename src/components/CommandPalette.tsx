import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../lib/icons'
import { loadWorkspace } from '../lib/workspaceStore'
import {
  buildSearchIndex,
  searchItems,
  groupSearchResults,
  getRecentItems,
  type SearchableItem,
  type SearchGroup,
  type SearchResultType,
} from '../lib/search'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<SearchResultType, string | string[]> = {
  company:      icons.companies,
  contact:      icons.user,
  opportunity:  icons.opportunities,
  conversation: icons.replies,
  campaign:     icons.campaigns,
  template:     icons.fileText,
  outreach:     icons.outreach,
}

// ─── Commands ─────────────────────────────────────────────────────────────────

type CommandGroup = 'nav' | 'create' | 'workflow'

type Command = {
  id: string
  label: string
  icon: string | string[]
  route?: string
  action?: () => void
  group: CommandGroup
}

const COMMAND_GROUP_LABELS: Record<CommandGroup, string> = {
  nav:      'Navigate',
  create:   'Create',
  workflow: 'Workflow',
}

const NAV_COMMANDS: Command[] = [
  { id: 'nav-dashboard',     label: 'Go to Dashboard',     icon: icons.dashboard,     route: '/dashboard',     group: 'nav' },
  { id: 'nav-companies',     label: 'Go to Companies',     icon: icons.companies,     route: '/companies',     group: 'nav' },
  { id: 'nav-opportunities', label: 'Go to Opportunities', icon: icons.opportunities, route: '/opportunities', group: 'nav' },
  { id: 'nav-contacts',      label: 'Go to People',        icon: icons.contacts,      route: '/contacts',      group: 'nav' },
  { id: 'nav-conversations', label: 'Go to Conversations', icon: icons.replies,       route: '/conversations', group: 'nav' },
  { id: 'nav-campaigns',     label: 'Go to Campaigns',     icon: icons.campaigns,     route: '/campaigns',     group: 'nav' },
  { id: 'nav-templates',     label: 'Go to Templates',     icon: icons.fileText,      route: '/templates',     group: 'nav' },
  { id: 'nav-settings',      label: 'Go to Settings',      icon: icons.settings,      route: '/settings',      group: 'nav' },
]

const CREATE_COMMANDS: Command[] = [
  { id: 'create-company',  label: 'Add company',     icon: icons.plus, route: '/companies', group: 'create' },
  { id: 'create-campaign', label: 'Create campaign', icon: icons.plus, route: '/campaigns', group: 'create' },
  { id: 'create-template', label: 'Create template', icon: icons.plus, route: '/templates', group: 'create' },
]

// ─── Flat navigable list item ──────────────────────────────────────────────────

type NavEntry =
  | { kind: 'result'; item: SearchableItem }
  | { kind: 'command'; cmd: Command }

// ─── Palette state (computed on open) ─────────────────────────────────────────

type PaletteState = {
  index: SearchableItem[]
  recents: SearchableItem[]
  workflowCommands: Command[]
}

function computePaletteState(): PaletteState {
  const ws = loadWorkspace()
  const index = buildSearchIndex(ws)
  const recents = getRecentItems(ws)

  const workflowCommands: Command[] = []
  const needsResearch = ws.companies.find(e => e.researchStage === 'NOT_STARTED')
  if (needsResearch) {
    workflowCommands.push({
      id: 'wf-research',
      label: 'Continue latest research',
      icon: icons.briefcase,
      route: `/companies/${needsResearch.id}`,
      group: 'workflow',
    })
  }
  const needsReply = ws.companies.find(e => e.convStage === 'REPLIED')
  if (needsReply) {
    workflowCommands.push({
      id: 'wf-reply',
      label: 'View conversation needing attention',
      icon: icons.replies,
      route: `/conversations/${needsReply.id}`,
      group: 'workflow',
    })
  }

  return { index, recents, workflowCommands }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function GroupHeader({ label }: { label: string }) {
  return (
    <div
      className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      role="presentation"
    >
      {label}
    </div>
  )
}

function StatusPill({ label, color, bg }: { label: string; color?: string; bg?: string }) {
  return (
    <span
      className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{
        background: bg ?? 'var(--color-muted)',
        color: color ?? 'var(--color-muted-fg)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
      aria-label={label}
    >
      {label}
    </span>
  )
}

function ResultItem({
  item,
  active,
  onSelect,
  onHover,
  id,
}: {
  item: SearchableItem
  active: boolean
  onSelect: () => void
  onHover: () => void
  id: string
}) {
  return (
    <button
      id={id}
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onMouseEnter={onHover}
      className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg mx-1"
      style={{
        background: active ? 'var(--color-muted)' : 'transparent',
        width: 'calc(100% - 8px)',
        minHeight: 44,
        outline: 'none',
        transition: 'background 80ms',
      }}
    >
      <span
        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
        style={{
          background: active ? 'var(--color-card)' : 'var(--color-muted)',
          color: 'var(--color-muted-fg)',
          border: active ? '1px solid var(--color-border)' : '1px solid transparent',
        }}
        aria-hidden="true"
      >
        <Icon d={TYPE_ICON[item.type]} size={12} strokeWidth={1.8} />
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className="text-[13.5px] font-medium truncate leading-snug"
          style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {item.title}
        </span>
        {item.subtitle && (
          <span
            className="text-[12px] truncate leading-snug"
            style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}
          >
            {item.subtitle}
          </span>
        )}
      </div>
      {item.statusLabel && (
        <StatusPill label={item.statusLabel} color={item.statusColor} bg={item.statusBg} />
      )}
    </button>
  )
}

function CommandItem({
  command,
  active,
  onSelect,
  onHover,
  id,
}: {
  command: Command
  active: boolean
  onSelect: () => void
  onHover: () => void
  id: string
}) {
  return (
    <button
      id={id}
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onMouseEnter={onHover}
      className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg mx-1"
      style={{
        background: active ? 'var(--color-muted)' : 'transparent',
        width: 'calc(100% - 8px)',
        minHeight: 44,
        outline: 'none',
        transition: 'background 80ms',
      }}
    >
      <span
        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
        style={{
          background: active ? 'var(--color-card)' : 'var(--color-muted)',
          color: 'var(--color-muted-fg)',
          border: active ? '1px solid var(--color-border)' : '1px solid transparent',
        }}
        aria-hidden="true"
      >
        <Icon d={command.icon} size={12} strokeWidth={1.8} />
      </span>
      <span
        className="text-[13.5px] font-medium flex-1"
        style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {command.label}
      </span>
    </button>
  )
}

// ─── Main palette ──────────────────────────────────────────────────────────────

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [palette, setPalette] = useState<PaletteState>({ index: [], recents: [], workflowCommands: [] })

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Rebuild state fresh every time the palette opens
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement
      setPalette(computePaletteState())
      setQuery('')
      setActiveIdx(0)
      // Defer focus to after mount/paint
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      // Return focus to the element that opened the palette
      setTimeout(() => triggerRef.current?.focus(), 50)
    }
  }, [open])

  // ── Derived data ──────────────────────────────────────────────────────────

  const allCommands = [...NAV_COMMANDS, ...CREATE_COMMANDS, ...palette.workflowCommands]
  const isSearchMode = query.trim().length > 0

  const searchGroups: SearchGroup[] = isSearchMode
    ? groupSearchResults(searchItems(palette.index, query))
    : []

  const totalResults = searchGroups.reduce((s, g) => s + g.items.length, 0)
  const renderEmpty = isSearchMode && totalResults === 0

  // Flat list for keyboard navigation
  const flatItems: NavEntry[] = []
  if (isSearchMode) {
    for (const group of searchGroups) {
      for (const item of group.items) flatItems.push({ kind: 'result', item })
    }
  } else {
    for (const item of palette.recents) flatItems.push({ kind: 'result', item })
    for (const cmd of allCommands) flatItems.push({ kind: 'command', cmd })
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  const select = useCallback((entry: NavEntry) => {
    onClose()
    if (entry.kind === 'result') {
      navigate(entry.item.route)
    } else {
      if (entry.cmd.action) entry.cmd.action()
      else if (entry.cmd.route) navigate(entry.cmd.route)
    }
  }, [navigate, onClose])

  // ── Keyboard ──────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setActiveIdx(i => (i + 1) % Math.max(1, flatItems.length))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIdx(i => (i - 1 + Math.max(1, flatItems.length)) % Math.max(1, flatItems.length))
        break
      case 'Enter': {
        e.preventDefault()
        const entry = flatItems[activeIdx]
        if (entry) select(entry)
        break
      }
      case 'Tab':
        // Keep focus inside the dialog; prevent tabbing out
        e.preventDefault()
        break
    }
  }, [flatItems, activeIdx, select, onClose])

  // Reset active index when query or mode changes
  useEffect(() => { setActiveIdx(0) }, [query])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector(`[aria-selected="true"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  if (!open) return null

  // ── Index tracking for keyboard nav rendering ──────────────────────────────

  let cursor = 0

  function nextIdx(): number { return cursor++ }

  // ── Command groups for display ─────────────────────────────────────────────

  const cmdGroupMap: Map<CommandGroup, Command[]> = new Map()
  for (const cmd of allCommands) {
    const list = cmdGroupMap.get(cmd.group) ?? []
    list.push(cmd)
    cmdGroupMap.set(cmd.group, list)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(14,23,38,0.30)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search and command palette"
        aria-describedby="palette-hint"
        className="fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: 'clamp(12px, 8vh, 72px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(640px, calc(100vw - 24px))',
          maxHeight: 'min(560px, calc(100svh - 96px))',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(14,23,38,0.15), 0 2px 8px rgba(14,23,38,0.06)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Input bar */}
        <div
          className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{ height: 54, borderBottom: '1px solid var(--color-border)' }}
        >
          <span style={{ color: 'var(--color-muted-fg)', flexShrink: 0 }} aria-hidden="true">
            <Icon d={icons.search} size={16} strokeWidth={1.7} />
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded="true"
            aria-controls="palette-listbox"
            aria-activedescendant={flatItems[activeIdx] ? `palette-item-${activeIdx}` : undefined}
            aria-label="Search companies, people, campaigns, templates…"
            placeholder="Search companies, people, campaigns…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif', minWidth: 0 }}
            spellCheck={false}
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md"
              style={{ color: 'var(--color-muted-fg)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              aria-label="Clear search"
              tabIndex={-1}
            >
              <Icon d={icons.x} size={13} />
            </button>
          )}
          <kbd
            className="text-[10.5px] px-1.5 py-0.5 rounded flex-shrink-0 hidden sm:block"
            style={{
              background: 'var(--color-muted)',
              color: 'var(--color-muted-fg)',
              border: '1px solid var(--color-border)',
              fontFamily: 'Inter, sans-serif',
            }}
            aria-hidden="true"
          >
            esc
          </kbd>
        </div>

        {/* List */}
        <div
          id="palette-listbox"
          ref={listRef}
          role="listbox"
          aria-label={isSearchMode ? 'Search results' : 'Commands'}
          className="overflow-y-auto flex-1 py-1"
          style={{ minHeight: 0 }}
        >
          {/* ── Empty state: no results ──────────────────────────── */}
          {renderEmpty && (
            <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}
                aria-hidden="true"
              >
                <Icon d={icons.search} size={18} />
              </span>
              <div>
                <p className="text-[14px] font-semibold mb-0.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  No results
                </p>
                <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  Nothing matched <span className="font-medium" style={{ color: 'var(--color-primary)' }}>"{query}"</span>
                </p>
              </div>
              <div className="flex gap-2 mt-1 flex-wrap justify-center">
                <button
                  onClick={() => { setQuery(''); inputRef.current?.focus() }}
                  className="text-[12.5px] font-medium px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif', border: '1px solid var(--color-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                >
                  Clear
                </button>
                <button
                  onClick={() => { navigate('/companies'); onClose() }}
                  className="text-[12.5px] font-medium px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif', border: '1px solid var(--color-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                >
                  Browse companies
                </button>
              </div>
            </div>
          )}

          {/* ── Search results ───────────────────────────────────── */}
          {isSearchMode && !renderEmpty && (
            <>
              {searchGroups.map(group => (
                <div key={group.type} role="group" aria-label={group.label}>
                  <GroupHeader label={group.label} />
                  {group.items.map(item => {
                    const idx = cursor
                    nextIdx()
                    return (
                      <ResultItem
                        key={item.id}
                        id={`palette-item-${idx}`}
                        item={item}
                        active={activeIdx === idx}
                        onSelect={() => select({ kind: 'result', item })}
                        onHover={() => setActiveIdx(idx)}
                      />
                    )
                  })}
                </div>
              ))}
            </>
          )}

          {/* ── Command mode ──────────────────────────────────────── */}
          {!isSearchMode && (
            <>
              {/* Recent items */}
              {palette.recents.length > 0 && (
                <div role="group" aria-label="Recent">
                  <GroupHeader label="Recent" />
                  {palette.recents.map(item => {
                    const idx = cursor
                    nextIdx()
                    return (
                      <ResultItem
                        key={item.id}
                        id={`palette-item-${idx}`}
                        item={item}
                        active={activeIdx === idx}
                        onSelect={() => select({ kind: 'result', item })}
                        onHover={() => setActiveIdx(idx)}
                      />
                    )
                  })}
                </div>
              )}

              {/* Grouped commands */}
              {Array.from(cmdGroupMap.entries()).map(([group, cmds]) => (
                <div key={group} role="group" aria-label={COMMAND_GROUP_LABELS[group]}>
                  <GroupHeader label={COMMAND_GROUP_LABELS[group]} />
                  {cmds.map(cmd => {
                    const idx = cursor
                    nextIdx()
                    return (
                      <CommandItem
                        key={cmd.id}
                        id={`palette-item-${idx}`}
                        command={cmd}
                        active={activeIdx === idx}
                        onSelect={() => select({ kind: 'command', cmd })}
                        onHover={() => setActiveIdx(idx)}
                      />
                    )
                  })}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          id="palette-hint"
          className="flex items-center gap-5 px-4 py-2 flex-shrink-0"
          style={{ borderTop: '1px solid var(--color-border)' }}
          aria-hidden="true"
        >
          {[
            { keys: ['↑', '↓'], label: 'navigate' },
            { keys: ['↵'], label: 'select' },
            { keys: ['esc'], label: 'close' },
          ].map(hint => (
            <div key={hint.label} className="flex items-center gap-1.5">
              {hint.keys.map(k => (
                <kbd
                  key={k}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--color-muted)',
                    color: 'var(--color-muted-fg)',
                    border: '1px solid var(--color-border)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {k}
                </kbd>
              ))}
              <span className="text-[11px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                {hint.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
