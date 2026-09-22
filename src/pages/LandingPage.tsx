import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'

// ─── Design tokens (isolated from app theme) ─────────────────────────────────

const C = {
  bg:          '#07070D',
  surface:     '#0C0C1A',
  card:        '#101022',
  cardHover:   '#141430',
  border:      'rgba(255,255,255,0.07)',
  borderMid:   'rgba(255,255,255,0.11)',
  text:        '#EEEEF5',
  muted:       'rgba(238,238,245,0.44)',
  dim:         'rgba(238,238,245,0.22)',
  accent:      '#6366F1',
  accentDim:   'rgba(99,102,241,0.13)',
  accentGlow:  'rgba(99,102,241,0.22)',
  accentText:  '#818CF8',
  green:       '#10B981',
  greenDim:    'rgba(16,185,129,0.13)',
  amber:       '#F59E0B',
  amberDim:    'rgba(245,158,11,0.12)',
  slate:       'rgba(238,238,245,0.07)',
} as const

const F = {
  heading: "'Plus Jakarta Sans', sans-serif",
  body:    "'Inter', sans-serif",
} as const

// ─── Animation utilities ─────────────────────────────────────────────────────

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return reduced
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function revealStyle(
  visible: boolean,
  delay = 0,
  reduced = false,
  distance = 28
): React.CSSProperties {
  if (reduced) return {}
  return {
    opacity:    visible ? 1 : 0,
    transform:  visible ? 'none' : `translateY(${distance}px)`,
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
  }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Badge({ children, color = C.accentText, bg = C.accentDim }: {
  children: React.ReactNode; color?: string; bg?: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: bg, color, fontFamily: F.heading, letterSpacing: '0.02em' }}
    >
      {children}
    </span>
  )
}

