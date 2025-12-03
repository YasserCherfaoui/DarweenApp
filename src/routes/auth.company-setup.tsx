import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDebounce } from '@/hooks/use-debounce'
import { apiClient } from '@/lib/api-client'
import { rootRoute } from '@/main'
import { setAuthUser } from '@/stores/auth-store'
import type { User } from '@/types/api'
import { useForm } from '@tanstack/react-form'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Building2, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

export const CompanySetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-setup',
  component: CompanySetupPage,
})

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  code: z.string().min(2, 'Company code must be at least 2 characters'),
  description: z.string().optional(),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  legal_address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
})

function CompanySetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [codeCheckStatus, setCodeCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [codeSuggestions, setCodeSuggestions] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      registration_number: '',
      tax_id: '',
      legal_address: '',
      phone: '',
      website: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null)
      setIsSubmitting(true)
      try {
        const response = await apiClient.companies.create(value)
        
        if (response.success && response.data) {
          // Get fresh auth data after company creation
          const meResponse = await apiClient.users.getMe()
          if (meResponse.success && meResponse.data) {
            // Get the token from localStorage since the response doesn't include it
            const token = localStorage.getItem('auth_token')
            if (token) {
              setAuthUser(meResponse.data as User, token)
            }
          }
          
          // Navigate to the new company dashboard
          navigate({ to: `/companies/${response.data.id}` })
        }
      } catch (error: any) {
        console.error('Failed to create company:', error)
        setErrorMessage(error.message || 'Failed to create company. Please try again.')
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Debounced code availability check
  const checkCodeAvailability = useDebounce(async (code: string) => {
    if (!code || code.length < 2) {
      setCodeCheckStatus('idle')
      return
    }

    setCodeCheckStatus('checking')
    try {
      const response = await apiClient.companies.checkCodeAvailability(code)
      
      if (response.success && response.data) {
        if (response.data.available) {
          setCodeCheckStatus('available')
          setCodeSuggestions([])
        } else {
          setCodeCheckStatus('taken')
          setCodeSuggestions(response.data.suggestions || [])
        }
      }
    } catch (error) {
      setCodeCheckStatus('idle')
    }
  }, 500)

  const handleCodeChange = (value: string) => {
    form.setFieldValue('code', value)
    checkCodeAvailability(value)
  }

  const handleNext = () => {
    // Validate step 1 fields before moving to step 2
    if (form.state.values.name && form.state.values.code && codeCheckStatus === 'available') {
      setStep(2)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Your Company Profile</CardTitle>
          <CardDescription className="text-center">
            {step === 1
              ? 'Set up your company with basic information'
              : 'Add legal information (optional)'}
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 pt-4">
            <div className={`flex items-center ${step === 1 ? 'text-primary' : 'text-green-500'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 1 ? 'border-primary bg-primary text-white' : 'border-green-500 bg-green-500 text-white'
              }`}>
                {step === 2 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Basic Info</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600" />
            <div className={`flex items-center ${step === 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 2 ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Legal Info</span>
            </div>
          </div>
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
                      Error
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      const result = companySchema.shape.name.safeParse(value)
                      if (!result.success) return result.error.issues[0]?.message
                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Company Name *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="Acme Corporation"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isSubmitting}
                      />
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-500">{String(field.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="code"
                  validators={{
                    onChange: ({ value }) => {
                      const result = companySchema.shape.code.safeParse(value)
                      if (!result.success) return result.error.issues[0]?.message
                      if (codeCheckStatus === 'taken') return 'This code is already taken'
                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Company Code *</Label>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="acme-corp"
                          value={field.state.value}
                          onChange={(e) => handleCodeChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isSubmitting}
                          className={
                            codeCheckStatus === 'available'
                              ? 'border-green-500'
                              : codeCheckStatus === 'taken'
                              ? 'border-red-500'
                              : ''
                          }
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {codeCheckStatus === 'checking' && (
                            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                          )}
                          {codeCheckStatus === 'available' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {codeCheckStatus === 'taken' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-500">{String(field.state.meta.errors[0])}</p>
                      )}
                      {codeCheckStatus === 'available' && (
                        <p className="text-sm text-green-600">This code is available!</p>
                      )}
                      {codeCheckStatus === 'taken' && codeSuggestions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Suggestions:</p>
                          <div className="flex flex-wrap gap-2">
                            {codeSuggestions.map((suggestion) => (
                              <Button
                                key={suggestion}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleCodeChange(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="description">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Description</Label>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder="Brief description of your company..."
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isSubmitting}
                        rows={3}
                      />
                    </div>
                  )}
                </form.Field>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full"
                  disabled={!form.state.values.name || !form.state.values.code || codeCheckStatus !== 'available'}
                >
                  Next: Legal Information
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <div className="flex items-start space-x-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                        Legal Information (Optional)
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        This information is optional but recommended for compliance and professional documentation.
                      </p>
                    </div>
                  </div>
                </div>

                <form.Field name="registration_number">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Company Registration Number</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="12345678"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="tax_id">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Tax ID / VAT Number</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="DZ12345678901"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="legal_address">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Legal Address</Label>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder="123 Main St, City, Country"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isSubmitting}
                        rows={2}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="phone">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Phone Number</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        placeholder="+213 555 123 456"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="website">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Website</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="url"
                        placeholder="https://example.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </form.Field>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Company'
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    type="submit"
                    variant="link"
                    className="text-sm text-gray-600 dark:text-gray-400"
                    disabled={isSubmitting}
                  >
                    Skip legal information for now
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

