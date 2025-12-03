import { createRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { rootRoute } from '@/main'
import { CheckCircle2, ArrowRight, Building2 } from 'lucide-react'

export const VerificationSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verification-success',
  component: VerificationSuccessPage,
})

function VerificationSuccessPage() {
  const navigate = useNavigate()

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
            Your email has been confirmed. You can now set up your company profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

            <Button
              onClick={() => navigate({ to: '/company-setup' })}
              className="w-full"
              size="lg"
            >
              Continue to Company Setup
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

