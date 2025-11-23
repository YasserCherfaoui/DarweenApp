import { useStore } from '@tanstack/react-store'
import { useNavigate } from '@tanstack/react-router'
import { portalStore, setSelectedPortal, clearSelectedPortal } from '@/stores/portal-store'
import type { Portal } from '@/types/api'

export const useSelectedPortal = () => {
  const navigate = useNavigate()
  const { selectedPortal, selectedPortalType, selectedPortalId } = useStore(portalStore)

  const selectPortal = (portal: Portal) => {
    setSelectedPortal(portal)
  }

  const clearPortal = () => {
    clearSelectedPortal()
    navigate({ to: '/companies' })
  }

  const requirePortal = () => {
    if (!selectedPortalId) {
      navigate({ to: '/companies' })
      return false
    }
    return true
  }

  // Helper to get company ID (for backward compatibility)
  const getCompanyId = (): number | null => {
    if (selectedPortalType === 'company') {
      return selectedPortalId
    }
    if (selectedPortalType === 'franchise' && selectedPortal?.parent_company_id) {
      return selectedPortal.parent_company_id
    }
    return null
  }

  // Helper to get franchise ID
  const getFranchiseId = (): number | null => {
    if (selectedPortalType === 'franchise') {
      return selectedPortalId
    }
    return null
  }

  return {
    selectedPortal,
    selectedPortalType,
    selectedPortalId,
    selectPortal,
    clearPortal,
    requirePortal,
    getCompanyId,
    getFranchiseId,
  }
}


