import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Company } from '@/types/api'

const companySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10, 'Code must be at most 10 characters'),
  description: z.string().optional(),
})

interface CompanyFormProps {
  initialData?: Partial<Company>
  onSubmit: (data: { name: string; code: string; description?: string }) => void
  isLoading?: boolean
  submitLabel?: string
}

export function CompanyForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  submitLabel = 'Save' 
}: CompanyFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: companySchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Company Name *</Label>
            <Input
              id={field.name}
              placeholder="Acme Inc."
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isLoading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="code">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Company Code *</Label>
            <Input
              id={field.name}
              placeholder="ACME"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
              onBlur={field.handleBlur}
              disabled={isLoading || !!initialData?.code}
              maxLength={10}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {String(field.state.meta.errors[0])}
              </p>
            )}
            <p className="text-xs text-gray-500">
              A unique identifier for your company (cannot be changed after creation)
            </p>
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              placeholder="Brief description of your company..."
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isLoading}
              rows={4}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}


