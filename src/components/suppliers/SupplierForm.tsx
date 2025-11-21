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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Supplier } from '@/types/api'
import { CheckCircle2, XCircle } from 'lucide-react'

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

const supplierSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  contact_person: z.string().optional(),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormValues = z.infer<typeof supplierSchema>

interface SupplierFormProps {
  initialData?: Partial<Supplier>
  onSubmit: (data: { name: string; contact_person?: string; email?: string; phone?: string; address?: string }) => void
  isLoading?: boolean
  submitLabel?: string
}

export function SupplierForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  submitLabel = 'Save' 
}: SupplierFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialData?.name || '',
      contact_person: initialData?.contact_person || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
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

  function handleSubmit(values: FormValues) {
    // Filter out empty strings for optional fields
    const data = {
      name: values.name,
      contact_person: values.contact_person || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
    }
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Supplier Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Supplier Name *</span>
                {getValidationIcon('name')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Supplies Co."
                  className={cn(
                    getFieldState('name') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('name') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the official name of the supplier company
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* Contact Person Field */}
        <FormField
          control={form.control}
          name="contact_person"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Contact Person</span>
                {getValidationIcon('contact_person')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  className={cn(
                    getFieldState('contact_person') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('contact_person') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Primary contact person at the supplier
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Email</span>
                {getValidationIcon('email')}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contact@acmesupplies.com"
                  className={cn(
                    getFieldState('email') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('email') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Email address for supplier communications
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Phone</span>
                {getValidationIcon('phone')}
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className={cn(
                    getFieldState('phone') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('phone') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Contact phone number for the supplier
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Address</span>
                {getValidationIcon('address')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Main St, City, State, ZIP"
                  className={cn(
                    getFieldState('address') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('address') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Physical address of the supplier
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
            disabled={isLoading || form.formState.isSubmitting}
          >
            {isLoading || form.formState.isSubmitting ? 'Saving...' : submitLabel}
          </Button>
          {!form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 && (
            <p className="text-sm text-center text-orange-600">
              Please fix the errors above to submit the form
            </p>
          )}
        </div>
      </form>
    </Form>
  )
}



