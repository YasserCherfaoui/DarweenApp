import React from 'react'
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
import { Edit, Trash, Tag, Tags } from 'lucide-react'
import type { ProductVariant } from '@/types/api'
import { GenerateLabelDialog } from './GenerateLabelDialog'
import { GenerateBulkLabelsDialog } from './GenerateBulkLabelsDialog'

interface ProductVariantsTableProps {
  variants: ProductVariant[]
  companyId: number
  productId: number
  onEdit?: (variant: ProductVariant) => void
  onDelete?: (variantId: number) => void
}

export function ProductVariantsTable({
  variants,
  companyId,
  productId,
  onEdit,
  onDelete,
}: ProductVariantsTableProps) {
  const [labelDialogOpen, setLabelDialogOpen] = React.useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null)

  const handleGenerateLabel = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setLabelDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-3">
        {variants.length > 0 && (
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
                <TableHead>Attributes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No variants found
                  </TableCell>
                </TableRow>
              ) : (
                variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.name}</TableCell>
                    <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                    <TableCell>
                      {variant.retail_price !== undefined && variant.retail_price !== null 
                        ? `$${variant.retail_price.toFixed(2)}`
                        : <span className="text-gray-400">Parent</span>
                      }
                    </TableCell>
                    <TableCell>
                      {variant.wholesale_price !== undefined && variant.wholesale_price !== null 
                        ? `$${variant.wholesale_price.toFixed(2)}`
                        : <span className="text-gray-400">Parent</span>
                      }
                    </TableCell>
                    <TableCell>
                      {variant.attributes && Object.keys(variant.attributes).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(variant.attributes).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                        {variant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleGenerateLabel(variant)}
                          title="Generate Label"
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEdit(variant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(variant.id)}
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

      {selectedVariant && (
        <GenerateLabelDialog
          open={labelDialogOpen}
          onOpenChange={setLabelDialogOpen}
          companyId={companyId}
          productId={productId}
          variantId={selectedVariant.id}
          sku={selectedVariant.sku}
          itemName={selectedVariant.name}
        />
      )}

      <GenerateBulkLabelsDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        companyId={companyId}
        products={[]}
        variants={variants}
      />
    </>
  )
}



