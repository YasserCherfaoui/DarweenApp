import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { Company } from '@/types/api'

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

const companySchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  code: z.string().min(2, { message: 'Code must be at least 2 characters' }).max(10, { message: 'Code must be at most 10 characters' }),
  description: z.string().optional(),
  erp_url: z.union([
    z.string().url({ message: 'Please enter a valid URL' }),
    z.literal(''),
  ]).optional(),
})

type FormValues = z.infer<typeof companySchema>

interface CompanyFormProps {
  initialData?: Partial<Company>
  onSubmit: (data: { name: string; code: string; description?: string; erp_url?: string }) => void
  isLoading?: boolean
  submitLabel?: string
}

export function CompanyForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  submitLabel = 'Save' 
}: CompanyFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      erp_url: initialData?.erp_url || '',
    },
    mode: 'onChange', // Enable real-time validation
  })

  // Helper to get field validation state
  const getFieldState = (fieldName: keyof FormValues) => {
    const fieldState = form.getFieldState(fieldName)
    const fieldValue = form.watch(fieldName)
    
    if (!fieldState.isDirty) return 'idle'
    if (fieldState.error) return 'error'
    if (fieldValue && !fieldState.error) return 'success'
    return 'idle'
  }

  // Get validation icon based on field state
  const getValidationIcon = (fieldName: keyof FormValues) => {
    const state = getFieldState(fieldName)
    
    if (state === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
    if (state === 'error') {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
    return null
  }

  const handleSubmit = (values: FormValues) => {
    // Normalize empty string to undefined for optional fields
    const normalizedValue = {
      ...values,
      description: values.description || undefined,
      erp_url: values.erp_url || undefined,
    }
    onSubmit(normalizedValue)
  }

  return (
    <div className="space-y-6">
      {/* Form State Indicator */}
      {Object.keys(form.formState.dirtyFields).length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-1">
              <div className="font-medium">Form Status:</div>
              <div className="text-sm">
                {form.formState.isValid ? (
                  <span className="text-green-700 font-medium">✓ All fields are valid! Ready to submit.</span>
                ) : (
                  <span className="text-orange-700">
                    {Object.keys(form.formState.errors).length} field(s) need attention
                  </span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Company Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Company Name *</span>
                  {getValidationIcon('name')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Inc."
                    className={cn(
                      getFieldState('name') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('name') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The official name of your company
                </FormDescription>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )}
          />

          {/* Company Code Field */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Company Code *</span>
                  {getValidationIcon('code')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="ACME"
                    maxLength={10}
                    className={cn(
                      getFieldState('code') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('code') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading || !!initialData?.code}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>
                  A unique identifier for your company (cannot be changed after creation)
                </FormDescription>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Description</span>
                  {getValidationIcon('description')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of your company..."
                    className={cn(
                      getFieldState('description') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('description') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading}
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional description about your company
                </FormDescription>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )}
          />

          {/* ERP URL Field */}
          <FormField
            control={form.control}
            name="erp_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>ERP/Frontend URL</span>
                  {getValidationIcon('erp_url')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://app.example.com"
                    className={cn(
                      getFieldState('erp_url') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('erp_url') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The frontend URL for this company. Used for email links (invitations, password resets, etc.). Leave empty to use default.
                </FormDescription>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? 'Saving...' : submitLabel}
            </Button>
            {!form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 && (
              <p className="text-sm text-center text-orange-600">
                Please fix the errors above to submit the form
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}


