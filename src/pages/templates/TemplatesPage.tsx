import { useState } from 'react'
import { Icon, icons } from '../../lib/icons'
import {
  type OutreachTemplate,
  type TemplateCategory,
  TEMPLATE_CATEGORY_LABELS,
  DEMO_TEMPLATES,
  loadWorkspace,
  saveWorkspace,
} from '../../lib/workspaceStore'

// ─── Category config ──────────────────────────────────────────────────────────

const CAT_CFG: Record<TemplateCategory, { color: string; bg: string; border: string }> = {
  NETWORKING: { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  REFERRAL: { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
  HIRING_MANAGER: { color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE' },
  RECRUITER: { color: '#92400E', bg: '#FFF7ED', border: '#FED7AA' },
  FOLLOW_UP: { color: '#92400E', bg: '#FEF3C7', border: '#FDE68A' },
  GENERAL: { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' },
}

const TEMPLATE_VARIABLES = ['{{firstName}}', '{{company}}', '{{role}}']

const PREVIEW_CONTEXT = { firstName: 'Jane', company: 'Paystack', role: 'Engineering Manager' }

// ─── Template editor ──────────────────────────────────────────────────────────

type EditorMode = 'edit' | 'preview'

function TemplateEditor({ template, onSave, onClose }: {
  template: Partial<OutreachTemplate>
  onSave: (t: OutreachTemplate) => void
  onClose: () => void
}) {
  const [name, setName] = useState(template.name ?? '')
  const [category, setCategory] = useState<TemplateCategory>(template.category ?? 'NETWORKING')
  const [subject, setSubject] = useState(template.subject ?? '')
  const [body, setBody] = useState(template.body ?? '')
  const [mode, setMode] = useState<EditorMode>('edit')

  function resolvePreview(text: string): string {
    return text
      .replace(/{{firstName}}/g, PREVIEW_CONTEXT.firstName)
      .replace(/{{company}}/g, PREVIEW_CONTEXT.company)
      .replace(/{{role}}/g, PREVIEW_CONTEXT.role)
  }

  function insertVariable(variable: string) {
    setBody(prev => prev + variable)
  }

  function handleSave() {
    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const saved: OutreachTemplate = {
      id: template.id ?? 'tmpl-' + Date.now(),
      name: name.trim(),
      category,
      subject: subject.trim(),
      body: body.trim(),
      createdAt: template.createdAt ?? now,
      updatedAt: now,
      isArchived: template.isArchived,
      isDemo: template.isDemo,
    }
    onSave(saved)
  }

  const canSave = name.trim().length >= 2 && subject.trim().length >= 2 && body.trim().length >= 10

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-[640px] rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', maxHeight: '92vh' }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="text-[17px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {template.id ? 'Edit template' : 'Create template'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-muted-fg)' }}><Icon d={icons.x} size={18} /></button>
        </div>

        {/* Tab bar */}
        <div className="px-6 py-2 flex gap-1" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
          {(['edit', 'preview'] as EditorMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-all"
              style={{
                background: mode === m ? 'var(--color-card)' : 'transparent',
                color: mode === m ? 'var(--color-primary)' : 'var(--color-muted-fg)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'edit' ? (
            <div className="flex flex-col lg:flex-row h-full">
              {/* Form */}
              <div className="flex-1 px-6 py-5 flex flex-col gap-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Fintech Engineering Intro"
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none transition-all"
                    style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
                    onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(TEMPLATE_CATEGORY_LABELS) as TemplateCategory[]).map(c => {
                      const cfg = CAT_CFG[c]
                      const isSelected = category === c
                      return (
                        <button
                          key={c}
                          onClick={() => setCategory(c)}
                          className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full transition-all"
                          style={{
                            background: isSelected ? cfg.bg : 'var(--color-muted)',
                            color: isSelected ? cfg.color : 'var(--color-muted-fg)',
                            border: isSelected ? `1.5px solid ${cfg.border}` : '1px solid var(--color-border)',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                          }}
                        >
                          {TEMPLATE_CATEGORY_LABELS[c]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Subject</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Engineering interest at {{company}}"
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none transition-all"
                    style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
                    onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Body</label>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Write your template message here. Use {{firstName}}, {{company}}, {{role}} for personalization."
                    rows={9}
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] leading-relaxed resize-none outline-none transition-all"
                    style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                    onFocus={e => (e.currentTarget.style.border = '1px solid var(--color-accent)')}
                    onBlur={e => (e.currentTarget.style.border = '1px solid var(--color-border)')}
                  />
                </div>
              </div>

              {/* Variables panel */}
              <div className="w-full lg:w-[180px] shrink-0 px-4 py-5 flex flex-col gap-3" style={{ borderTop: '1px solid var(--color-border)', borderLeft: 'none' }}>
                <div className="lg:border-l-0 lg:pt-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-2.5" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>
                    Personalization
                  </p>
                  <div className="flex flex-wrap lg:flex-col gap-1.5">
                    {TEMPLATE_VARIABLES.map(v => (
                      <button
                        key={v}
                        onClick={() => insertVariable(v)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-[11.5px] font-mono transition-all"
                        style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-accent)', fontFamily: 'monospace' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                        title={`Insert ${v}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                    Click to insert at end of body.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="px-6 py-5">
              <div className="rounded-lg px-4 py-2 mb-4 inline-flex items-center gap-2" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <Icon d={icons.eye} size={13} strokeWidth={2} />
                <span className="text-[12px] font-medium" style={{ color: '#1D4ED8', fontFamily: 'Inter, sans-serif' }}>
                  Preview for {PREVIEW_CONTEXT.firstName} at {PREVIEW_CONTEXT.company}
                </span>
              </div>
              {subject && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.07em' }}>Subject</p>
                  <p className="text-[15px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {resolvePreview(subject)}
                  </p>
                </div>
              )}
              {body && (
                <div className="rounded-xl p-4" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                  {resolvePreview(body).split('\n').map((line, i) => (
                    <p key={i} className={`text-[13.5px] leading-relaxed ${line === '' ? 'mb-3' : ''}`}
                      style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}>
                      {line || ' '}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={onClose} className="text-[13px] font-medium" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{
              background: canSave ? 'var(--color-primary)' : 'var(--color-muted)',
              color: canSave ? 'white' : 'var(--color-muted-fg)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => { if (canSave) e.currentTarget.style.background = '#1E2D4A' }}
            onMouseLeave={e => { if (canSave) e.currentTarget.style.background = canSave ? 'var(--color-primary)' : 'var(--color-muted)' }}
          >
            <Icon d={icons.check} size={14} strokeWidth={2.5} /> Save template
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ template, onEdit, onDuplicate, onArchive }: {
  template: OutreachTemplate
  onEdit: () => void
  onDuplicate: () => void
  onArchive: () => void
}) {
  const cfg = CAT_CFG[template.category]
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="rounded-xl p-5 transition-all relative"
      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', opacity: template.isArchived ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold truncate mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {template.name}
          </h3>
          <span
            className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {TEMPLATE_CATEGORY_LABELS[template.category]}
          </span>
        </div>
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
            style={{ color: 'var(--color-muted-fg)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-fg)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 rounded-lg overflow-hidden shadow-lg" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', minWidth: 140 }}>
                {[
                  { label: 'Edit', icon: icons.edit, action: () => { onEdit(); setMenuOpen(false) } },
                  { label: 'Duplicate', icon: icons.copy, action: () => { onDuplicate(); setMenuOpen(false) } },
                  { label: template.isArchived ? 'Unarchive' : 'Archive', icon: icons.archive, action: () => { onArchive(); setMenuOpen(false) } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-left transition-all"
                    style={{ color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon d={item.icon} size={14} /> {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-[12.5px] mb-3 truncate" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
        "{template.subject}"
      </p>

      <div className="flex items-center justify-between">
        {template.isArchived ? (
          <span className="text-[11.5px] px-2 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#6B7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Archived</span>
        ) : (
          <button
            onClick={onEdit}
            className="text-[12.5px] font-semibold flex items-center gap-1 transition-colors"
            style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Edit template
          </button>
        )}
        <span className="text-[11.5px]" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Updated {template.updatedAt}
        </span>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)' }}>
        <Icon d={icons.fileText} size={26} strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-100">
        <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          No templates yet
        </h2>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
          Create a reusable outreach message to speed up future campaigns.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        <Icon d={icons.plus} size={15} /> Create template
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function TemplatesPage() {
  const [ws, setWs] = useState(() => {
    const w = loadWorkspace()
    if (w.isDemoLoaded && w.templates.length === 0) {
      const updated = { ...w, templates: DEMO_TEMPLATES }
      saveWorkspace(updated)
      return updated
    }
    return w
  })
  const [editingTemplate, setEditingTemplate] = useState<Partial<OutreachTemplate> | null>(null)

  const templates = ws.templates
  const active = templates.filter(t => !t.isArchived)
  const archived = templates.filter(t => t.isArchived)

  function saveTemplate(t: OutreachTemplate) {
    const idx = ws.templates.findIndex(x => x.id === t.id)
    const updated = {
      ...ws,
      templates: idx >= 0
        ? ws.templates.map(x => x.id === t.id ? t : x)
        : [t, ...ws.templates],
    }
    saveWorkspace(updated)
    setWs(updated)
    setEditingTemplate(null)
  }

  function duplicateTemplate(t: OutreachTemplate) {
    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const dupe: OutreachTemplate = {
      ...t,
      id: 'tmpl-' + Date.now(),
      name: t.name + ' (copy)',
      createdAt: now,
      updatedAt: now,
      isArchived: false,
      isDemo: false,
    }
    const updated = { ...ws, templates: [dupe, ...ws.templates] }
    saveWorkspace(updated)
    setWs(updated)
  }

  function toggleArchive(t: OutreachTemplate) {
    const updated = {
      ...ws,
      templates: ws.templates.map(x => x.id === t.id ? { ...x, isArchived: !x.isArchived } : x),
    }
    saveWorkspace(updated)
    setWs(updated)
  }

  return (
    <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Email templates
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
            Create reusable outreach messages that can be adapted for different companies and contacts.
          </p>
        </div>
        <button
          onClick={() => setEditingTemplate({})}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1E2D4A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          <Icon d={icons.plus} size={14} /> Create template
        </button>
      </div>

      {templates.length === 0 ? (
        <EmptyState onCreate={() => setEditingTemplate({})} />
      ) : (
        <>
          {/* Active templates */}
          {active.length > 0 && (
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[13.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
                  Templates
                </h2>
                <span className="text-[11.5px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-fg)', border: '1px solid var(--color-border)' }}>
                  {active.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map(t => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onEdit={() => setEditingTemplate(t)}
                    onDuplicate={() => duplicateTemplate(t)}
                    onArchive={() => toggleArchive(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archived templates */}
          {archived.length > 0 && (
            <div>
              <h2 className="text-[13.5px] font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
                Archived
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archived.map(t => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onEdit={() => setEditingTemplate(t)}
                    onDuplicate={() => duplicateTemplate(t)}
                    onArchive={() => toggleArchive(t)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {editingTemplate !== null && (
        <TemplateEditor
          template={editingTemplate}
          onSave={saveTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      )}
    </div>
  )
}
