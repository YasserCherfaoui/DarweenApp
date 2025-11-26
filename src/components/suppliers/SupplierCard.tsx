import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Supplier } from '@/types/api'
import { Link } from '@tanstack/react-router'
import { Building2, Edit, Mail, MapPin, Package, Phone, Trash2, User } from 'lucide-react'

interface SupplierCardProps {
  supplier: Supplier
  onDelete?: (id: number) => void
}

export function SupplierCard({ supplier, onDelete }: SupplierCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{supplier.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                  {supplier.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {supplier.product_count > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {supplier.product_count} {supplier.product_count === 1 ? 'Product' : 'Products'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {supplier.contact_person && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{supplier.contact_person}</span>
            </div>
          )}
          
          {supplier.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <a 
                href={`mailto:${supplier.email}`}
                className="hover:text-primary transition-colors"
              >
                {supplier.email}
              </a>
            </div>
          )}
          
          {supplier.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              <a 
                href={`tel:${supplier.phone}`}
                className="hover:text-primary transition-colors"
              >
                {supplier.phone}
              </a>
            </div>
          )}

          {supplier.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{supplier.address}</span>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Link
              to={`/companies/${supplier.company_id}/suppliers/${supplier.id}` as any}
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            <Link
              to={`/companies/${supplier.company_id}/suppliers/${supplier.id}/edit` as any}
            >
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{supplier.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(supplier.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



