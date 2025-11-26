import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { env } from '@/env'
import type {
    CreateWooCommerceWebhookConfigRequest,
    UpdateWooCommerceWebhookConfigRequest,
    WooCommerceWebhookConfig,
} from '@/types/api'
import { Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface WooCommerceWebhookConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateWooCommerceWebhookConfigRequest | UpdateWooCommerceWebhookConfigRequest) => void
  initialData?: WooCommerceWebhookConfig
  isLoading?: boolean
}

export function WooCommerceWebhookConfigDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: WooCommerceWebhookConfigDialogProps) {
  const [storeUrl, setStoreUrl] = useState(initialData?.store_url || '')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)

  const webhookUrl = `${env.VITE_API_URL}/webhooks/woocommerce/orders`
  const isEditMode = !!initialData

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!storeUrl.trim()) {
      toast.error('Store URL is required')
      return
    }

    if (!isEditMode && !webhookSecret.trim()) {
      toast.error('Webhook secret is required')
      return
    }

    const data: CreateWooCommerceWebhookConfigRequest | UpdateWooCommerceWebhookConfigRequest = {
      store_url: storeUrl.trim(),
      is_active: isActive,
    }

    if (!isEditMode || webhookSecret.trim()) {
      ;(data as CreateWooCommerceWebhookConfigRequest).webhook_secret = webhookSecret.trim()
    }

    onSubmit(data)
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    toast.success('Webhook URL copied to clipboard')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit WooCommerce Webhook Config' : 'Create WooCommerce Webhook Config'}
          </DialogTitle>
          <DialogDescription>
            Configure webhook settings to receive order updates from your WooCommerce store
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Setup Guide */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Setup Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>
                Go to your WooCommerce admin panel → Settings → Advanced → Webhooks
              </li>
              <li>
                Click "Add webhook" and configure:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>
                    <strong>Name:</strong> Order Sync (or any name you prefer)
                  </li>
                  <li>
                    <strong>Status:</strong> Active
                  </li>
                  <li>
                    <strong>Topic:</strong> Order created
                  </li>
                  <li>
                    <strong>Delivery URL:</strong> Copy the webhook URL below
                  </li>
                  <li>
                    <strong>Secret:</strong> Generate a strong secret key (save it for step 4)
                  </li>
                </ul>
              </li>
              <li>
                Click "Save webhook" to create it
              </li>
              <li>
                Copy the secret key you generated and paste it in the "Webhook Secret" field below
              </li>
              <li>
                Click "Save" here to activate the webhook configuration
              </li>
            </ol>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://woocommerce.com/document/webhooks/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Learn more about WooCommerce webhooks
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyWebhookUrl}
                title="Copy webhook URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Copy this URL and use it as the Delivery URL when creating the webhook in WooCommerce
            </p>
          </div>

          {/* Store URL */}
          <div className="space-y-2">
            <Label htmlFor="store_url">
              Store URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="store_url"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="https://yourstore.com"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your WooCommerce store URL (e.g., https://yourstore.com)
            </p>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="webhook_secret">
              Webhook Secret {!isEditMode && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="webhook_secret"
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder={isEditMode ? 'Leave blank to keep current secret' : 'Enter webhook secret'}
              required={!isEditMode}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEditMode
                ? 'Leave blank to keep the current secret. Enter a new secret to update it.'
                : 'The secret key you generated when creating the webhook in WooCommerce'}
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable or disable this webhook configuration
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

