import { Store } from '@tanstack/store'
import type { Company, UserRole } from '@/types/api'

export interface CompanyState {
  selectedCompany: Company | null
  selectedCompanyId: number | null
  userRole: UserRole | null
}

const getInitialState = (): CompanyState => {
  const selectedCompanyId = localStorage.getItem('selected_company_id')
  const selectedCompanyStr = localStorage.getItem('selected_company')
  const selectedCompany = selectedCompanyStr ? JSON.parse(selectedCompanyStr) : null
  const userRole = localStorage.getItem('user_role') as UserRole | null

  return {
    selectedCompany,
    selectedCompanyId: selectedCompanyId ? parseInt(selectedCompanyId, 10) : null,
    userRole: userRole || selectedCompany?.user_role || null,
  }
}

export const companyStore = new Store<CompanyState>(getInitialState())

export const setSelectedCompany = (company: Company) => {
  localStorage.setItem('selected_company_id', company.id.toString())
  localStorage.setItem('selected_company', JSON.stringify(company))
  if (company.user_role) {
    localStorage.setItem('user_role', company.user_role)
  }
  companyStore.setState(() => ({
    selectedCompany: company,
    selectedCompanyId: company.id,
    userRole: company.user_role || null,
  }))
}

export const clearSelectedCompany = () => {
  localStorage.removeItem('selected_company_id')
  localStorage.removeItem('selected_company')
  localStorage.removeItem('user_role')
  companyStore.setState(() => ({
    selectedCompany: null,
    selectedCompanyId: null,
    userRole: null,
  }))
}

export const updateSelectedCompany = (updates: Partial<Company>) => {
  const currentState = companyStore.state
  if (!currentState.selectedCompany) return

  const updatedCompany = { ...currentState.selectedCompany, ...updates }
  localStorage.setItem('selected_company', JSON.stringify(updatedCompany))
  if (updatedCompany.user_role) {
    localStorage.setItem('user_role', updatedCompany.user_role)
  }
  companyStore.setState((state) => ({
    ...state,
    selectedCompany: updatedCompany,
    userRole: updatedCompany.user_role || state.userRole,
  }))
}

export const setUserRole = (role: UserRole) => {
  localStorage.setItem('user_role', role)
  companyStore.setState((state) => ({
    ...state,
    userRole: role,
  }))
}