function Dot({ color = C.accent, pulse = false }: { color?: string; pulse?: boolean }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block"
      style={{
        background: color,
        animation: pulse ? 'lp-dot-pulse 2s ease-in-out infinite' : undefined,
      }}
    />
  )
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function Nav() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8"
        style={{
          height: 58,
          background: scrolled ? 'rgba(7,7,13,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : undefined,
          borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
        }}
        aria-label="Site navigation"
      >
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 rounded-md"
          style={{ '--tw-ring-color': C.accent } as React.CSSProperties}
          aria-label="Outreacher – scroll to top"
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: C.accent }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </div>
          <span className="font-bold text-[14.5px] tracking-tight" style={{ color: C.text, fontFamily: F.heading }}>
            Outreacher
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1" role="list">
          {[['Product', 'product'], ['How it works', 'how-it-works'], ['Workflow', 'workflow']].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
              style={{ color: C.muted, fontFamily: F.body }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="hidden sm:block px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={{ color: C.muted, fontFamily: F.body }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all"
            style={{ background: C.accent, color: '#fff', fontFamily: F.heading }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
          >
            Start building
          </button>
          {/* Hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg"
            style={{ color: C.muted }}
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen
                ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 sm:hidden"
        style={{
          background: 'rgba(7,7,13,0.96)',
          backdropFilter: 'blur(16px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
          paddingTop: 72,
        }}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-1 px-5">
          {[['Product', 'product'], ['How it works', 'how-it-works'], ['Workflow', 'workflow']].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-left px-4 py-4 rounded-xl text-[16px] font-medium"
              style={{ color: C.text, fontFamily: F.body }}
            >
              {label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12 }} />
          <button
            onClick={() => { setMenuOpen(false); navigate('/login') }}
            className="text-left px-4 py-4 rounded-xl text-[16px] font-medium"
            style={{ color: C.muted, fontFamily: F.body }}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMenuOpen(false); navigate('/signup') }}
            className="px-4 py-4 rounded-xl text-[16px] font-semibold text-left"
            style={{ background: C.accent, color: '#fff', fontFamily: F.heading }}
          >
            Start building opportunities
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Hero product visualization ───────────────────────────────────────────────

function HeroViz({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  const STAGES = ['Company', 'Evidence', 'Opportunity', 'Person', 'Outreach'] as const
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setStage(s => (s + 1) % 5), 2800)
    return () => clearInterval(t)
  }, [reduced])

  const CONTENT = [
    {
      label: 'Kuda',
      sub: 'Fintech · Lagos, Nigeria',
      badge: { text: 'Research complete', color: C.green, bg: C.greenDim },
      items: ['Series B · ~600 employees', 'Mobile banking for Africa', 'Engineering team expanding'],
    },
    {
      label: 'Recent signals',
      sub: 'What we found',
      badge: { text: '3 signals', color: C.accentText, bg: C.accentDim },
      items: ['New product team announced', 'Engineering roles posted', 'CTO blog: platform investment'],
    },
    {
      label: 'PROACTIVE',
      sub: 'Product engineering',
      badge: { text: 'Opportunity identified', color: C.amber, bg: C.amberDim },
      items: ['No open role — but strong signal', 'Your background aligns', 'Right time to start a conversation'],
    },
    {
      label: 'Amara Osei',
      sub: 'Engineering Manager · Platform',
      badge: { text: 'Why this person', color: C.accentText, bg: C.accentDim },
      items: ['Leads the team closest to your work', 'Active on engineering topics', 'Conversation angle: platform expansion'],
    },
    {
      label: 'Outreach draft',
      sub: 'Context-driven · Review before send',
      badge: { text: 'AI-drafted · you approve', color: C.muted.replace('0.44', '0.7'), bg: C.slate },
      items: ['Hi Amara, I\'ve been following…', 'Referenced: platform engineering work', 'Asked: team\'s direction on X'],
    },
  ]

  const content = CONTENT[stage]

  return (
    <div
      data-lp-anim
      style={{
        ...revealStyle(visible, 500, reduced, 40),
        width: '100%',
        maxWidth: 360,
      }}
    >
      {/* Stage tabs */}
      <div className="flex items-center gap-px mb-3 overflow-x-auto" role="tablist" aria-label="Workflow stages">
        {STAGES.map((s, i) => (
          <button
            key={s}
            role="tab"
            aria-selected={stage === i}
            onClick={() => setStage(i)}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all"
            style={{
              background: stage === i ? C.accentDim : 'transparent',
              color: stage === i ? C.accentText : C.dim,
              border: stage === i ? `1px solid rgba(99,102,241,0.25)` : '1px solid transparent',
              fontFamily: F.heading,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: C.card,
          border: `1px solid ${C.borderMid}`,
          boxShadow: `0 0 60px -12px ${C.accentGlow}, 0 24px 48px -12px rgba(0,0,0,0.5)`,
        }}
        aria-live="polite"
        aria-label={`${STAGES[stage]} stage visualization`}
      >
        {/* Card header */}
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-bold text-[15px] mb-0.5" style={{ color: C.text, fontFamily: F.heading }}>
                {content.label}
              </div>
              <div className="text-[12px]" style={{ color: C.muted, fontFamily: F.body }}>
                {content.sub}
              </div>
            </div>
            <Badge color={content.badge.color} bg={content.badge.bg}>
              <Dot color={content.badge.color} pulse />
              {content.badge.text}
            </Badge>
          </div>
        </div>

        {/* Card body */}
        <div className="px-5 py-4 flex flex-col gap-2.5">
          {content.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5"
              style={{
                opacity: 0,
                animation: `lp-enter 0.4s ease ${i * 80}ms forwards`,
              }}
              data-lp-anim
            >
              <svg
                width="14" height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="6" fill={C.accentDim} stroke={C.border} strokeWidth="1" />
                <path
                  d="M5.5 8l2 2 3-3"
                  stroke={C.accentText}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 20,
                    strokeDashoffset: 0,
                    animation: 'lp-check-draw 0.35s ease forwards',
                  }}
                />
              </svg>
              <span className="text-[13px] leading-snug" style={{ color: C.muted, fontFamily: F.body }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Card footer */}
        <div className="px-5 pb-4">
          <div
            className="w-full py-2.5 rounded-xl text-[12.5px] font-semibold text-center transition-all cursor-pointer"
            style={{ background: C.accent, color: '#fff', fontFamily: F.heading }}
            aria-label={stage === 4 ? 'Send outreach' : 'Continue to next stage'}
          >
            {stage === 4 ? 'Review and send →' : 'Continue →'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const enter = (delay: number): React.CSSProperties => reduced ? {} : {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(20px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  }

  return (
    <section
      id="product"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{ background: C.bg }}
      aria-label="Hero"
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.09) 0%, transparent 70%)`,
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-14 py-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16 lg:gap-20">

          {/* Left: copy */}
          <div className="flex-1 max-w-[560px]">
            <div style={enter(0)}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-[11.5px] font-semibold"
                style={{ background: C.accentDim, color: C.accentText, border: `1px solid rgba(99,102,241,0.2)`, fontFamily: F.heading }}
              >
                <Dot color={C.accent} pulse />
                Career relationship intelligence
              </div>
            </div>

            <h1
              className="font-bold leading-[1.05] tracking-[-0.025em] mb-6"
              style={{ color: C.text, fontFamily: F.heading, fontSize: 'clamp(38px, 6vw, 66px)' }}
            >
              <span style={enter(80)} className="block">Turn target companies</span>
              <span style={enter(160)} className="block" aria-hidden="true">into real</span>
              <span style={enter(240)} className="block">
                into real{' '}
                <span style={{ color: C.accent }}>opportunities.</span>
              </span>
            </h1>

            {/* Visually hide the duplicate "into real" */}
            <style>{`.hero-h1-mid { display: none; }`}</style>

            <p
              className="text-[17px] leading-[1.7] mb-10 max-w-[460px]"
              style={{ ...enter(340), color: C.muted, fontFamily: F.body }}
            >
              Research the company. Find the right person.
              Understand why they matter. Reach out with context.
            </p>

            <div className="flex flex-wrap items-center gap-3" style={enter(440)}>
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-[14px] font-semibold transition-all"
                style={{ background: C.accent, color: '#fff', fontFamily: F.heading }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.86'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px -6px ${C.accentGlow}` }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                Start building opportunities
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all"
                style={{ color: C.muted, border: `1px solid ${C.border}`, fontFamily: F.body, background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.color = C.text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
              >
                See how it works
              </button>
            </div>
          </div>

          {/* Right: visualization */}
          <div className="flex-shrink-0 w-full max-w-[370px] lg:max-w-[360px]">
            <HeroViz visible={visible} reduced={reduced} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Problem section ──────────────────────────────────────────────────────────

function Problem() {
  const { ref, visible } = useReveal()
  const reduced = useReducedMotion()

  const OLD_PATH = ['Find a job posting', 'Submit application', 'Wait']
  const NEW_PATH = ['Choose a company', 'Understand what\'s happening', 'Find the right person', 'Reach out with context']

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="px-5 sm:px-8 lg:px-14 py-24 sm:py-32"
      style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
      aria-labelledby="problem-heading"
    >
      <div className="max-w-5xl mx-auto">
        <div style={revealStyle(visible, 0, reduced)}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: C.accentText, fontFamily: F.heading }}>
            The problem
          </p>
          <h2
            id="problem-heading"
            className="font-bold leading-[1.1] tracking-tight mb-6"
            style={{ color: C.text, fontFamily: F.heading, fontSize: 'clamp(28px, 4.5vw, 46px)' }}
          >
            Applying is easy.
            <br />
            <span style={{ color: C.muted }}>Knowing who to talk to is harder.</span>
          </h2>
          <p className="text-[16px] sm:text-[17px] mb-16 max-w-[520px]" style={{ color: C.muted, fontFamily: F.body, lineHeight: 1.7 }}>
            Most career-search tools optimize for volume. Outreacher optimizes for context.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
          {/* Old way */}
          <div
            style={{
              ...revealStyle(visible, 120, reduced),
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: '28px 28px',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-6" style={{ color: C.dim, fontFamily: F.heading }}>
              The usual path
            </p>
            <div className="flex flex-col gap-0">
              {OLD_PATH.map((step, i) => (
                <div key={step} className="relative">
                  <div className="flex items-center gap-3 py-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', color: C.dim, border: `1px solid ${C.border}`, fontFamily: F.heading }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-[14px] font-medium" style={{ color: C.dim, fontFamily: F.body }}>
                      {step}
                    </span>
                  </div>
                  {i < OLD_PATH.length - 1 && (
                    <div className="absolute left-[13px] top-[36px] w-px h-4" style={{ background: C.border }} aria-hidden="true" />
                  )}
                </div>
              ))}
              <div
                className="mt-4 px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold text-center"
                style={{ background: 'rgba(255,255,255,0.04)', color: C.dim, fontFamily: F.heading, border: `1px solid ${C.border}` }}
              >
                Hope for a response
              </div>
            </div>
          </div>

          {/* Outreacher way */}
          <div
            style={{
              ...revealStyle(visible, 240, reduced),
              background: C.card,
              border: `1px solid rgba(99,102,241,0.25)`,
              borderRadius: 16,
              padding: '28px 28px',
              boxShadow: `0 0 40px -16px ${C.accentGlow}`,
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-6" style={{ color: C.accentText, fontFamily: F.heading }}>
              The Outreacher approach
            </p>
            <div className="flex flex-col gap-0">
              {NEW_PATH.map((step, i) => (
                <div key={step} className="relative">
                  <div className="flex items-center gap-3 py-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: C.accentDim, color: C.accentText, border: `1px solid rgba(99,102,241,0.25)`, fontFamily: F.heading }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-[14px] font-medium" style={{ color: C.text, fontFamily: F.body }}>
                      {step}
                    </span>
                  </div>
                  {i < NEW_PATH.length - 1 && (
                    <div className="absolute left-[13px] top-[36px] w-px h-4" style={{ background: 'rgba(99,102,241,0.2)' }} aria-hidden="true" />
                  )}
                </div>
              ))}
              <div
                className="mt-4 px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold text-center"
                style={{ background: C.accentDim, color: C.accentText, fontFamily: F.heading, border: `1px solid rgba(99,102,241,0.25)` }}
              >
                Start a real conversation
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pipeline model ────────────────────────────────────────────────────────────

const PIPELINE = [
  {
    key: 'company',
    label: 'Company',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <rect x="3" y="9" width="18" height="12" rx="2"/><path d="M8 9V5l8 0v4"/>
      </svg>
    ),
    description: 'Start with a company you want to be part of, not a job listing.',
  },
  {
    key: 'evidence',
    label: 'Evidence',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="7"/>
      </svg>
    ),
    description: 'Research what\'s actually happening — team growth, product direction, hiring signals.',
  },
  {
    key: 'opportunity',
    label: 'Opportunity',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    description: 'Classify what kind of opportunity exists — CONFIRMED opening or PROACTIVE timing.',
  },
  {
    key: 'person',
    label: 'Person',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    description: 'Find the person who actually matters — and understand why they\'re the right one to contact.',
  },
  {
    key: 'conversation',
    label: 'Conversation',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    description: 'Send outreach grounded in context. Begin a real professional relationship.',
  },
]

function Pipeline() {
  const { ref, visible } = useReveal(0.08)
  const reduced = useReducedMotion()

  return (
    <section
      className="px-5 sm:px-8 lg:px-14 py-24 sm:py-32"
      style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}
      aria-labelledby="pipeline-heading"
    >
      <div className="max-w-5xl mx-auto">
        <div ref={ref}>
          <div style={revealStyle(visible, 0, reduced)}>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: C.accentText, fontFamily: F.heading }}>
              The model
            </p>
            <h2
              id="pipeline-heading"
              className="font-bold leading-[1.1] tracking-tight mb-4"
              style={{ color: C.text, fontFamily: F.heading, fontSize: 'clamp(28px, 4.5vw, 46px)' }}
            >
              A system, not a feature list.
            </h2>
            <p className="text-[16px] sm:text-[17px] mb-16 max-w-[520px]" style={{ color: C.muted, fontFamily: F.body, lineHeight: 1.7 }}>
              Every stage builds on the last. You always know where you are and what comes next.
            </p>
          </div>

          {/* Pipeline stages */}
          <div className="flex flex-col sm:flex-row gap-0 sm:gap-0 items-stretch" role="list">
            {PIPELINE.map((stage, i) => (
              <div key={stage.key} className="flex flex-col sm:flex-row items-stretch flex-1 gap-0" role="listitem">
                <div
                  style={{
                    ...revealStyle(visible, 100 + i * 100, reduced),
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: '22px 20px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: C.accentDim, color: C.accentText }}
                  >
                    {stage.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold mb-1.5" style={{ color: C.text, fontFamily: F.heading }}>
                      {stage.label}
                    </div>
                    <div className="text-[13px] leading-[1.6]" style={{ color: C.muted, fontFamily: F.body }}>
                      {stage.description}
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {i < PIPELINE.length - 1 && (
                  <div
                    className="flex items-center justify-center sm:w-8 sm:h-auto h-6"
                    aria-hidden="true"
                    style={{ color: C.dim, flexShrink: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hidden sm:block">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="sm:hidden">
                      <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Opportunity reasoning ────────────────────────────────────────────────────

function OpportunitySection() {
  const { ref, visible } = useReveal()
  const reduced = useReducedMotion()

  const STATES = [
    {
      key: 'CONFIRMED',
      label: 'CONFIRMED',
      color: C.green,
      bg: C.greenDim,
      headline: 'A relevant opening exists.',
      body: 'Research found a specific role that matches your target. The timing is clear — this is the moment to act.',
    },
    {
      key: 'PROACTIVE',
      label: 'PROACTIVE',
      color: C.amber,
      bg: C.amberDim,
      headline: 'No opening — but strong signal.',
      body: 'There\'s no job listed, but the evidence justifies starting a conversation. Don\'t wait for a listing that may never appear.',
    },
    {
      key: 'UNCLASSIFIED',
      label: 'UNCLASSIFIED',
      color: C.dim,
      bg: C.slate,
      headline: 'Research still needed.',
      body: 'Not enough evidence yet to classify this company. Keep researching before reaching out.',
    },
  ]

  return (
    <section
      className="px-5 sm:px-8 lg:px-14 py-24 sm:py-32"
      style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
      aria-labelledby="opp-heading"
    >
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div style={revealStyle(visible, 0, reduced)}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: C.accentText, fontFamily: F.heading }}>
            Opportunity reasoning
          </p>
          <h2
            id="opp-heading"
            className="font-bold leading-[1.1] tracking-tight mb-4"
            style={{ color: C.text, fontFamily: F.heading, fontSize: 'clamp(28px, 4.5vw, 46px)' }}
          >
            Not every opportunity
            <br />starts with a job opening.
          </h2>
          <p className="text-[16px] sm:text-[17px] mb-16 max-w-[520px]" style={{ color: C.muted, fontFamily: F.body, lineHeight: 1.7 }}>
            Outreacher helps you understand what kind of opportunity you actually have — before you send anything.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATES.map((state, i) => (
            <div
              key={state.key}
              style={{
                ...revealStyle(visible, 120 + i * 100, reduced),
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '24px',
              }}
            >
              <Badge color={state.color} bg={state.bg}>
                <Dot color={state.color} />
                {state.label}
              </Badge>
              <h3 className="font-bold text-[15px] mt-4 mb-2" style={{ color: C.text, fontFamily: F.heading }}>
                {state.headline}
              </h3>
              <p className="text-[13.5px] leading-[1.65]" style={{ color: C.muted, fontFamily: F.body }}>
                {state.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── People section ───────────────────────────────────────────────────────────

function PeopleSection() {
  const { ref, visible } = useReveal()
  const reduced = useReducedMotion()

  return (
    <section
      className="px-5 sm:px-8 lg:px-14 py-24 sm:py-32"
      style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}
      aria-labelledby="people-heading"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center" ref={ref}>
          {/* Copy */}
          <div style={revealStyle(visible, 0, reduced)}>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: C.accentText, fontFamily: F.heading }}>
              People intelligence
            </p>
            <h2
              id="people-heading"
              className="font-bold leading-[1.1] tracking-tight mb-5"
              style={{ color: C.text, fontFamily: F.heading, fontSize: 'clamp(26px, 4vw, 42px)' }}
            >
              Find the person
              <br />who makes sense.
            </h2>
            <p className="text-[15.5px] leading-[1.7] mb-6" style={{ color: C.muted, fontFamily: F.body }}>
              Outreacher doesn't just surface a contact. It explains why that person is the right one to reach — and gives you a starting point for the conversation.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                'Role and team closest to your target area',
                'Why this person — not just their title',
                'A conversation angle grounded in evidence',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    <circle cx="8" cy="8" r="6" fill={C.accentDim} />
                    <path d="M5.5 8l2 2 3-3" stroke={C.accentText} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[14px]" style={{ color: C.muted, fontFamily: F.body }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Person card */}
          <div style={revealStyle(visible, 180, reduced, 32)}>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.borderMid}`, boxShadow: `0 0 50px -16px ${C.accentGlow}` }}
              aria-label="Example contact card"
            >
              {/* Avatar row */}
              <div className="flex items-center gap-4 px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[14px] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff', fontFamily: F.heading }}
                  aria-hidden="true"
                >
                  AO
                </div>
                <div>
                  <div className="font-bold text-[15px]" style={{ color: C.text, fontFamily: F.heading }}>Amara Osei</div>
                  <div className="text-[12.5px] mt-0.5" style={{ color: C.muted, fontFamily: F.body }}>Engineering Manager · Platform</div>
                </div>
                <Badge color={C.green} bg={C.greenDim}>
                  <Dot color={C.green} />
                  Selected
                </Badge>
              </div>

              {/* Why this person */}
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2.5" style={{ color: C.dim, fontFamily: F.heading }}>
                  Why this person
                </div>
                <p className="text-[13.5px] leading-[1.65]" style={{ color: C.muted, fontFamily: F.body }}>
                  Leads the engineering team closest to the area you're targeting. Has written publicly about platform engineering challenges.
                </p>
              </div>

              {/* Conversation angle */}
              <div className="px-6 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2.5" style={{ color: C.dim, fontFamily: F.heading }}>
                  Conversation angle
                </div>
                <p className="text-[13.5px] leading-[1.65]" style={{ color: C.muted, fontFamily: F.body }}>
                  Reference the team's recent product engineering expansion and ask about their direction on developer tooling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Outreach section ─────────────────────────────────────────────────────────

function OutreachSection() {
  const { ref, visible } = useReveal()
  const reduced = useReducedMotion()
  const [showDraft, setShowDraft] = useState(false)

  useEffect(() => {
    if (visible && !reduced) {
      const t = setTimeout(() => setShowDraft(true), 1000)
      return () => clearTimeout(t)
    }
    if (visible && reduced) setShowDraft(true)
  }, [visible, reduced])

  const CONTEXT = [
    { label: 'Why this company', text: 'Product engineering experience', ok: true },
    { label: 'Why this person', text: 'Leads the relevant team', ok: true },
    { label: 'Why now', text: 'Recent team expansion signal', ok: true },
    { label: 'Angle', text: 'Ask about team direction on tooling', ok: true },
  ]

  return (
    <section
      className="px-5 sm:px-8 lg:px-14 py-24 sm:py-32"
      style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
      aria-labelledby="outreach-heading"
    >
      <div className="max-w-5xl mx-auto">
        <div ref={ref}>
          <div style={revealStyle(visible, 0, reduced)}>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: C.accentText, fontFamily: F.heading }}>
              Outreach
            </p>
            <h2
              id="outreach-heading"
              className="font-bold leading-[1.1] tracking-tight mb-4"
              style={{ color: C.text, fontFamily: F.heading, fontSize: 'clamp(26px, 4vw, 42px)' }}
            >
              Write less generic outreach.
            </h2>
            <p className="text-[16px] mb-14 max-w-[500px]" style={{ color: C.muted, fontFamily: F.body, lineHeight: 1.7 }}>
              Context comes first. The draft follows from what you already know — not from a blank template.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Context checklist */}
            <div
              style={{
                ...revealStyle(visible, 120, reduced),
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '24px',
              }}
            >
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: C.dim, fontFamily: F.heading }}>
                Before the draft
              </div>
              <div className="flex flex-col gap-3">
                {CONTEXT.map((item, i) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'none' : 'translateX(-12px)',
                      transition: reduced ? 'none' : `opacity 0.5s ease ${300 + i * 100}ms, transform 0.5s ease ${300 + i * 100}ms`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: C.greenDim }}
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11.5px] font-semibold" style={{ color: C.accentText, fontFamily: F.heading }}>{item.label}  </span>
                      <span className="text-[13px]" style={{ color: C.muted, fontFamily: F.body }}>{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div
                className="flex justify-center my-5"
                aria-hidden="true"
                style={{ opacity: showDraft ? 1 : 0, transition: reduced ? 'none' : 'opacity 0.4s ease' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accentText} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </div>

              <div
                style={{
                  opacity: showDraft ? 1 : 0,
                  transform: showDraft ? 'none' : 'translateY(10px)',
                  transition: reduced ? 'none' : 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
                }}
              >
                <div className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: C.dim, fontFamily: F.heading }}>
                  Draft
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ background: C.accentDim, border: `1px solid rgba(99,102,241,0.18)` }}
                >
                  <p className="text-[13px] leading-[1.7]" style={{ color: C.muted, fontFamily: F.body }}>
                    Hi Amara, I've been following Kuda's work on developer tooling — particularly your recent platform engineering blog post. I've spent the last few years solving similar problems at scale...
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Dot color={C.amber} />
                    <span className="text-[11.5px]" style={{ color: C.amber, fontFamily: F.heading }}>AI-drafted · review before sending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Human control panel */}
            <div
              style={{
                ...revealStyle(visible, 240, reduced),
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-6" style={{ color: C.dim, fontFamily: F.heading }}>
                You stay in control
              </div>

              {[
                { label: 'AI researches the company', done: true, accent: false },
                { label: 'AI identifies the opportunity', done: true, accent: false },
                { label: 'AI finds the relevant person', done: true, accent: false },
                { label: 'AI generates a draft', done: true, accent: false },
                { label: 'YOU review and edit', done: false, accent: true, highlight: true },
                { label: 'You send when ready', done: false, accent: false },
              ].map((step, i) => (
                <div key={step.label} className="relative">
                  <div
                    className="flex items-center gap-3 py-2.5"
                    style={step.highlight ? {
                      background: C.accentDim,
                      borderRadius: 10,
                      padding: '10px 12px',
                      margin: '2px -12px',
                      border: `1px solid rgba(99,102,241,0.2)`,
                    } : {}}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: step.highlight ? C.accentDim : step.done ? C.greenDim : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${step.highlight ? 'rgba(99,102,241,0.3)' : step.done ? 'rgba(16,185,129,0.25)' : C.border}`,
                      }}
                    >
                      {step.done ? (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: step.highlight ? C.accent : C.dim }} aria-hidden="true" />
                      )}
                    </div>
                    <span
                      className="text-[13.5px] font-medium"
                      style={{
                        color: step.highlight ? C.text : step.done ? C.muted : C.dim,
                        fontFamily: step.highlight ? F.heading : F.body,
                        fontWeight: step.highlight ? 700 : undefined,
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < 5 && (
                    <div className="absolute left-[11px] top-[42px] w-px h-2.5" style={{ background: C.border }} aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Interactive workflow ─────────────────────────────────────────────────────

const WORKFLOW_TABS = ['Company', 'Evidence', 'Person', 'Outreach'] as const
type WorkflowTab = (typeof WORKFLOW_TABS)[number]

const WORKFLOW_CONTENT: Record<WorkflowTab, {
  headline: string
  sub: string
  rows: { label: string; value: string }[]
  badge?: { text: string; color: string; bg: string }
}> = {
  Company: {
    headline: 'Kuda',
    sub: 'Fintech · Lagos, Nigeria',
    badge: { text: 'Research complete', color: C.green, bg: C.greenDim },
    rows: [
      { label: 'Sector', value: 'Fintech · mobile banking' },
      { label: 'Scale', value: 'Series B · ~600 employees' },
      { label: 'Focus', value: 'Banking for Africa' },
      { label: 'Added', value: '2 weeks ago' },
    ],
  },
  Evidence: {
    headline: 'Research signals',
    sub: '3 relevant findings',
    badge: { text: 'PROACTIVE', color: C.amber, bg: C.amberDim },
    rows: [
      { label: 'Signal', value: 'New product team expansion announced' },
      { label: 'Signal', value: 'Engineering blog: platform investment' },
      { label: 'Signal', value: 'Recent engineering role postings' },
      { label: 'Relevance', value: 'Aligns with your product engineering background' },
    ],
  },
  Person: {
    headline: 'Amara Osei',
    sub: 'Engineering Manager · Platform Team',
    badge: { text: 'Selected', color: C.green, bg: C.greenDim },
    rows: [
      { label: 'Role', value: 'Engineering Manager' },
      { label: 'Team', value: 'Platform engineering' },
      { label: 'Why them', value: 'Leads the team closest to your target area' },
      { label: 'Angle', value: 'Reference platform expansion + tooling direction' },
    ],
  },
  Outreach: {
    headline: 'Draft ready',
    sub: 'Review before sending',
    badge: { text: 'AI-drafted', color: C.amber, bg: C.amberDim },
    rows: [
      { label: 'Subject', value: 'Platform engineering at Kuda' },
      { label: 'Opening', value: 'Referenced your recent blog post on…' },
      { label: 'Body', value: 'Described relevant experience at scale…' },
      { label: 'Close', value: 'Asked about team direction on tooling' },
    ],
  },
}

function InteractiveWorkflow() {
  const { ref, visible } = useReveal()
  const reduced = useReducedMotion()
  const [active, setActive] = useState<WorkflowTab>('Company')
  const content = WORKFLOW_CONTENT[active]

  return (
    <section
      id="workflow"
      className="px-5 sm:px-8 lg:px-14 py-24 sm:py-32"
      style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}
      aria-labelledby="workflow-heading"
    >
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div style={revealStyle(visible, 0, reduced)}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: C.accentText, fontFamily: F.heading }}>
            See it in action
          </p>
          <h2
            id="workflow-heading"
            className="font-bold leading-[1.1] tracking-tight mb-4"
            style={{ color: C.text, fontFamily: F.heading, fontSize: 'clamp(26px, 4vw, 42px)' }}
          >
            Every step in one workspace.
          </h2>
          <p className="text-[16px] mb-12 max-w-[500px]" style={{ color: C.muted, fontFamily: F.body, lineHeight: 1.7 }}>
            Explore how Outreacher moves from company to conversation.
          </p>
        </div>

        <div style={revealStyle(visible, 120, reduced)}>
          {/* Tab bar */}
          <div
            className="flex items-center gap-1 mb-6 overflow-x-auto p-1 rounded-xl"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
            role="tablist"
            aria-label="Workflow stages"
          >
            {WORKFLOW_TABS.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={active === tab}
                aria-controls={`workflow-panel-${tab}`}
                id={`workflow-tab-${tab}`}
                onClick={() => setActive(tab)}
                className="flex-1 py-2.5 px-4 rounded-lg text-[13px] font-semibold transition-all flex-shrink-0"
                style={{
                  background: active === tab ? C.card : 'transparent',
                  color: active === tab ? C.text : C.muted,
                  border: active === tab ? `1px solid ${C.border}` : '1px solid transparent',
                  fontFamily: F.heading,
                  boxShadow: active === tab ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div
            id={`workflow-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`workflow-tab-${active}`}
            className="rounded-2xl overflow-hidden"
            style={{
              background: C.card,
              border: `1px solid ${C.borderMid}`,
              boxShadow: `0 0 50px -16px ${C.accentGlow}`,
            }}
            key={active}
          >
            {/* Panel header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div className="font-bold text-[16px]" style={{ color: C.text, fontFamily: F.heading }}>
                  {content.headline}
                </div>
                <div className="text-[12.5px] mt-0.5" style={{ color: C.muted, fontFamily: F.body }}>
                  {content.sub}
                </div>
              </div>
              {content.badge && (
                <Badge color={content.badge.color} bg={content.badge.bg}>
                  <Dot color={content.badge.color} />
                  {content.badge.text}
                </Badge>
              )}
            </div>

            {/* Panel rows */}
            <div className="divide-y" style={{ borderColor: C.border }}>
              {content.rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 px-6 py-3.5"
                  style={{
                    opacity: 0,
                    animation: `lp-enter 0.35s ease ${i * 60}ms forwards`,
                  }}
                  data-lp-anim
                >
                  <div className="text-[11.5px] font-semibold flex-shrink-0 pt-0.5" style={{ color: C.dim, fontFamily: F.heading, minWidth: 80 }}>
                    {row.label}
                  </div>
                  <div className="text-[13.5px]" style={{ color: C.muted, fontFamily: F.body }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Panel action */}
            {active === 'Outreach' && (
              <div className="px-6 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
                <button
                  className="w-full py-3 rounded-xl text-[13.5px] font-semibold transition-all"
                  style={{ background: C.accent, color: '#fff', fontFamily: F.heading }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Review draft and send
                </button>
              </div>
            )}
            {active !== 'Outreach' && (
              <div className="px-6 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
                <button
                  onClick={() => {
                    const idx = WORKFLOW_TABS.indexOf(active)
                    setActive(WORKFLOW_TABS[Math.min(idx + 1, WORKFLOW_TABS.length - 1)])
                  }}
                  className="flex items-center gap-2 text-[13px] font-semibold transition-colors"
                  style={{ color: C.accentText, fontFamily: F.heading }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Next: {WORKFLOW_TABS[WORKFLOW_TABS.indexOf(active) + 1]}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  const { ref, visible } = useReveal()
  const reduced = useReducedMotion()
  const navigate = useNavigate()

  return (
    <section
      className="px-5 sm:px-8 lg:px-14 py-28 sm:py-36"
      style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
      aria-labelledby="cta-heading"
    >
      <div className="max-w-5xl mx-auto text-center" ref={ref}>
        <div style={revealStyle(visible, 0, reduced)}>
          <h2
            id="cta-heading"
            className="font-bold leading-[1.08] tracking-[-0.02em] mb-6"
            style={{ color: C.text, fontFamily: F.heading, fontSize: 'clamp(30px, 5vw, 56px)' }}
          >
            Your next opportunity might
            <br />not be another application.
          </h2>
          <p className="text-[17px] mb-10 mx-auto max-w-[520px]" style={{ color: C.muted, fontFamily: F.body, lineHeight: 1.7 }}>
            Outreacher gives you the structure to pursue companies with intention — research first, context always, no spray and pray.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[15px] font-semibold transition-all w-full sm:w-auto justify-center"
              style={{ background: C.accent, color: '#fff', fontFamily: F.heading }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.86'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 28px -6px ${C.accentGlow}` }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Start building opportunities
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 rounded-xl text-[15px] font-medium transition-all w-full sm:w-auto"
              style={{ color: C.muted, border: `1px solid ${C.border}`, fontFamily: F.body, background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
            >
              Sign in to your workspace
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const navigate = useNavigate()
  return (
    <footer
      className="px-5 sm:px-8 lg:px-14 py-10"
      style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: C.accent }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
            </svg>
          </div>
          <span className="font-bold text-[14px]" style={{ color: C.text, fontFamily: F.heading }}>Outreacher</span>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 sm:gap-6">
          {[
            ['Product', 'product'],
            ['How it works', 'how-it-works'],
            ['Sign in', null, '/login'],
            ['Start building', null, '/signup'],
          ].map(([label, id, route]) => (
            <button
              key={label as string}
              onClick={() => route ? navigate(route as string) : document.getElementById(id as string)?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[13px] transition-colors"
              style={{ color: C.muted, fontFamily: F.body }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              {label as string}
            </button>
          ))}
        </nav>

        <p className="text-[12px]" style={{ color: C.dim, fontFamily: F.body }}>
          Career intelligence for people who move with intention.
        </p>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', overflowX: 'hidden' }}>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Pipeline />
        <OpportunitySection />
        <PeopleSection />
        <OutreachSection />
        <InteractiveWorkflow />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
