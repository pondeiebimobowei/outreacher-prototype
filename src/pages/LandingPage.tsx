import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon, icons } from '../lib/icons'

function Nav() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 bg-white/90 backdrop-blur-md" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between h-[64px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 font-bold text-[16px] tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>
            <Icon d={icons.companies} size={14} />
          </div>
          Outreacher
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          <a href="#product" className="text-[13.5px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted-fg)'}>Product</a>
          <a href="#how-it-works" className="text-[13.5px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted-fg)'}>How it works</a>
          <a href="#use-cases" className="text-[13.5px] font-medium transition-colors" style={{ color: 'var(--color-muted-fg)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted-fg)'}>Use cases</a>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-5">
          <button onClick={() => navigate('/login')} className="text-[13.5px] font-semibold transition-colors" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Sign in
          </button>
          <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-lg text-[13.5px] font-semibold text-white transition-all shadow-sm" style={{ background: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = '#283548'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}>
            Get started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" style={{ color: 'var(--color-primary)' }} onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
            ) : (
              <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 right-0 bg-white border-b shadow-lg p-5 flex flex-col gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <a href="#product" onClick={() => setMenuOpen(false)} className="text-[15px] font-medium">Product</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-[15px] font-medium">How it works</a>
          <a href="#use-cases" onClick={() => setMenuOpen(false)} className="text-[15px] font-medium">Use cases</a>
          <div className="h-px w-full my-1" style={{ background: 'var(--color-border)' }} />
          <button onClick={() => navigate('/login')} className="text-left text-[15px] font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Sign in</button>
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
        <p className="text-[18px] sm:text-[20px] leading-[1.6] mt-6 max-w-[640px]" style={{ color: 'var(--color-muted-fg)' }}>
          Outreacher helps you turn target companies into real opportunities by researching what matters, identifying the right people, and giving you a credible reason to reach out.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full sm:w-auto">
          <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[14.5px] font-semibold text-white transition-all shadow-sm" style={{ background: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = '#283548'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}>
            Get started
          </button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[14.5px] font-semibold transition-all" style={{ color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-muted)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            See how it works
          </button>
        </div>
      </div>
      
      {/* Product Screenshot / Visualization */}
      <div className="max-w-[1000px] mx-auto mt-20 rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        {/* Mock Header */}
        <div className="h-12 border-b flex items-center px-4 gap-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="h-6 w-48 rounded bg-white border flex items-center justify-center text-[11px] font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-fg)' }}>
              outreacher.app/companies/stripe
            </div>
          </div>
        </div>
        {/* Mock Body */}
        <div className="flex h-[400px]">
          {/* Mock Sidebar */}
          <div className="w-[60px] sm:w-[220px] hidden sm:flex border-r flex-col p-4 gap-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
            <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
            <div className="h-8 bg-white border rounded flex items-center px-2 gap-2" style={{ borderColor: 'var(--color-border)' }}>
              <div className="w-4 h-4 rounded bg-gray-200" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
            <div className="h-8 flex items-center px-2 gap-2">
              <div className="w-4 h-4 rounded bg-gray-200" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
            <div className="h-8 flex items-center px-2 gap-2">
              <div className="w-4 h-4 rounded bg-gray-200" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>
          {/* Mock Content */}
          <div className="flex-1 p-6 sm:p-10 bg-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl" style={{ background: '#635BFF' }}>S</div>
              <div>
                <h3 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Stripe</h3>
                <p className="text-sm text-gray-500">Financial Infrastructure · San Francisco</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opportunity</p>
                <p className="font-semibold mb-1 text-sm">Proactive Conversation</p>
                <p className="text-sm text-gray-500">No open roles, but strong signal in product engineering expansion.</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Contact</p>
                <p className="font-semibold mb-1 text-sm">Alex Chen · Engineering Manager</p>
                <p className="text-sm text-gray-500">Leads the developer tooling team you want to join.</p>
              </div>
            </div>
            <div className="h-10 w-32 bg-[#4F46E5] rounded-lg ml-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Workflow() {
  const steps = [
    { name: 'Company', desc: 'Identify a specific company you admire.' },
    { name: 'Evidence', desc: 'Research team growth, product direction, and hiring signals.' },
    { name: 'Opportunity', desc: 'Classify whether you are applying for an opening or proactively networking.' },
    { name: 'Person', desc: 'Find the person who actually matters to your career.' },
    { name: 'Reason', desc: 'Establish a credible, evidence-backed reason to connect.' },
    { name: 'Outreach', desc: 'Write a context-driven message, not a generic template.' },
    { name: 'Conversation', desc: 'Manage the relationship and follow up.' }
  ]

  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8 border-t" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="max-w-[600px] mb-16">
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            A structured approach to career outreach.
          </h2>
          <p className="text-[17px] leading-[1.6]" style={{ color: 'var(--color-muted-fg)' }}>
            The product is built around a simple, opinionated workflow. You always know where a company stands and what action to take next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="p-6 rounded-2xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
              <div className="text-[12px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--color-muted-fg)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Step {i + 1}</div>
              <h3 className="text-[18px] font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{step.name}</h3>
              <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--color-muted-fg)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CallToAction() {
  const navigate = useNavigate()
  
  return (
    <section className="py-32 px-5 sm:px-8 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
      <div className="max-w-[700px] mx-auto text-center">
        <h2 className="text-[36px] sm:text-[48px] font-bold tracking-tight mb-6" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Stop sending into the void.
        </h2>
        <p className="text-[18px] leading-[1.6] mb-10" style={{ color: 'var(--color-muted-fg)' }}>
          Join the professionals who use Outreacher to build meaningful relationships with target companies instead of blindly submitting applications.
        </p>
        <button onClick={() => navigate('/signup')} className="px-8 py-4 rounded-xl text-[15px] font-semibold text-white transition-all shadow-sm" style={{ background: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = '#283548'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}>
          Start building opportunities today
        </button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-10 px-5 sm:px-8 border-t" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
      <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-[14px]" style={{ color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>
            <Icon d={icons.companies} size={12} />
          </div>
          Outreacher
        </div>
        <p className="text-[13px]" style={{ color: 'var(--color-muted-fg)' }}>
          A thoughtful career intelligence tool.
        </p>
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
        <Workflow />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
