import { createRoute, useNavigate } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FranchiseForm } from '@/components/franchises/FranchiseForm'
import { useFranchise, useUpdateFranchise } from '@/hooks/queries/use-franchises'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const EditCompanyFranchiseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/franchises/$franchiseId/edit',
  component: EditCompanyFranchisePage,
})

function EditCompanyFranchisePage() {
  const navigate = useNavigate()
  const { companyId, franchiseId } = EditCompanyFranchiseRoute.useParams()
  const franchiseIdNum = Number(franchiseId)

  const { data: franchise, isLoading } = useFranchise(franchiseIdNum)
  const updateFranchise = useUpdateFranchise(franchiseIdNum)

  const handleSubmit = async (data: {
    name: string
    code: string
    description?: string
    address?: string
    phone?: string
    email?: string
  }) => {
    const result = await updateFranchise.mutateAsync(data)
    if (result.success) {
      navigate({ to: `/companies/${companyId}/franchises/${franchiseId}` })
    }
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleBasedLayout>
    )
  }

  if (!franchise) {
    return (
      <RoleBasedLayout>
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Franchise not found</h3>
            <p className="text-gray-500 mb-6">
              The franchise you're trying to edit doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate({ to: `/companies/${companyId}/franchises` })}>
              Back to Franchises
            </Button>
          </div>
        </Card>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/franchises/${franchiseId}` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Franchise
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Franchise
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Update the information for {franchise.name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Franchise Information</CardTitle>
            <CardDescription>
              Update the details for this franchise location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FranchiseForm
              initialData={franchise}
              onSubmit={handleSubmit}
              isLoading={updateFranchise.isPending}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}


