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
    CreateShopifyWebhookConfigRequest,
    ShopifyWebhookConfig,
    UpdateShopifyWebhookConfigRequest,
} from '@/types/api'
import { Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ShopifyWebhookConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateShopifyWebhookConfigRequest | UpdateShopifyWebhookConfigRequest) => void
  initialData?: ShopifyWebhookConfig
  isLoading?: boolean
}

export function ShopifyWebhookConfigDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ShopifyWebhookConfigDialogProps) {
  const [storeDomain, setStoreDomain] = useState(initialData?.store_domain || '')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)

  const webhookUrl = `${env.VITE_API_URL}/webhooks/shopify/orders`
  const isEditMode = !!initialData

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!storeDomain.trim()) {
      toast.error('Store domain is required')
      return
    }

    if (!isEditMode && !webhookSecret.trim()) {
      toast.error('Webhook secret is required')
      return
    }

    const data: CreateShopifyWebhookConfigRequest | UpdateShopifyWebhookConfigRequest = {
      store_domain: storeDomain.trim(),
      is_active: isActive,
    }

    if (!isEditMode || webhookSecret.trim()) {
      ;(data as CreateShopifyWebhookConfigRequest).webhook_secret = webhookSecret.trim()
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
            {isEditMode ? 'Edit Shopify Webhook Config' : 'Create Shopify Webhook Config'}
          </DialogTitle>
          <DialogDescription>
            Configure webhook settings to receive order updates from your Shopify store
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
                Go to your Shopify admin panel → Settings → Notifications → Webhooks
              </li>
              <li>
                Click "Create webhook" and configure:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>
                    <strong>Event:</strong> Order creation
                  </li>
                  <li>
                    <strong>Format:</strong> JSON
                  </li>
                  <li>
                    <strong>URL:</strong> Copy the webhook URL below
                  </li>
                </ul>
              </li>
              <li>
                In Shopify, go to Settings → Apps and sales channels → Develop apps → 
                Create an app → Configure Admin API scopes (read_orders)
              </li>
              <li>
                Copy the webhook signing secret from your app settings and paste it below
              </li>
              <li>
                Click "Save" to activate the webhook
              </li>
            </ol>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://help.shopify.com/en/manual/orders/notifications/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Learn more about Shopify webhooks
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
              Copy this URL and use it when creating the webhook in Shopify
            </p>
          </div>

          {/* Store Domain */}
          <div className="space-y-2">
            <Label htmlFor="store_domain">
              Store Domain <span className="text-red-500">*</span>
            </Label>
            <Input
              id="store_domain"
              value={storeDomain}
              onChange={(e) => setStoreDomain(e.target.value)}
              placeholder="your-store.myshopify.com"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your Shopify store domain (e.g., your-store.myshopify.com)
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
                : 'The webhook signing secret from your Shopify app settings'}
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

