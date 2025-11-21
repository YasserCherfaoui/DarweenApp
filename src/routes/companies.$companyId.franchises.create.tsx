import { createRoute, useNavigate } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FranchiseForm } from '@/components/franchises/FranchiseForm'
import { useCreateFranchise } from '@/hooks/queries/use-franchises'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const CreateFranchiseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/franchises/create',
  component: CreateFranchisePage,
})

function CreateFranchisePage() {
  const navigate = useNavigate()
  const { companyId } = CreateFranchiseRoute.useParams()
  const companyIdNum = Number(companyId)

  const createFranchise = useCreateFranchise(companyIdNum)

  const handleSubmit = async (data: {
    name: string
    code: string
    description?: string
    address?: string
    phone?: string
    email?: string
  }) => {
    const result = await createFranchise.mutateAsync(data)
    if (result.success && result.data) {
      navigate({ to: `/companies/${companyId}/franchises/${result.data.id}` })
    }
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/franchises` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Franchises
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Franchise
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Set up a new franchise location for your company
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Franchise Information</CardTitle>
            <CardDescription>
              Enter the details for your new franchise location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FranchiseForm
              onSubmit={handleSubmit}
              isLoading={createFranchise.isPending}
              submitLabel="Create Franchise"
            />
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}

