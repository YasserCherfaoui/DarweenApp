import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type {
    ShopifyWebhookConfig,
    WooCommerceWebhookConfig,
} from '@/types/api'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface WebhookConfigsListProps {
  shopifyConfigs?: ShopifyWebhookConfig[]
  woocommerceConfigs?: WooCommerceWebhookConfig[]
  onEditShopify?: (config: ShopifyWebhookConfig) => void
  onEditWooCommerce?: (config: WooCommerceWebhookConfig) => void
  onDeleteShopify?: (config: ShopifyWebhookConfig) => void
  onDeleteWooCommerce?: (config: WooCommerceWebhookConfig) => void
  onCreateShopify?: () => void
  onCreateWooCommerce?: () => void
  isLoading?: boolean
}

export function WebhookConfigsList({
  shopifyConfigs = [],
  woocommerceConfigs = [],
  onEditShopify,
  onEditWooCommerce,
  onDeleteShopify,
  onDeleteWooCommerce,
  onCreateShopify,
  onCreateWooCommerce,
  isLoading: _isLoading = false,
}: WebhookConfigsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [configToDelete, setConfigToDelete] = useState<{
    type: 'shopify' | 'woocommerce'
    config: ShopifyWebhookConfig | WooCommerceWebhookConfig
  } | null>(null)

  const handleDeleteClick = (
    type: 'shopify' | 'woocommerce',
    config: ShopifyWebhookConfig | WooCommerceWebhookConfig
  ) => {
    setConfigToDelete({ type, config })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (configToDelete) {
      if (configToDelete.type === 'shopify' && onDeleteShopify) {
        onDeleteShopify(configToDelete.config as ShopifyWebhookConfig)
      } else if (configToDelete.type === 'woocommerce' && onDeleteWooCommerce) {
        onDeleteWooCommerce(configToDelete.config as WooCommerceWebhookConfig)
      }
      setDeleteDialogOpen(false)
      setConfigToDelete(null)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Shopify Configs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Shopify Webhooks</h3>
            {onCreateShopify && (
              <Button onClick={onCreateShopify} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Shopify Config
              </Button>
            )}
          </div>
          {shopifyConfigs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 border rounded-lg">
              <p>No Shopify webhook configurations yet</p>
              {onCreateShopify && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateShopify}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Config
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopifyConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        {config.store_domain}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={config.is_active ? 'default' : 'secondary'}
                        >
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(config.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {onEditShopify && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditShopify(config)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteShopify && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick('shopify', config)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* WooCommerce Configs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">WooCommerce Webhooks</h3>
            {onCreateWooCommerce && (
              <Button onClick={onCreateWooCommerce} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add WooCommerce Config
              </Button>
            )}
          </div>
          {woocommerceConfigs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 border rounded-lg">
              <p>No WooCommerce webhook configurations yet</p>
              {onCreateWooCommerce && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateWooCommerce}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Config
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {woocommerceConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        {config.store_url}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={config.is_active ? 'default' : 'secondary'}
                        >
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(config.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {onEditWooCommerce && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditWooCommerce(config)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteWooCommerce && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick('woocommerce', config)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook configuration? This action
              cannot be undone. Orders from this store will no longer be automatically
              imported.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

