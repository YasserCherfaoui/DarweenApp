import { createRoute } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser, useUpdateUser } from '@/hooks/queries/use-user'
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
import { Badge } from '@/components/ui/badge'
import { User, Mail, CheckCircle2 } from 'lucide-react'
import { rootRoute } from '@/main'

export const ProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

const profileSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function ProfilePage() {
  const { data: user, isLoading } = useUser()
  const updateUser = useUpdateUser()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    },
    values: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    },
  })

  const handleSubmit = async (data: ProfileFormValues) => {
    await updateUser.mutateAsync({
      first_name: data.first_name,
      last_name: data.last_name,
    })
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  if (!user) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your personal information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your name and view your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Status */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <Badge variant={user.is_active ? 'default' : 'secondary'}>
                {user.is_active ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  'Inactive'
                )}
              </Badge>
            </div>

            {/* Profile Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          disabled={updateUser.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your first name as it appears on your account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          disabled={updateUser.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your last name as it appears on your account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateUser.isPending || !form.formState.isDirty}
                >
                  {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}

