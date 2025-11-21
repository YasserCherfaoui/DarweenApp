import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash, Tag, Tags } from 'lucide-react'
import type { Product } from '@/types/api'
import { GenerateLabelDialog } from './GenerateLabelDialog'
import { GenerateBulkLabelsDialogEnhanced } from './GenerateBulkLabelsDialogEnhanced'

interface ProductsTableProps {
  products: Product[]
  companyId: number
  onDelete?: (productId: number) => void
}

export function ProductsTable({ products, companyId, onDelete }: ProductsTableProps) {
  const [labelDialogOpen, setLabelDialogOpen] = React.useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

  const handleGenerateLabel = (product: Product) => {
    setSelectedProduct(product)
    setLabelDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-3">
        {products.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDialogOpen(true)}
            >
              <Tags className="mr-2 h-4 w-4" />
              Bulk Generate Labels
            </Button>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Retail Price</TableHead>
                <TableHead>Wholesale Price</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>${product.base_retail_price.toFixed(2)}</TableCell>
                    <TableCell>${product.base_wholesale_price.toFixed(2)}</TableCell>
                    <TableCell>{product.variants?.length || 0}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleGenerateLabel(product)}
                          title="Generate Label"
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                        <Link to={`/companies/${companyId}/products/${product.id}`}>
                          <Button variant="ghost" size="icon-sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/companies/${companyId}/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon-sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(product.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedProduct && (
        <GenerateLabelDialog
          open={labelDialogOpen}
          onOpenChange={setLabelDialogOpen}
          companyId={companyId}
          productId={selectedProduct.id}
          sku={selectedProduct.sku}
          itemName={selectedProduct.name}
        />
      )}

      <GenerateBulkLabelsDialogEnhanced
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        companyId={companyId}
        products={products}
      />
    </>
  )
}



