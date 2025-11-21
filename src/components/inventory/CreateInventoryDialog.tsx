import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateInventory } from '@/hooks/queries/use-inventory'
import { useProducts } from '@/hooks/queries/use-products'
import type { ProductVariant } from '@/types/api'

interface CreateInventoryDialogProps {
  companyId: number
  franchiseId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateInventoryDialog({
  companyId,
  franchiseId,
  open,
  onOpenChange,
}: CreateInventoryDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [stock, setStock] = useState<string>('')

  const { data: productsData } = useProducts(companyId, { page: 1, limit: 100 })
  const createInventory = useCreateInventory()

  const products = productsData?.data || []

  // Compute variants based on selected product (no state needed)
  const selectedProduct = selectedProductId 
    ? products.find((p) => p.id === Number(selectedProductId))
    : null
  const variants = selectedProduct?.variants || []

  // Handler to reset variant selection when product changes
  const handleProductChange = (value: string) => {
    setSelectedProductId(value)
    setSelectedVariantId('') // Reset variant selection
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedVariantId || !stock) return

    const stockValue = parseInt(stock, 10)
    if (isNaN(stockValue) || stockValue < 0) return

    try {
      await createInventory.mutateAsync({
        product_variant_id: Number(selectedVariantId),
        company_id: franchiseId ? undefined : companyId,
        franchise_id: franchiseId,
        stock: stockValue,
      })
      handleClose()
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const handleClose = () => {
    setSelectedProductId('')
    setSelectedVariantId('')
    setStock('')
    onOpenChange(false)
  }

  const isValid = selectedVariantId && stock && !isNaN(parseInt(stock, 10))

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Inventory Entry</DialogTitle>
            <DialogDescription>
              Add a new inventory entry for {franchiseId ? 'this franchise' : 'company headquarters'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select
                value={selectedProductId}
                onValueChange={handleProductChange}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-gray-500">
                      No products available
                    </div>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">Product Variant</Label>
              <Select
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
                disabled={!selectedProductId}
              >
                <SelectTrigger id="variant">
                  <SelectValue placeholder="Select a variant" />
                </SelectTrigger>
                <SelectContent>
                  {variants.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-gray-500">
                      {selectedProductId
                        ? 'No variants available for this product'
                        : 'Select a product first'}
                    </div>
                  ) : (
                    variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id.toString()}>
                        {variant.name} ({variant.sku})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="Enter initial stock quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> This will create a new inventory entry. Make sure the
                variant doesn't already have inventory at this location.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createInventory.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || createInventory.isPending}>
              {createInventory.isPending ? 'Creating...' : 'Create Inventory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

