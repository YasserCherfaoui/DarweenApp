import { createRoute, useNavigate } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CompanyForm } from '@/components/companies/CompanyForm'
import { useCreateCompany } from '@/hooks/queries/use-companies'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const CreateCompanyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/create',
  component: CreateCompanyPage,
})

function CreateCompanyPage() {
  const navigate = useNavigate()
  const createCompany = useCreateCompany()

  const handleSubmit = async (data: { name: string; code: string; description?: string; erp_url?: string }) => {
    const result = await createCompany.mutateAsync(data)
    if (result.success && result.data) {
      navigate({ to: `/companies/${result.data.id}` })
    }
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/companies' })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Company
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Set up a new company to start managing your business
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Enter the details for your new company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyForm
              onSubmit={handleSubmit}
              isLoading={createCompany.isPending}
              submitLabel="Create Company"
            />
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}



