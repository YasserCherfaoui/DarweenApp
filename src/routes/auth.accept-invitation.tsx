import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { rootRoute } from '@/main'
import { useForm } from '@tanstack/react-form'
import { createRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/use-auth'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const acceptInvitationSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export const AcceptInvitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accept-invitation',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    }
  },
  component: AcceptInvitationPage,
})

function AcceptInvitationPage() {
  const navigate = useNavigate()
  const search = AcceptInvitationRoute.useSearch()
  const token = search.token
  const { login } = useAuth()
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    // Validate token on mount
    if (token) {
      validateToken(token)
    } else {
      setIsValidating(false)
      setError('Invalid invitation link. Please contact your administrator.')
    }
  }, [token])

  const validateToken = async (invitationToken: string) => {
    try {
      const response = await apiClient.auth.validateInvitation(invitationToken)
      if (response.success && response.data) {
        setIsValid(true)
        setEmail(response.data.email || '')
      } else {
        setIsValid(false)
        setError('Invalid or expired invitation token. Please contact your administrator.')
      }
    } catch (err: any) {
      setIsValid(false)
      setError(err.message || 'Invalid or expired invitation token. Please contact your administrator.')
    } finally {
      setIsValidating(false)
    }
  }

  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        setError('Invalid invitation link')
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        const response = await apiClient.auth.acceptInvitation({
          token,
          first_name: value.first_name,
          last_name: value.last_name,
          password: value.password,
        })

        if (response.success && response.data) {
          // Auto-login after accepting invitation
          await login({
            email: email || response.data.user?.email || '',
            password: value.password,
          })
          navigate({ to: '/dashboard' })
        }
      } catch (err: any) {
        setError(err.message || 'Failed to accept invitation. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <img 
                src="/SVG/Darween.svg" 
                alt="Darween Logo" 
                className="h-16 w-16"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'This invitation link is invalid or has expired.'}</AlertDescription>
            </Alert>
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
              className="h-16 w-16"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Accept Invitation</CardTitle>
          <CardDescription className="text-center">
            Complete your account setup to join the team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {email && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You've been invited to join as <strong>{email}</strong>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="first_name"
                validators={{
                  onChange: ({ value }) => {
                    const result = acceptInvitationSchema.shape.first_name.safeParse(value)
                    if (!result.success) {
                      return result.error.issues[0]?.message
                    }
                    return undefined
                  },
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
                    const result = acceptInvitationSchema.shape.last_name.safeParse(value)
                    if (!result.success) {
                      return result.error.issues[0]?.message
                    }
                    return undefined
                  },
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
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = acceptInvitationSchema.shape.password.safeParse(value)
                  if (!result.success) {
                    return result.error.issues[0]?.message
                  }
                  return undefined
                },
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

            <form.Field
              name="confirm_password"
              validators={{
                onChange: ({ value }) => {
                  const result = acceptInvitationSchema.shape.confirm_password.safeParse(value)
                  if (!result.success) {
                    return result.error.issues[0]?.message
                  }
                  // Check if passwords match
                  const password = form.getFieldValue('password')
                  if (value && password && value !== password) {
                    return "Passwords don't match"
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirm Password</Label>
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
                  {isSubmitting ? 'Accepting invitation...' : 'Accept Invitation'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

