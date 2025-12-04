import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserPortals } from '@/hooks/queries/use-portals'
import { rootRoute } from '@/main'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Building2, CheckCircle2, LayoutDashboard, Loader2 } from 'lucide-react'

export const VerificationSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verification-success',
  component: VerificationSuccessPage,
})

function VerificationSuccessPage() {
  const navigate = useNavigate()
  const { data: portalsData, isLoading } = useUserPortals()
  const portals = portalsData?.portals || []
  const hasPortals = portals.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
              <div className="absolute inset-0 h-20 w-20 text-green-500 animate-ping opacity-20">
                <CheckCircle2 className="h-20 w-20" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Email Verified Successfully!
          </CardTitle>
          <CardDescription className="text-center">
            {hasPortals
              ? 'Your email has been confirmed. You can now access your portal.'
              : 'Your email has been confirmed. You can now set up your company profile.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : hasPortals ? (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-3">
                  <LayoutDashboard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                      Welcome to Your Portal
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You've been invited to join {portals.length === 1 ? 'a portal' : 'multiple portals'}. 
                      You can now access your {portals.length === 1 ? 'portal' : 'portals'} and start working.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Next Step: Create Your Company Profile
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        To get started with Darween ERP, you'll need to create your company profile. 
                        This includes basic information about your business and optional legal details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    What you'll need:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2" />
                      <span>Company name and unique code</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2" />
                      <span>Company description (optional)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2" />
                      <span>Legal information (optional but recommended)</span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            <Button
              onClick={() => navigate({ to: hasPortals ? '/dashboard' : '/company-setup' })}
              className="w-full"
              size="lg"
            >
              {hasPortals ? 'Continue to Portal' : 'Continue to Company Setup'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center">
              <Button
                onClick={() => navigate({ to: '/login' })}
                variant="link"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                I'll do this later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

