import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { rootRoute } from '@/main'
import { createRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export const VerifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const navigate = useNavigate()
  const { token, email } = useSearch({ from: '/verify-email' }) as { token?: string; email?: string }
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email and try again.')
      return
    }

    // Call API to verify email
    apiClient.auth
      .verifyEmail({
        code: token,
        email: email,
      })
      .then((response) => {
        if (response.success && response.data) {
          setStatus('success')
          setMessage(response.data.message)
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate({ to: '/verification-success' })
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Verification failed. Please try again.')
        }
      })
      .catch((error) => {
        setStatus('error')
        setMessage(
          error.message ||
            'Verification failed. The link may have expired or is invalid.'
        )
      })
  }, [token, email, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {status === 'loading' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Please wait while we verify your email address...'}
            {status === 'success' && 'Your email has been successfully verified.'}
            {status === 'error' && 'We could not verify your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                {message}
              </p>
            </div>

            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Redirecting you to complete your profile...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-2">
                <Button
                  onClick={() => navigate({ to: '/login' })}
                  className="w-full"
                  variant="outline"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => navigate({ to: '/register' })}
                  className="w-full"
                  variant="ghost"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

