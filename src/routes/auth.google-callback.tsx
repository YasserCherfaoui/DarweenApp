import { useEffect, useState } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { rootRoute } from '@/main'
import { completeGoogleOAuthLogin } from '@/lib/google-oauth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

        // Redirect to companies page
        navigate({ to: '/companies' })
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

