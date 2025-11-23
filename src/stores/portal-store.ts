import { Store } from '@tanstack/store'
import type { Portal, PortalType } from '@/types/api'

export interface PortalState {
  selectedPortal: Portal | null
  selectedPortalType: PortalType | null
  selectedPortalId: number | null
}

const getInitialState = (): PortalState => {
  const selectedPortalType = localStorage.getItem('selected_portal_type') as PortalType | null
  const selectedPortalIdStr = localStorage.getItem('selected_portal_id')
  const selectedPortalId = selectedPortalIdStr ? parseInt(selectedPortalIdStr, 10) : null
  const selectedPortalStr = localStorage.getItem('selected_portal')
  const selectedPortal = selectedPortalStr ? JSON.parse(selectedPortalStr) : null

  return {
    selectedPortal,
    selectedPortalType,
    selectedPortalId,
  }
}

export const portalStore = new Store<PortalState>(getInitialState())

export const setSelectedPortal = (portal: Portal) => {
  localStorage.setItem('selected_portal_type', portal.type)
  localStorage.setItem('selected_portal_id', portal.id.toString())
  localStorage.setItem('selected_portal', JSON.stringify(portal))
  portalStore.setState(() => ({
    selectedPortal: portal,
    selectedPortalType: portal.type,
    selectedPortalId: portal.id,
  }))
}

export const clearSelectedPortal = () => {
  localStorage.removeItem('selected_portal_type')
  localStorage.removeItem('selected_portal_id')
  localStorage.removeItem('selected_portal')
  portalStore.setState(() => ({
    selectedPortal: null,
    selectedPortalType: null,
    selectedPortalId: null,
  }))
}

export const updateSelectedPortal = (updates: Partial<Portal>) => {
  const currentState = portalStore.state
  if (!currentState.selectedPortal) return

  const updatedPortal = { ...currentState.selectedPortal, ...updates }
  localStorage.setItem('selected_portal', JSON.stringify(updatedPortal))
  portalStore.setState((state) => ({
    ...state,
    selectedPortal: updatedPortal,
  }))
}


