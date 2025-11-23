import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useRecaptcha } from '@/hooks/use-recaptcha'
import { rootRoute } from '@/main'
import { useForm } from '@tanstack/react-form'
import { Link, createRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { executeRecaptcha } from '@/lib/recaptcha'

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
  const { register, isRegistering } = useAuth()

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
      try {
        // Execute reCAPTCHA v3 before submitting
        const recaptchaToken = await executeRecaptcha('register')
        
        // Include reCAPTCHA token in register request
        await register({
          ...value,
          recaptcha_token: recaptchaToken || undefined,
        })
      } catch (error) {
        console.error('reCAPTCHA error:', error)
        // Still attempt registration even if reCAPTCHA fails (backend will handle it)
        await register(value)
      }
    },
  })

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
                      disabled={isRegistering}
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
                      disabled={isRegistering}
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
                    disabled={isRegistering}
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
                    disabled={isRegistering}
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
                  disabled={isRegistering || !formState.canSubmit || formState.isSubmitting}
                >
                  {isRegistering ? 'Creating account...' : 'Create account'}
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


