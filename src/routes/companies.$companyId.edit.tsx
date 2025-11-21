import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CompanyForm } from '@/components/companies/CompanyForm'
import { useCompany, useUpdateCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const EditCompanyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/edit',
  component: EditCompanyPage,
})

function EditCompanyPage() {
  const navigate = useNavigate()
  const { companyId } = EditCompanyRoute.useParams()
  const { data: company, isLoading } = useCompany(Number(companyId))
  const updateCompany = useUpdateCompany(Number(companyId))
  const { selectCompany } = useSelectedCompany()

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  const handleSubmit = async (data: { name: string; code: string; description?: string; erp_url?: string }) => {
    await updateCompany.mutateAsync(data)
    navigate({ to: `/companies/${companyId}` })
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  if (!company) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Company not found</h2>
          <Button onClick={() => navigate({ to: '/companies' })}>
            Back to Companies
          </Button>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Company
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Company
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Update your company information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Make changes to your company details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyForm
              initialData={company}
              onSubmit={handleSubmit}
              isLoading={updateCompany.isPending}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}



