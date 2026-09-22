import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserProfile = {
  firstName: string
  lastName: string
  email: string
  currentRole: string
  targetRole: string
  yearsExperience: string
  skills: string[]
  careerGoals: string
  summary: string
  linkedin: string
  github: string
  portfolio: string
}

type AuthState = {
  authed: boolean
  onboarded: boolean
  user: UserProfile | null
}

type AuthContextType = AuthState & {
  login: (email: string) => void
  signup: (email: string) => void
  logout: () => void
  completeOnboarding: (profile: UserProfile) => void
  updateProfile: (patch: Partial<UserProfile>) => void
}

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem('outreacher_state')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { authed: false, onboarded: false, user: null }
}

function saveState(state: AuthState) {
  localStorage.setItem('outreacher_state', JSON.stringify(state))
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadState)

  function login(email: string) {
    const next: AuthState = { ...state, authed: true, user: state.user ?? { email } as UserProfile }
    setState(next)
    saveState(next)
  }

  function signup(email: string) {
    const next: AuthState = { authed: true, onboarded: false, user: { email } as UserProfile }
    setState(next)
    saveState(next)
  }

  function logout() {
    const next: AuthState = { authed: false, onboarded: false, user: null }
    setState(next)
    saveState(next)
  }

  function completeOnboarding(profile: UserProfile) {
    const next: AuthState = { authed: true, onboarded: true, user: profile }
    setState(next)
    saveState(next)
  }

  function updateProfile(patch: Partial<UserProfile>) {
    const next: AuthState = { ...state, user: { ...state.user!, ...patch } }
    setState(next)
    saveState(next)
  }

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, completeOnboarding, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
