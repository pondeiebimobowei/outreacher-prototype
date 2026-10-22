import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../lib/icons'

function Nav() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleScroll = (id: string) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 bg-white/90 backdrop-blur-md" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between h-[64px]">
        <div className="flex items-center gap-2.5 font-bold text-[16px] tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>
            <Icon d={icons.companies} size={14} />
          </div>
          Outreacher
        </div>
        <div className="hidden md:flex items-center gap-7">
          <button onClick={() => handleScroll('product')} className="text-[13.5px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted-fg)'}>Product</button>
          <button onClick={() => handleScroll('how-it-works')} className="text-[13.5px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted-fg)'}>How it works</button>
          <button onClick={() => handleScroll('use-cases')} className="text-[13.5px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted-fg)'}>Use cases</button>
        </div>
        <div className="hidden md:flex items-center gap-5">
          <button onClick={() => navigate('/login')} className="text-[13.5px] font-semibold transition-colors" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Sign in
          </button>
          <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-lg text-[13.5px] font-semibold text-white transition-all shadow-sm" style={{ background: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = '#283548'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}>
            Get started
          </button>
        </div>
        <button className="md:hidden p-2" style={{ color: 'var(--color-primary)' }} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></> : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 right-0 bg-white border-b shadow-lg p-5 flex flex-col gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => handleScroll('product')} className="text-left text-[15px] font-medium" style={{ color: 'var(--color-primary)' }}>Product</button>
          <button onClick={() => handleScroll('how-it-works')} className="text-left text-[15px] font-medium" style={{ color: 'var(--color-primary)' }}>How it works</button>
          <button onClick={() => handleScroll('use-cases')} className="text-left text-[15px] font-medium" style={{ color: 'var(--color-primary)' }}>Use cases</button>
          <div className="h-px w-full my-1" style={{ background: 'var(--color-border)' }} />
          <button onClick={() => navigate('/login')} className="text-left text-[15px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Sign in</button>
          <button onClick={() => navigate('/signup')} className="text-center px-4 py-3 rounded-lg text-[15px] font-semibold text-white" style={{ background: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Get started</button>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  const navigate = useNavigate()
  return (
    <section className="pt-32 pb-20 px-5 sm:px-8">
      <div className="max-w-[1100px] mx-auto text-center flex flex-col items-center">
        <h1 className="text-[42px] sm:text-[56px] lg:text-[72px] font-extrabold leading-[1.05] tracking-[-0.03em] max-w-[800px]" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Stop applying blindly.<br/>Start building relationships.
        </h1>
        <p className="text-[18px] sm:text-[20px] leading-[1.6] mt-6 max-w-[680px]" style={{ color: 'var(--color-muted-fg)' }}>
          Outreacher helps you turn target companies into real opportunities by researching what matters, identifying the right people, and giving you a credible reason to reach out.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 w-full sm:w-auto">
          <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[14.5px] font-semibold text-white transition-all shadow-sm" style={{ background: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = '#283548'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}>
            Get started
          </button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[14.5px] font-semibold transition-all" style={{ color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            See how it works
          </button>
        </div>
      </div>
      
      <div className="max-w-[900px] mx-auto mt-20 rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
        <div className="h-12 border-b flex items-center px-4 gap-4" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="h-6 w-56 rounded border flex items-center justify-center text-[11px] font-medium" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-muted-fg)' }}>
              outreacher.app/companies/stripe
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-10 bg-white">
          <div className="flex flex-col gap-6 max-w-[600px] mx-auto">
            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg" style={{ background: '#635BFF' }}>S</div>
              <div>
                <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[var(--color-primary)]">Stripe</h3>
                <p className="text-[13px] text-gray-500">Financial Infrastructure</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl border flex items-start gap-4" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5"><Icon d={icons.search} size={14} /></div>
                <div>
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">Research Signal & Evidence</p>
                  <p className="font-medium text-[14px] text-[var(--color-primary)]">New developer tooling team expansion</p>
                  <p className="text-[13px] text-gray-500 mt-1">Job postings and recent blog updates indicate a strong push into new developer SDKs.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border flex items-start gap-4" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5"><Icon d={icons.opportunities} size={14} /></div>
                <div>
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">Opportunity</p>
                  <p className="font-semibold text-[13px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mb-1">PROACTIVE</p>
                  <p className="text-[13px] text-gray-500 mt-1">No specific open role for you yet, but the timing is right to build a relationship.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border flex items-start gap-4" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5"><Icon d={icons.contacts} size={14} /></div>
                <div>
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">Person & Why</p>
                  <p className="font-medium text-[14px] text-[var(--color-primary)]">Alex Chen · Engineering Manager</p>
                  <p className="text-[13px] text-gray-500 mt-1">Leads the developer tooling team. Right person to ask about their SDK roadmap.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <div className="px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white shadow-sm flex items-center gap-2" style={{ background: 'var(--color-accent)' }}>
                <Icon d={icons.outreach} size={14} /> Prepare outreach
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className="py-24 px-5 sm:px-8 border-t bg-white" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            The problem isn't finding companies.<br/>It's knowing why to reach out.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Traditional */}
          <div className="p-8 rounded-2xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
            <h3 className="text-[16px] font-bold text-gray-500 uppercase tracking-widest mb-8" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Traditional</h3>
            <div className="flex flex-col gap-0 relative">
              <div className="absolute left-[15px] top-6 bottom-6 w-px bg-gray-300" />
              {['Find job', 'Apply', 'Wait'].map((step, i) => (
                <div key={i} className="flex items-center gap-4 py-4 relative z-10">
                  <div className="w-8 h-8 rounded-full border bg-white flex items-center justify-center text-[12px] font-bold text-gray-500" style={{ borderColor: 'var(--color-border)' }}>{i + 1}</div>
                  <span className="text-[16px] font-medium text-gray-600">{step}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Outreacher */}
          <div className="p-8 rounded-2xl border shadow-sm relative overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10" />
            <h3 className="text-[16px] font-bold uppercase tracking-widest mb-8" style={{ color: 'var(--color-accent)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Outreacher</h3>
            <div className="flex flex-col gap-0 relative">
              <div className="absolute left-[15px] top-6 bottom-6 w-px bg-indigo-100" />
              {['Choose company', 'Understand what is happening', 'Identify opportunity', 'Find relevant person', 'Know why to contact them', 'Start conversation'].map((step, i) => (
                <div key={i} className="flex items-center gap-4 py-4 relative z-10">
                  <div className="w-8 h-8 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 flex items-center justify-center text-[12px] font-bold">{i + 1}</div>
                  <span className="text-[16px] font-medium" style={{ color: 'var(--color-primary)' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductConceptSection() {
  return (
    <section id="product" className="py-24 px-5 sm:px-8 border-t bg-[var(--color-background)]" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-16">
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Know why you're reaching out before you hit send.
          </h2>
          <p className="text-[18px] leading-[1.6] text-[var(--color-muted-fg)] max-w-[700px]">
            Outreacher doesn't start with a message. It starts with context. 
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[14px] font-medium text-[var(--color-primary)]">
          {['Company signal', 'Evidence', 'Opportunity', 'Person', 'Reason', 'Outreach'].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-4">
              <div className="px-5 py-3 rounded-xl border bg-white shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
                {step}
              </div>
              {i < arr.length - 1 && <Icon d={icons.arrowRight} size={16} className="text-gray-400" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function OpportunityModelSection() {
  return (
    <section className="py-24 px-5 sm:px-8 border-t bg-white" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-16">
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Not every company is a job opening. That's the point.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded inline-block mb-4 tracking-wider">CONFIRMED</div>
            <h3 className="text-[18px] font-bold mb-2 text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">A relevant opening exists.</h3>
            <p className="text-[14.5px] leading-[1.6] text-[var(--color-muted-fg)]">A relevant opening is supported by evidence. The timing is clear — this is the moment to act.</p>
          </div>
          <div className="p-6 rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded inline-block mb-4 tracking-wider">PROACTIVE</div>
            <h3 className="text-[18px] font-bold mb-2 text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">No opening — but strong signal.</h3>
            <p className="text-[14.5px] leading-[1.6] text-[var(--color-muted-fg)]">There is no confirmed opening, but there is enough company-fit evidence to justify building a relationship.</p>
          </div>
          <div className="p-6 rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-[11px] font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded inline-block mb-4 tracking-wider">UNCLASSIFIED</div>
            <h3 className="text-[18px] font-bold mb-2 text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">Research still needed.</h3>
            <p className="text-[14.5px] leading-[1.6] text-[var(--color-muted-fg)]">There is not enough evidence yet to classify this company. Keep researching before reaching out.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PersonSection() {
  return (
    <section className="py-24 px-5 sm:px-8 border-t bg-[var(--color-background)]" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1">
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-6" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Don't just find a contact.<br/>Understand why them.
          </h2>
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full border bg-white flex items-center justify-center font-bold text-[14px]">1</div><span className="text-[16px] font-medium text-[var(--color-primary)]">Opportunity</span></div>
            <div className="w-0.5 h-6 bg-gray-300 ml-5" />
            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full border bg-white flex items-center justify-center font-bold text-[14px]">2</div><span className="text-[16px] font-medium text-[var(--color-primary)]">Relevant person</span></div>
            <div className="w-0.5 h-6 bg-gray-300 ml-5" />
            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full border bg-white flex items-center justify-center font-bold text-[14px]">3</div><span className="text-[16px] font-medium text-[var(--color-primary)]">Reason to contact</span></div>
          </div>
        </div>
        
        <div className="w-full lg:w-[480px] p-6 rounded-2xl border bg-white shadow-md" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-4 border-b pb-4 mb-4" style={{ borderColor: 'var(--color-border)' }}>
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-[16px]">SD</div>
            <div>
              <h4 className="text-[16px] font-bold text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">Sarah Davis</h4>
              <p className="text-[13px] text-[var(--color-muted-fg)]">Design Director · Acme Corp</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Why this person</p>
              <p className="text-[14px] text-[var(--color-primary)]">Leads the design system team which was recently formed according to their tech blog.</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supporting evidence</p>
              <p className="text-[14px] text-[var(--color-primary)]">"We are scaling our component library" (Acme Tech Blog, Oct 2026)</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Conversation angle</p>
              <p className="text-[14px] text-[var(--color-primary)]">Discuss challenges of migrating legacy components to the new system.</p>
            </div>
          </div>
          <button className="w-full py-3 rounded-xl text-[14px] font-semibold text-white transition-all shadow-sm flex items-center justify-center gap-2" style={{ background: 'var(--color-accent)' }}>
            <Icon d={icons.outreach} size={14} /> Prepare outreach
          </button>
        </div>
      </div>
    </section>
  )
}

function OutreachSection() {
  return (
    <section className="py-24 px-5 sm:px-8 border-t bg-white" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto text-center">
        <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-6" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          AI can help write it.<br/>You decide what gets sent.
        </h2>
        <p className="text-[18px] leading-[1.6] text-[var(--color-muted-fg)] max-w-[700px] mx-auto mb-16">
          Outreacher does not autonomously contact people. The primary workflow keeps you in control.
        </p>

        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6">
          <div className="p-6 rounded-2xl border bg-gray-50 flex-1 text-left" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-4">Inputs</div>
            <div className="flex flex-col gap-2 text-[14px] font-medium text-[var(--color-primary)]">
              <div className="p-3 bg-white border rounded-lg shadow-sm" style={{ borderColor: 'var(--color-border)' }}>Company context</div>
              <div className="p-3 bg-white border rounded-lg shadow-sm" style={{ borderColor: 'var(--color-border)' }}>Person context</div>
              <div className="p-3 bg-white border rounded-lg shadow-sm" style={{ borderColor: 'var(--color-border)' }}>Evidence</div>
              <div className="p-3 bg-white border rounded-lg shadow-sm" style={{ borderColor: 'var(--color-border)' }}>Conversation angle</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center px-2 text-gray-300">
            <Icon d={icons.arrowRight} size={24} className="hidden lg:block" />
            <Icon d={icons.arrowDown} size={24} className="lg:hidden" />
          </div>

          <div className="p-6 rounded-2xl border bg-gray-50 flex-1 text-left flex flex-col justify-center" style={{ borderColor: 'var(--color-border)' }}>
             <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-4">Workflow</div>
             <div className="flex items-center justify-between text-[14px] font-semibold text-[var(--color-primary)] relative">
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />
                <div className="w-12 h-12 rounded-full border bg-white shadow-sm flex items-center justify-center z-10" style={{ borderColor: 'var(--color-border)' }}>Draft</div>
                <div className="w-12 h-12 rounded-full border bg-white shadow-sm flex items-center justify-center z-10" style={{ borderColor: 'var(--color-border)' }}>Edit</div>
                <div className="w-12 h-12 rounded-full border bg-white shadow-sm flex items-center justify-center z-10" style={{ borderColor: 'var(--color-border)' }}>Save</div>
                <div className="w-12 h-12 rounded-full border text-white shadow-sm flex items-center justify-center z-10" style={{ borderColor: 'var(--color-accent)', background: 'var(--color-accent)' }}>Send</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ConversationSection() {
  return (
    <section className="py-24 px-5 sm:px-8 border-t bg-[var(--color-background)]" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1">
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-6" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            The relationship doesn't end when the email is sent.
          </h2>
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-3 font-medium text-[16px] text-[var(--color-primary)]">Outreach sent <Icon d={icons.arrowRight} size={14} className="text-gray-400" /> Conversation <Icon d={icons.arrowRight} size={14} className="text-gray-400" /> Reply <Icon d={icons.arrowRight} size={14} className="text-gray-400" /> Continue relationship</div>
          </div>
        </div>
        
        <div className="w-full lg:w-[460px] rounded-2xl border bg-white shadow-md overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-6">
            <div className="flex flex-col gap-6 relative">
              <div className="absolute top-2 bottom-2 left-[15px] w-px bg-gray-200" />
              
              <div className="flex gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 border border-blue-200"><Icon d={icons.outreach} size={14} /></div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">You sent outreach</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">Subject: Platform engineering challenges</p>
                  <p className="text-[11px] text-gray-400 mt-1">2 days ago</p>
                </div>
              </div>
              
              <div className="flex gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 border border-gray-200"><Icon d={icons.clock} size={14} /></div>
                <div className="p-3 bg-gray-50 rounded-xl border w-full" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[13px] font-medium text-gray-600">No reply yet. We'll keep the conversation here when they respond.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WorkflowSection() {
  const steps = [
    'Company', 'Evidence', 'Opportunity', 'Person', 'Reason', 'Outreach', 'Conversation'
  ]
  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8 border-t bg-white" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto text-center">
        <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-16" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          A connected workflow.
        </h2>
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-0">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-center">
                <div className={`h-px flex-1 ${i === 0 ? 'bg-transparent' : 'bg-gray-200'}`} />
                <div className="w-8 h-8 rounded-full border bg-white flex items-center justify-center font-bold text-[12px] z-10" style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>{i + 1}</div>
                <div className={`h-px flex-1 ${i === steps.length - 1 ? 'bg-transparent' : 'bg-gray-200'}`} />
              </div>
              <p className="mt-4 text-[14px] font-semibold text-[var(--color-primary)] font-['Plus_Jakarta_Sans'] hidden md:block">{step}</p>
              
              <div className="md:hidden flex items-center py-4 w-full">
                <p className="text-[15px] font-semibold text-[var(--color-primary)] font-['Plus_Jakarta_Sans'] text-center w-full">{step}</p>
              </div>
              {i < steps.length - 1 && <div className="md:hidden h-6 w-px bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  return (
    <section id="use-cases" className="py-24 px-5 sm:px-8 border-t bg-[var(--color-background)]" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto">
        <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-12 text-center" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Who is this for?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl border bg-white shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-[18px] font-bold mb-3 text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">Target-company job seekers</h3>
            <p className="text-[15px] leading-[1.6] text-[var(--color-muted-fg)]">You know exactly where you want to work, but need a better path in than throwing an application into the ATS void.</p>
          </div>
          <div className="p-8 rounded-2xl border bg-white shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-[18px] font-bold mb-3 text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">Career switchers</h3>
            <p className="text-[15px] leading-[1.6] text-[var(--color-muted-fg)]">You want to build credibility and relationships by showing you understand their problems, rather than relying entirely on past titles.</p>
          </div>
          <div className="p-8 rounded-2xl border bg-white shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-[18px] font-bold mb-3 text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">Experienced professionals</h3>
            <p className="text-[15px] leading-[1.6] text-[var(--color-muted-fg)]">You want targeted, peer-level conversations with hiring managers and leaders instead of mass applications.</p>
          </div>
          <div className="p-8 rounded-2xl border bg-white shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-[18px] font-bold mb-3 text-[var(--color-primary)] font-['Plus_Jakarta_Sans']">Intentional networkers</h3>
            <p className="text-[15px] leading-[1.6] text-[var(--color-muted-fg)]">You want every message you send to have a real reason, solid context, and actual value behind it.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    { q: 'Is Outreacher a job board?', a: 'No. It helps you pursue companies and people intentionally rather than simply browse listings.' },
    { q: 'Does Outreacher automatically send messages?', a: 'The primary workflow keeps the user in control. You review and send your outreach.' },
    { q: 'What if a company isn\'t hiring?', a: 'The Proactive opportunity model allows you to pursue meaningful company relationships without a confirmed opening.' },
    { q: 'Can I use campaigns?', a: 'Yes. Campaigns are available for broader or multi-contact outreach. Individual outreach does not require a campaign.' },
    { q: 'Does Outreacher replace applying?', a: 'No. It provides another path to companies through evidence-backed outreach and relationship building.' }
  ]
  return (
    <section className="py-24 px-5 sm:px-8 border-t bg-white" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[800px] mx-auto">
        <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-12 text-center" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Frequently asked questions
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-2xl border bg-[var(--color-background)] open:bg-white transition-colors" style={{ borderColor: 'var(--color-border)' }}>
              <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-[16px] text-[var(--color-primary)] font-['Plus_Jakarta_Sans'] list-none">
                {faq.q}
                <span className="group-open:rotate-180 transition-transform"><Icon d={icons.arrowDown} size={20} /></span>
              </summary>
              <div className="px-6 pb-6 text-[15px] leading-[1.6] text-[var(--color-muted-fg)]">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  const navigate = useNavigate()
  return (
    <section className="py-32 px-5 sm:px-8 border-t bg-[var(--color-background)]" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-[36px] sm:text-[48px] font-bold tracking-tight mb-6" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Start with a company you care about.
        </h2>
        <p className="text-[18px] sm:text-[20px] leading-[1.6] mb-10 text-[var(--color-muted-fg)]">
          Research it. Understand the opportunity. Find the right person. Start the conversation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-4 rounded-xl text-[15px] font-semibold text-white transition-all shadow-sm" style={{ background: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = '#283548'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}>
            Get started
          </button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 rounded-xl text-[15px] font-semibold transition-all" style={{ color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            See how it works
          </button>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const handleScroll = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
  const navigate = useNavigate()
  return (
    <footer className="py-10 px-5 sm:px-8 border-t bg-white" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-[15px]" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <div className="w-6 h-6 rounded flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>
              <Icon d={icons.companies} size={14} />
            </div>
            Outreacher
          </div>
          <p className="text-[13.5px] text-[var(--color-muted-fg)]">
            A thoughtful career intelligence tool.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <button onClick={() => handleScroll('product')} className="text-[13.5px] text-[var(--color-muted-fg)] hover:text-[var(--color-primary)] transition-colors">Product</button>
          <button onClick={() => handleScroll('how-it-works')} className="text-[13.5px] text-[var(--color-muted-fg)] hover:text-[var(--color-primary)] transition-colors">How it works</button>
          <button onClick={() => handleScroll('use-cases')} className="text-[13.5px] text-[var(--color-muted-fg)] hover:text-[var(--color-primary)] transition-colors">Use cases</button>
          <button onClick={() => navigate('/login')} className="text-[13.5px] text-[var(--color-muted-fg)] hover:text-[var(--color-primary)] transition-colors">Sign in</button>
        </div>
      </div>
    </footer>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--color-background)' }}>
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <ProductConceptSection />
        <OpportunityModelSection />
        <PersonSection />
        <OutreachSection />
        <ConversationSection />
        <WorkflowSection />
        <UseCasesSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
