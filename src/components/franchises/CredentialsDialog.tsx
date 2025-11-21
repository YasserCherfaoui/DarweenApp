import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { UserCredentials } from '@/types/api'

interface CredentialsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credentials: UserCredentials | null
  emailSent: boolean
}

export function CredentialsDialog({
  open,
  onOpenChange,
  credentials,
  emailSent,
}: CredentialsDialogProps) {
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null)

  const handleCopy = async (text: string, field: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!credentials) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Credentials</DialogTitle>
          <DialogDescription>
            A new user account has been created. Please copy and share these credentials securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Important: Save these credentials now. They will not be shown again.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Email
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={credentials.email}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(credentials.email, 'email')}
                >
                  {copiedField === 'email' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Password
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={credentials.password}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(credentials.password, 'password')}
                >
                  {copiedField === 'password' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {emailSent && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Credentials have been sent to the user's email address.
              </p>
            </div>
          )}

          {!emailSent && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ℹ️ Email was not sent. Please share these credentials with the user manually.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

