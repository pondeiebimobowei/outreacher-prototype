import { useState } from 'react'
import { Icon, icons } from '../../lib/icons'
import {
  type Person,
  type PersonCompanyAssociation,
  type ContactType,
  type CompanyEntry,
  loadWorkspace,
  saveWorkspace,
} from '../../lib/workspaceStore'

function genId() {
  return `contact-manual-${Math.random().toString(36).slice(2, 10)}`
}

function genAssocId() {
  return `assoc-manual-${Math.random().toString(36).slice(2, 10)}`
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

const AVATAR_COLORS = ['#7C3AED', '#0F766E', '#B45309', '#0369A1', '#BE185D', '#1D4ED8', '#065F46', '#9D174D', '#92400E', '#1E40AF']
function pickColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

type FormState = {
  contactType: ContactType
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  linkedinUrl: string
  referenceUrl: string
  notes: string
  companyId: string
  title: string
}

const EMPTY: FormState = { contactType: 'PERSON', firstName: '', lastName: '', displayName: '', email: '', phone: '', linkedinUrl: '', referenceUrl: '', notes: '', companyId: '', title: '' }

export function AddContactModal({
  people,
  companies,
  onClose,
  onSaved,
}: {
  people: Person[]
  companies: CompanyEntry[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  const duplicate = form.email.trim()
    ? people.find(c => c.email?.toLowerCase() === form.email.trim().toLowerCase())
    : null

  const isRole = form.contactType === 'ROLE_ADDRESS'
  const valid = isRole
    ? (form.displayName.trim() || form.firstName.trim())
    : (form.firstName.trim() && form.lastName.trim())

  function handleSave() {
    if (!valid || saving) return
    setSaving(true)
    setTimeout(() => {
      const ws = loadWorkspace()
      const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      const firstName = form.firstName.trim() || form.displayName.trim().split(' ')[0] || 'Role'
      const lastName = form.lastName.trim() || form.displayName.trim().split(' ').slice(1).join(' ') || ''
      const newPerson: Person = {
        id: genId(),
        contactType: form.contactType,
        firstName,
        lastName,
        displayName: form.displayName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        websiteUrl: form.referenceUrl.trim() || undefined,
        note: form.notes.trim() || undefined,
        source: 'MANUAL',
        avatarInitials: initials(firstName, lastName),
        avatarBg: pickColor(firstName + lastName),
        createdAt: now,
      }
      const nextPeople = [...ws.people, newPerson]
      let nextAssocs = ws.personCompanyAssociations
      if (form.companyId) {
        const newAssoc: PersonCompanyAssociation = {
          id: genAssocId(),
          personId: newPerson.id,
          companyId: form.companyId,
          title: form.title.trim() || 'Contact',
          source: 'MANUAL',
          createdAt: now,
        }
        nextAssocs = [...ws.personCompanyAssociations, newAssoc]
      }
      saveWorkspace({ ...ws, people: nextPeople, personCompanyAssociations: nextAssocs })
      onSaved()
    }, 500)
  }

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-y-auto" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="text-[17px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Add contact</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Contact type toggle */}
          <div>
            <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Contact type</p>
            <div className="grid grid-cols-2 gap-2">
              {(['PERSON', 'ROLE_ADDRESS'] as ContactType[]).map(ct => {
                const active = form.contactType === ct
                return (
                  <button key={ct} type="button" onClick={() => setForm(f => ({ ...f, contactType: ct }))}
                    className="flex items-start gap-2.5 p-3 rounded-lg text-left transition-all"
                    style={{ border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'var(--color-muted)' : 'transparent' }}>
                    <div className="w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: active ? 'var(--color-accent)' : 'var(--color-border)' }} />
                    <div>
                      <p className="text-[12.5px] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {ct === 'PERSON' ? 'Person' : 'Role / Inbox'}
                      </p>
                      <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: 'var(--color-muted-fg)' }}>
                        {ct === 'PERSON' ? 'A named individual' : 'e.g. jobs@, hiring@, team@'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duplicate warning */}
          {duplicate && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <span style={{ color: '#D97706', flexShrink: 0, marginTop: 1, display: 'flex' }}><Icon d={icons.alertCircle} size={16} /></span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: '#92400E', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>This person may already exist</p>
                <p className="text-[12.5px] mt-0.5" style={{ color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
                  {duplicate.firstName} {duplicate.lastName} has this email address. You can still save as a new record.
                </p>
              </div>
            </div>
          )}

          {/* Name fields */}
          {isRole ? (
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Display name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input value={form.displayName} onChange={set('displayName')} placeholder="Hiring Team" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>First name <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={form.firstName} onChange={set('firstName')} placeholder="Alex" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Last name <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={form.lastName} onChange={set('lastName')} placeholder="Smith" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }} />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Email</label>
            <input value={form.email} onChange={set('email')} type="email" placeholder="alex@company.com" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: `1px solid ${duplicate ? '#FED7AA' : 'var(--color-border)'}`, color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }} />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Phone <span className="font-normal text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>optional</span></label>
            <input value={form.phone} onChange={set('phone')} type="tel" placeholder="+1 555 000 0000" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }} />
          </div>

          {/* LinkedIn */}
          {!isRole && (
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>LinkedIn URL <span className="font-normal text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>optional</span></label>
              <input value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="linkedin.com/in/alexsmith" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }} />
            </div>
          )}

          {/* Reference URL */}
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Reference URL <span className="font-normal text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>optional</span></label>
            <input value={form.referenceUrl} onChange={set('referenceUrl')} placeholder="Job posting, team page, press mention…" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }} />
          </div>

          {/* Company association */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Company association <span className="normal-case font-normal">— optional</span></p>
            <div className="space-y-3">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Company</label>
                <select value={form.companyId} onChange={set('companyId')} className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: form.companyId ? 'var(--color-primary)' : 'var(--color-muted-fg)', fontFamily: 'Inter, sans-serif' }}>
                  <option value="">No company</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {form.companyId && (
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Title / Role</label>
                  <input value={form.title} onChange={set('title')} placeholder="Engineering Manager" className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none" style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }} />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Notes <span className="font-normal text-[12px]" style={{ color: 'var(--color-muted-fg)' }}>optional</span></label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="How you know them, context, anything useful…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-[13.5px] outline-none resize-none"
              style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={!valid || saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {saving ? (
              <><Icon d={icons.loader} size={14} className="animate-spin" /> Saving…</>
            ) : 'Save contact'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all"
            style={{ background: 'var(--color-muted)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-muted)')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
