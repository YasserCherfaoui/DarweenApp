import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRecaptcha } from '@/hooks/use-recaptcha'
import { rootRoute } from '@/main'
import { useForm } from '@tanstack/react-form'
import { Link, createRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { executeRecaptcha } from '@/lib/recaptcha'
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginWithGoogle } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const googleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load reCAPTCHA on mount, cleanup on unmount (auth page only)
  useRecaptcha()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (googleTimeoutRef.current) {
        clearTimeout(googleTimeoutRef.current)
      }
    }
  }, [])

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null)
      setIsEmailNotVerified(false)
      setIsSubmitting(true)
      try {
        // Execute reCAPTCHA v3 before submitting
        const recaptchaToken = await executeRecaptcha('login')
        
        // Call login API directly
        const { login } = await import('@/lib/auth')
        await login({
          ...value,
          recaptcha_token: recaptchaToken || undefined,
        })
        
        // Navigate to companies page on success
        navigate({ to: '/companies' })
      } catch (error: any) {
        console.error('Login error:', error)
        const errorMsg = error.message || 'Login failed. Please try again.'
        setErrorMessage(errorMsg)
        
        // Check if error is about unverified email
        if (errorMsg.toLowerCase().includes('email not verified')) {
          setIsEmailNotVerified(true)
          setUnverifiedEmail(value.email)
        }
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handleResendVerification = async () => {
    try {
      const { resendVerificationEmail } = await import('@/lib/auth')
      await resendVerificationEmail(unverifiedEmail)
      setErrorMessage(null)
      setIsEmailNotVerified(false)
      alert('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to resend verification email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img 
              src="/SVG/Darween.svg" 
              alt="Darween Logo" 
              className="h-16 w-16 dark:invert"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg
                    className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">
                      Login Failed
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {errorMessage}
                    </p>
                    {isEmailNotVerified && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-red-700 dark:text-red-300 p-0 h-auto mt-2"
                        onClick={handleResendVerification}
                      >
                        <Mail className="mr-2 h-3 w-3" />
                        Resend verification email
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.shape.email.safeParse(value)
                  if (!result.success) {
                    return result.error.issues[0]?.message
                  }
                  return undefined
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="john@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.shape.password.safeParse(value)
                  if (!result.success) {
                    return result.error.issues[0]?.message
                  }
                  return undefined
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isSubmitting}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {(formState) => (
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !formState.canSubmit || formState.isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={async () => {
                if (isGoogleLoading) return // Prevent multiple clicks
                
                setIsGoogleLoading(true)
                setErrorMessage(null)
                
                // Set a timeout to re-enable the button after 10 seconds as a fallback
                // (in case redirect doesn't happen for some reason)
                googleTimeoutRef.current = setTimeout(() => {
                  setIsGoogleLoading(false)
                }, 10000)
                
                try {
                  await loginWithGoogle()
                  // If loginWithGoogle succeeds, it redirects to Google OAuth page
                  // so we don't need to reset the loading state here
                } catch (error: any) {
                  // Clear timeout if error occurs
                  if (googleTimeoutRef.current) {
                    clearTimeout(googleTimeoutRef.current)
                    googleTimeoutRef.current = null
                  }
                  setIsGoogleLoading(false)
                  setErrorMessage(error.message || 'Failed to initiate Google sign in')
                }
              }}
              disabled={isSubmitting || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Google...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


