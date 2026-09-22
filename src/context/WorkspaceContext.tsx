import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react'
import {
  type WorkspaceRecord,
  createWorkspace as storeCreate,
  getActiveWorkspaceId,
  listWorkspaces,
  renameWorkspace as storeRename,
  switchWorkspace as storeSwitch,
} from '../lib/workspaceStore'

// ─── Context type ─────────────────────────────────────────────────────────────

type WorkspaceInfo = Pick<WorkspaceRecord, 'id' | 'name' | 'createdAt'>

type WorkspaceContextType = {
  workspaces: WorkspaceInfo[]
  activeWorkspaceId: string
  activeWorkspaceName: string
  switchWorkspace: (id: string) => void
  createWorkspace: (name: string) => WorkspaceRecord
  renameWorkspace: (id: string, name: string) => void
  /** Incremented whenever the active workspace changes — callers can key on this */
  workspaceSeq: number
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>(() => listWorkspaces())
  const [activeId, setActiveId] = useState<string>(() => getActiveWorkspaceId())
  const [seq, incSeq] = useReducer((n: number) => n + 1, 0)

  const refresh = useCallback(() => {
    setWorkspaces(listWorkspaces())
    setActiveId(getActiveWorkspaceId())
  }, [])

  const switchWorkspace = useCallback((id: string) => {
    storeSwitch(id)
    setActiveId(id)
    incSeq()
  }, [])

  const createWorkspace = useCallback((name: string): WorkspaceRecord => {
    const ws = storeCreate(name)
    refresh()
    incSeq()
    return ws
  }, [refresh])

  const renameWorkspace = useCallback((id: string, name: string) => {
    storeRename(id, name)
    refresh()
  }, [refresh])

  const activeName = workspaces.find(w => w.id === activeId)?.name ?? 'Workspace'

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspaceId: activeId, activeWorkspaceName: activeName, switchWorkspace, createWorkspace, renameWorkspace, workspaceSeq: seq }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkspace(): WorkspaceContextType {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
