import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Building2 } from 'lucide-react'
import { rootRoute } from '@/main'
import { useAdminSubscriptions, useUpdateAdminSubscription } from '@/hooks/queries/use-admin'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { SubscriptionSummary } from '@/types/api'

export const AdminSubscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/subscriptions',
  component: AdminSubscriptionsPage,
})

function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1)
  const [planType, setPlanType] = useState<string>('')
  const limit = 20
  const [editingSubscription, setEditingSubscription] = useState<number | null>(null)
  const [newPlanType, setNewPlanType] = useState<string>('')
  const [newStatus, setNewStatus] = useState<string>('')

  const { data, isLoading } = useAdminSubscriptions({
    page,
    limit,
    plan_type: planType || undefined,
  })

  const updateSubscription = useUpdateAdminSubscription(editingSubscription || 0)

  const subscriptions = data?.subscriptions || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const handleUpdate = async () => {
    if (!editingSubscription) return
    try {
      await updateSubscription.mutateAsync({
        plan_type: newPlanType || undefined,
        status: newStatus || undefined,
      })
      setEditingSubscription(null)
      setNewPlanType('')
      setNewStatus('')
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Subscriptions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage all subscription plans
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={planType || 'all'}
              onValueChange={(value) => {
                setPlanType(value === 'all' ? '' : value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions ({total})</CardTitle>
            <CardDescription>All subscription plans on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No subscriptions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription: SubscriptionSummary) => (
                  <Card key={subscription.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Building2 className="h-8 w-8 text-gray-400" />
                          <div>
                            <h3 className="font-semibold">{subscription.company_name}</h3>
                            <p className="text-sm text-gray-500">
                              Plan: <span className="capitalize">{subscription.plan_type}</span> • Max Users: {subscription.max_users}
                            </p>
                            <p className="text-sm text-gray-500">
                              Started: {new Date(subscription.start_date).toLocaleDateString()}
                              {subscription.end_date && ` • Ends: ${new Date(subscription.end_date).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                            {subscription.status}
                          </Badge>
                          <Dialog
                            open={editingSubscription === subscription.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingSubscription(null)
                                setNewPlanType('')
                                setNewStatus('')
                              } else {
                                setEditingSubscription(subscription.id)
                                setNewPlanType(subscription.plan_type)
                                setNewStatus(subscription.status)
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Edit</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Subscription</DialogTitle>
                                <DialogDescription>
                                  Update subscription plan and status for {subscription.company_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Plan Type</Label>
                                  <Select value={newPlanType} onValueChange={setNewPlanType}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="free">Free</SelectItem>
                                      <SelectItem value="basic">Basic</SelectItem>
                                      <SelectItem value="premium">Premium</SelectItem>
                                      <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="inactive">Inactive</SelectItem>
                                      <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingSubscription(null)
                                    setNewPlanType('')
                                    setNewStatus('')
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdate} disabled={updateSubscription.isPending}>
                                  {updateSubscription.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}



