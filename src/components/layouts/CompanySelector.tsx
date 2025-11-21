import { useStore } from '@tanstack/react-store'
import { companyStore, setSelectedCompany, clearSelectedCompany } from '@/stores/company-store'
import { useCompanies } from '@/hooks/queries/use-companies'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Building2, Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CompanySelector() {
  const { selectedCompany } = useStore(companyStore)
  const { data: companies, isLoading } = useCompanies()

  const handleSelectCompany = (company: typeof companies[0]) => {
    // TODO: Backend should include user_role in the company response based on UserCompanyRole
    // For now, if no role is provided, default to 'admin' for testing
    // In production, the backend API should return the user's role for each company
    const companyWithRole = {
      ...company,
      user_role: company.user_role || ('admin' as const) // Temporary fallback for development
    }
    setSelectedCompany(companyWithRole)
  }

  const handleClearSelection = () => {
    clearSelectedCompany()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {selectedCompany ? selectedCompany.name : 'Select Company'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Select Company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem disabled>Loading companies...</DropdownMenuItem>
        ) : companies && companies.length > 0 ? (
          <>
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => handleSelectCompany(company)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{company.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {company.code}
                  </span>
                </div>
                {selectedCompany?.id === company.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            {selectedCompany && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleClearSelection}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Selection
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <DropdownMenuItem disabled>No companies available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


