```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Zod validation schema
const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must not exceed 20 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  age: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
      message: 'You must be at least 18 years old',
    }),
  role: z.string({
    required_error: 'Please select a role',
  }),
  bio: z
    .string()
    .min(10, { message: 'Bio must be at least 10 characters' })
    .max(500, { message: 'Bio must not exceed 500 characters' }),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ShadcnForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      age: '',
      role: '',
      bio: '',
      terms: false,
    },
    mode: 'onChange', // Enable real-time validation
  });

  // Helper to get field validation state
  const getFieldState = (fieldName: keyof FormValues) => {
    const fieldState = form.getFieldState(fieldName);
    const fieldValue = form.watch(fieldName);
    
    if (!fieldState.isDirty) return 'idle';
    if (fieldState.error) return 'error';
    if (fieldValue && !fieldState.error) return 'success';
    return 'idle';
  };

  // Get validation icon based on field state
  const getValidationIcon = (fieldName: keyof FormValues) => {
    const state = getFieldState(fieldName);
    
    if (state === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (state === 'error') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return null;
  };

  function onSubmit(values: FormValues) {
    console.log('Form submitted:', values);
    setFormData(values);
    setSubmitted(true);
    
    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
      form.reset();
    }, 5000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              User Registration Form
            </h1>
            <p className="text-slate-600">
              Fill out the form below with Zod validation
            </p>
          </div>

          {submitted && formData && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Form submitted successfully! Check the console for details.
              </AlertDescription>
            </Alert>
          )}

          {/* Form State Indicator */}
          {Object.keys(form.formState.dirtyFields).length > 0 && !submitted && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Username *</span>
                      {getValidationIcon('username')}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="johndoe" 
                        className={cn(
                          getFieldState('username') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                          getFieldState('username') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                        )}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a unique username (letters, numbers, underscores only)
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
                      <span>Email *</span>
                      {getValidationIcon('email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className={cn(
                          getFieldState('email') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                          getFieldState('email') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      We'll never share your email with anyone else
                    </FormDescription>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  const password = form.watch('password');
                  const hasUppercase = /[A-Z]/.test(password);
                  const hasLowercase = /[a-z]/.test(password);
                  const hasNumber = /[0-9]/.test(password);
                  const hasMinLength = password.length >= 8;
                  
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Password *</span>
                        {getValidationIcon('password')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className={cn(
                            getFieldState('password') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                            getFieldState('password') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                          )}
                          {...field} 
                        />
                      </FormControl>
                      {password && (
                        <div className="space-y-1 text-sm">
                          <div className={cn("flex items-center gap-2", hasMinLength ? "text-green-600" : "text-slate-500")}>
                            {hasMinLength ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span>At least 8 characters</span>
                          </div>
                          <div className={cn("flex items-center gap-2", hasUppercase ? "text-green-600" : "text-slate-500")}>
                            {hasUppercase ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span>One uppercase letter</span>
                          </div>
                          <div className={cn("flex items-center gap-2", hasLowercase ? "text-green-600" : "text-slate-500")}>
                            {hasLowercase ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span>One lowercase letter</span>
                          </div>
                          <div className={cn("flex items-center gap-2", hasNumber ? "text-green-600" : "text-slate-500")}>
                            {hasNumber ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span>One number</span>
                          </div>
                        </div>
                      )}
                      <FormMessage className="text-red-600 font-medium" />
                    </FormItem>
                  );
                }}
              />

              {/* Age Field */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Age *</span>
                      {getValidationIcon('age')}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25" 
                        className={cn(
                          getFieldState('age') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                          getFieldState('age') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                        )}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>You must be 18 or older</FormDescription>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />

              {/* Role Select */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Role *</span>
                      {getValidationIcon('role')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose your primary role</FormDescription>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />

              {/* Bio Textarea */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => {
                  const bioLength = form.watch('bio')?.length || 0;
                  const isOverLimit = bioLength > 500;
                  const isUnderMin = bioLength > 0 && bioLength < 10;
                  
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Bio *</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-normal",
                            isOverLimit && "text-red-600",
                            isUnderMin && "text-orange-600",
                            !isOverLimit && !isUnderMin && bioLength >= 10 && "text-green-600"
                          )}>
                            {bioLength}/500
                          </span>
                          {getValidationIcon('bio')}
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little about yourself..."
                          className={cn(
                            "resize-none",
                            getFieldState('bio') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                            getFieldState('bio') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                          )}
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description (10-500 characters)
                      </FormDescription>
                      <FormMessage className="text-red-600 font-medium" />
                    </FormItem>
                  );
                }}
              />

              {/* Terms Checkbox */}
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className={cn(
                    "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4",
                    getFieldState('terms') === 'error' && 'border-red-500 bg-red-50'
                  )}>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none flex-1">
                      <FormLabel>Accept terms and conditions *</FormLabel>
                      <FormDescription>
                        You agree to our Terms of Service and Privacy Policy
                      </FormDescription>
                      <FormMessage className="text-red-600 font-medium" />
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting || !form.formState.isValid}
                >
                  {form.formState.isSubmitting ? 'Submitting...' : 'Submit Form'}
                </Button>
                {!form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 && (
                  <p className="text-sm text-center text-orange-600">
                    Please fix the errors above to submit the form
                  </p>
                )}
              </div>
            </form>
          </Form>

          {/* Display submitted data */}
          {submitted && formData && (
            <div className="mt-8 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">
                Submitted Data:
              </h3>
              <pre className="text-sm text-slate-700 overflow-x-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```