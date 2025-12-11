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
import type { Inventory } from '@/types/api'
import { Bell, History, Settings, TrendingDown, TrendingUp } from 'lucide-react'

interface InventoryTableProps {
  inventory: Inventory[]
  onAdjustStock?: (item: Inventory) => void
  onReserveStock?: (item: Inventory) => void
  onViewMovements?: (item: Inventory) => void
  onEditReorderPoint?: (item: Inventory) => void
  isLoading?: boolean
}

export function InventoryTable({
  inventory,
  onAdjustStock,
  onReserveStock,
  onViewMovements,
  onEditReorderPoint,
  isLoading = false,
}: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Total Stock</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Reorder Point</TableHead>
            <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                Loading inventory...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Total Stock</TableHead>
            <TableHead className="text-right">Reserved</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Reorder Point</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                No inventory items found
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.product_name || 'N/A'}
                </TableCell>
                <TableCell>
                  {item.variant_name || 'N/A'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {item.variant_sku || 'N/A'}
                </TableCell>
                <TableCell>
                  {item.franchise_name || (item.company_id ? 'Company HQ' : 'N/A')}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold">{item.stock}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-orange-600 font-medium">
                    {item.reserved_stock}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-green-600 font-semibold">
                    {item.available_stock}
                  </span>
                </TableCell>
              <TableCell className="text-right">
                {item.reorder_point ?? '—'}
              </TableCell>
                <TableCell>
                  <Badge variant={item.is_active ? 'default' : 'secondary'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                {item.available_stock <= 0 && item.is_active && (
                    <Badge variant="destructive" className="ml-2">
                      Out of Stock
                    </Badge>
                  )}
                {item.is_low_stock && item.available_stock > 0 && (
                  <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600">
                    Low Stock
                  </Badge>
                )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                  {onEditReorderPoint && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditReorderPoint(item)}
                      title="Set reorder point"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  )}
                    {onAdjustStock && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdjustStock(item)}
                        title="Adjust Stock"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    {onReserveStock && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReserveStock(item)}
                        title="Reserve/Release Stock"
                        disabled={item.available_stock <= 0}
                      >
                        {item.reserved_stock > 0 ? (
                          <TrendingDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {onViewMovements && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewMovements(item)}
                        title="View Movement History"
                      >
                        <History className="h-4 w-4" />
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
  )
}

