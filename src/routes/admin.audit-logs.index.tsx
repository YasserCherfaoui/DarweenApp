import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { rootRoute } from '@/main'

export const AdminAuditLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/audit-logs',
  component: AdminAuditLogsPage,
})

function AdminAuditLogsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Logs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            View platform activity and admin actions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>System activity and admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Audit logs feature coming soon</p>
              <p className="text-sm text-gray-400 mt-2">
                This will display all admin actions and system events
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}



