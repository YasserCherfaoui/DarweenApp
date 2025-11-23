import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import type { FranchisePricing } from '@/types/api'

interface FranchisePricingTableProps {
  pricing: FranchisePricing[]
  onEdit: (pricing: FranchisePricing) => void
  onDelete: (pricing: FranchisePricing) => void
}

export function FranchisePricingTable({ pricing, onEdit, onDelete }: FranchisePricingTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (pricing.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No custom pricing set for this franchise.</p>
        <p className="text-sm mt-2">All products use default pricing from the parent company.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variant</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Default Retail</TableHead>
            <TableHead>Custom Retail</TableHead>
            <TableHead>Default Wholesale</TableHead>
            <TableHead>Custom Wholesale</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricing.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.variant_name || 'Unknown Variant'}
              </TableCell>
              <TableCell>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {item.variant_sku}
                </code>
              </TableCell>
              <TableCell>{formatCurrency(item.default_retail_price)}</TableCell>
              <TableCell>
                {item.retail_price !== undefined && item.retail_price !== null ? (
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(item.retail_price)}
                  </span>
                ) : (
                  <Badge variant="outline">Using Default</Badge>
                )}
              </TableCell>
              <TableCell>{formatCurrency(item.default_wholesale_price)}</TableCell>
              <TableCell>
                {item.wholesale_price !== undefined && item.wholesale_price !== null ? (
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(item.wholesale_price)}
                  </span>
                ) : (
                  <Badge variant="outline">Using Default</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}




