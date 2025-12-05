import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { completeGoogleOAuthLogin } from '@/lib/google-oauth'
import { rootRoute } from '@/main'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const GoogleOAuthCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/google/callback',
  component: GoogleOAuthCallbackPage,
})

function GoogleOAuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const errorParam = urlParams.get('error')

        if (errorParam) {
          setError('OAuth authorization failed. Please try again.')
          setIsProcessing(false)
          return
        }

        if (!token) {
          setError('No token received from OAuth provider.')
          setIsProcessing(false)
          return
        }

        // Complete OAuth login
        await completeGoogleOAuthLogin(token)

        // Determine redirect path based on user portals
        // If user has only franchise portals, redirect to franchise
        // Otherwise, redirect to companies
        try {
          const portalsResponse = await apiClient.users.getPortals()
          if (portalsResponse.success && portalsResponse.data) {
            const portals = portalsResponse.data.portals
            const hasCompanyPortals = portals.some(p => p.type === 'company')
            const franchisePortals = portals.filter(p => p.type === 'franchise')
            
            if (!hasCompanyPortals && franchisePortals.length > 0) {
              // User has only franchise portals, redirect to first franchise
              navigate({ to: `/franchises/${franchisePortals[0].id}` })
            } else {
              // User has company portals, redirect to companies
              navigate({ to: '/companies' })
            }
          } else {
            // Fallback to companies if portals check fails
            navigate({ to: '/companies' })
          }
        } catch (portalsError) {
          // Fallback to companies if portals check fails
          console.error('Failed to fetch portals:', portalsError)
          navigate({ to: '/companies' })
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err)
        setError(err.message || 'Failed to complete Google sign in')
        setIsProcessing(false)
      }
    }

    processCallback()
  }, [navigate])

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Completing sign in...</CardTitle>
            <CardDescription className="text-center">
              Please wait while we complete your Google sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-red-600 dark:text-red-400">
              Sign in failed
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-4">
              <a
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Back to login
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

