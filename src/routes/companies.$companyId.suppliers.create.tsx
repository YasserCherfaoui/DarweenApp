import { createRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SupplierForm } from '@/components/suppliers/SupplierForm'
import { useCreateSupplier } from '@/hooks/queries/use-suppliers'
import { useCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const CreateSupplierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/suppliers/create',
  component: CreateSupplierPage,
})

function CreateSupplierPage() {
  const navigate = useNavigate()
  const { companyId } = useParams({ from: '/companies/$companyId/suppliers/create' })
  const companyIdNum = parseInt(companyId)
  const { data: company } = useCompany(companyIdNum)
  const { selectCompany } = useSelectedCompany()
  const createSupplier = useCreateSupplier(companyIdNum)

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  const handleSubmit = async (data: { name: string; contact_person?: string; email?: string; phone?: string }) => {
    const result = await createSupplier.mutateAsync(data)
    if (result.success && result.data) {
      navigate({ to: `/companies/${companyId}/suppliers/${result.data.id}` })
    }
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/suppliers` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Supplier
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create a new supplier to track vendor relationships and products
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
            <CardDescription>
              Enter the details for your new supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupplierForm
              onSubmit={handleSubmit}
              isLoading={createSupplier.isPending}
              submitLabel="Create Supplier"
            />
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}



