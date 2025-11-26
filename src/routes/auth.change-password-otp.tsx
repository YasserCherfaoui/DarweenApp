import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { rootRoute } from '@/main'
import { useForm } from '@tanstack/react-form'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const changePasswordOTPSchema = z.object({
  code: z.coerce.string().length(6, 'OTP code must be 6 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export const ChangePasswordOTPRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/change-password-otp',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      otp: (search.otp as string) || '',
      email: (search.email as string) || '',
    }
  },
  component: ChangePasswordOTPPage,
})

function ChangePasswordOTPPage() {
  const navigate = useNavigate()
  const search = ChangePasswordOTPRoute.useSearch()
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState<string>(search.email || '')
  const [otpCode, setOtpCode] = useState<string>(search.otp || '')

  useEffect(() => {
    // Pre-fill form if OTP and email are in URL
    if (search.otp && search.email) {
      setOtpCode(search.otp)
      setEmail(search.email)
      validateOTP(search.otp, search.email)
    }
  }, [search.otp, search.email])

  const validateOTP = async (code: string, emailAddress: string) => {
    setIsValidating(true)
    setError(null)
    try {
      const response = await apiClient.auth.validateOTP(code, emailAddress)
      if (response.success && response.data?.valid) {
        setIsValid(true)
        setEmail(emailAddress)
      } else {
        setIsValid(false)
        setError('Invalid or expired OTP code. Please check your email for the correct code.')
      }
    } catch (err: any) {
      setIsValid(false)
      setError(err.message || 'Invalid or expired OTP code. Please check your email for the correct code.')
    } finally {
      setIsValidating(false)
    }
  }

  const form = useForm({
    defaultValues: {
      code: otpCode,
      email: email,
      password: '',
      confirm_password: '',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      try {
        // Ensure code is a string
        const codeStr = String(value.code).padStart(6, '0')
        
        // Validate OTP first
        if (!isValid) {
          await validateOTP(codeStr, value.email)
          if (!isValid) {
            setIsSubmitting(false)
            return
          }
        }

        const response = await apiClient.auth.changePasswordWithOTP({
          code: codeStr,
          email: value.email,
          password: value.password,
        })

        if (response.success) {
          setSuccess(true)
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate({ to: '/login' })
          }, 2000)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to change password. Please try again.')
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
              <p className="text-gray-600 dark:text-gray-400">Validating OTP code...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
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
            <CardTitle className="text-2xl font-bold text-center">Password Changed Successfully</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your password has been changed successfully. Redirecting to login...
              </AlertDescription>
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
          <CardTitle className="text-2xl font-bold text-center">Change Password</CardTitle>
          <CardDescription className="text-center">
            Enter your OTP code and new password
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                name="code"
                validators={{
                  onChange: ({ value }) => {
                    const result = changePasswordOTPSchema.shape.code.safeParse(value)
                    if (!result.success) {
                      return result.error.issues[0]?.message
                    }
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>OTP Code</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="000000"
                      value={field.state.value}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        field.handleChange(value)
                        setOtpCode(value)
                      }}
                      onBlur={field.handleBlur}
                      disabled={isSubmitting}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
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
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const result = changePasswordOTPSchema.shape.email.safeParse(value)
                    if (!result.success) {
                      return result.error.issues[0]?.message
                    }
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="user@example.com"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value)
                        setEmail(e.target.value)
                      }}
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
            </div>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = changePasswordOTPSchema.shape.password.safeParse(value)
                  if (!result.success) {
                    return result.error.issues[0]?.message
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>New Password</Label>
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
                  const result = changePasswordOTPSchema.shape.confirm_password.safeParse(value)
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
                  {isSubmitting ? 'Changing password...' : 'Change Password'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

