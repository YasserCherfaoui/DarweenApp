import { useStore } from '@tanstack/react-store'
import { useNavigate } from '@tanstack/react-router'
import { companyStore, setSelectedCompany, clearSelectedCompany } from '@/stores/company-store'
import type { Company } from '@/types/api'

export const useSelectedCompany = () => {
  const navigate = useNavigate()
  const { selectedCompany, selectedCompanyId } = useStore(companyStore)

  const selectCompany = (company: Company) => {
    setSelectedCompany(company)
  }

  const clearCompany = () => {
    clearSelectedCompany()
    navigate({ to: '/companies' })
  }

  const requireCompany = () => {
    if (!selectedCompanyId) {
      navigate({ to: '/companies' })
      return false
    }
    return true
  }

  return {
    selectedCompany,
    selectedCompanyId,
    selectCompany,
    clearCompany,
    requireCompany,
  }
}




