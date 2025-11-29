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
  const { login, isLoggingIn } = useAuth()

  // Load reCAPTCHA on mount, cleanup on unmount (auth page only)
  useRecaptcha()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        // Execute reCAPTCHA v3 before submitting
        const recaptchaToken = await executeRecaptcha('login')
        
        // Include reCAPTCHA token in login request
        await login({
          ...value,
          recaptcha_token: recaptchaToken || undefined,
        })
      } catch (error) {
        console.error('reCAPTCHA error:', error)
        // Still attempt login even if reCAPTCHA fails (backend will handle it)
        await login(value)
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
                    disabled={isLoggingIn}
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
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoggingIn}
                    autoComplete="current-password"
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
                  disabled={isLoggingIn || !formState.canSubmit || formState.isSubmitting}
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign in'}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


