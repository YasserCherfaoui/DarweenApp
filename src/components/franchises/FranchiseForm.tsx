import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { Franchise } from '@/types/api'

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

const franchiseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10, 'Code must be at most 10 characters'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof franchiseSchema>

interface FranchiseFormProps {
  initialData?: Partial<Franchise>
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
  submitLabel?: string
}

export function FranchiseForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
}: FranchiseFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(franchiseSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
    },
    mode: 'onChange',
  })

  const getFieldState = (fieldName: keyof FormValues) => {
    const fieldState = form.getFieldState(fieldName)
    const fieldValue = form.watch(fieldName)
    
    if (!fieldState.isDirty) return 'idle'
    if (fieldState.error) return 'error'
    if (fieldValue && !fieldState.error) return 'success'
    return 'idle'
  }

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Franchise Name *</span>
                {getValidationIcon('name')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Downtown Branch"
                  className={cn(
                    getFieldState('name') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('name') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter a descriptive name for this franchise location
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Franchise Code *</span>
                {getValidationIcon('code')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="DT01"
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
                A unique identifier for this franchise (cannot be changed after creation)
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => {
            const descLength = form.watch('description')?.length || 0
            
            return (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Description</span>
                  <div className="flex items-center gap-2">
                    {descLength > 0 && (
                      <span className="text-sm font-normal text-slate-500">
                        {descLength} characters
                      </span>
                    )}
                    {getValidationIcon('description')}
                  </div>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of this franchise location..."
                    className={cn(
                      'resize-none',
                      getFieldState('description') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('description') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    rows={3}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional description for this franchise
                </FormDescription>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )
          }}
        />

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
                  placeholder="123 Main Street, City, State 12345"
                  className={cn(
                    getFieldState('address') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('address') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Physical location of the franchise
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                    placeholder="+1 (555) 123-4567"
                    className={cn(
                      getFieldState('phone') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('phone') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )}
          />

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
                    placeholder="franchise@example.com"
                    className={cn(
                      getFieldState('email') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('email') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !form.formState.isValid} 
          className="w-full"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
        
        {!form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 && (
          <p className="text-sm text-center text-orange-600">
            Please fix the errors above to submit the form
          </p>
        )}
      </form>
    </Form>
  )
}

