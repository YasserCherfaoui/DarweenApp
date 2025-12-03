import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRecaptcha } from '@/hooks/use-recaptcha'
import { executeRecaptcha } from '@/lib/recaptcha'
import { rootRoute } from '@/main'
import { useForm } from '@tanstack/react-form'
import { Link, createRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const RegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

function RegisterPage() {
  const [registrationEmail, setRegistrationEmail] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load reCAPTCHA on mount, cleanup on unmount (auth page only)
  useRecaptcha()

  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null)
      setIsSubmitting(true)
      try {
        // Execute reCAPTCHA v3 before submitting
        const recaptchaToken = await executeRecaptcha('register')
        
        // Call register API directly
        const { register } = await import('@/lib/auth')
        await register({
          ...value,
          recaptcha_token: recaptchaToken || undefined,
        })
        
        // Only set email if registration was successful
        setRegistrationEmail(value.email)
      } catch (error: any) {
        console.error('Registration error:', error)
        setErrorMessage(error.message || 'Registration failed. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Show success message after registration
  if (registrationEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification link to <strong>{registrationEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Please check your email and click the verification link to activate your account.
                The link will expire in 24 hours.
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Didn't receive the email?
              </p>
              <Button
                variant="link"
                onClick={() => setRegistrationEmail(null)}
                className="text-primary"
              >
                Try registering again
              </Button>
            </div>
            <div className="text-center">
              <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to get started
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
                      Registration Failed
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="first_name"
                validators={{
                  onChange: ({ value }) => {
                    const result = registerSchema.shape.first_name.safeParse(value)
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
                    <Label htmlFor={field.name}>First Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="John"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isSubmitting}
                      autoComplete="given-name"
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
                name="last_name"
                validators={{
                  onChange: ({ value }) => {
                    const result = registerSchema.shape.last_name.safeParse(value)
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
                    <Label htmlFor={field.name}>Last Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Doe"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isSubmitting}
                      autoComplete="family-name"
                    />
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = registerSchema.shape.email.safeParse(value)
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
                  const result = registerSchema.shape.password.safeParse(value)
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
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
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
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


