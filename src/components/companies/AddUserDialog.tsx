import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

const addUserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  role: z.enum(['owner', 'admin', 'manager', 'employee'], {
    required_error: 'Please select a role',
  }),
})

type FormValues = z.infer<typeof addUserSchema>

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: AddUserDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: '',
      role: 'employee',
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

  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
    form.reset()
  }

  const handleCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Company</DialogTitle>
          <DialogDescription>
            Add an existing user to this company by entering their email address and selecting a role.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>User Email *</span>
                    {getValidationIcon('email')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      className={cn(
                        getFieldState('email') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                        getFieldState('email') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The user must already be registered in the system
                  </FormDescription>
                  <FormMessage className="text-red-600 font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Role *</span>
                    {getValidationIcon('role')}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          getFieldState('role') === 'error' && 'border-red-500 focus:ring-red-500',
                          getFieldState('role') === 'success' && 'border-green-500 focus:ring-green-500'
                        )}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    <div className="space-y-1 pt-1">
                      <p><strong>Owner:</strong> Full control over the company</p>
                      <p><strong>Admin:</strong> Can manage users and settings</p>
                      <p><strong>Manager:</strong> Can manage inventory and operations</p>
                      <p><strong>Employee:</strong> Basic access to view and update inventory</p>
                    </div>
                  </FormDescription>
                  <FormMessage className="text-red-600 font-medium" />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !form.formState.isValid} 
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add User'}
              </Button>
            </div>
            
            {!form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 && (
              <p className="text-sm text-center text-orange-600">
                Please fix the errors above to submit
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

