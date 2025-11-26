import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Store, ArrowRight, MapPin } from 'lucide-react'
import type { Franchise } from '@/types/api'

interface FranchiseCardProps {
  franchise: Franchise
}

export function FranchiseCard({ franchise }: FranchiseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{franchise.name}</CardTitle>
              <CardDescription className="mt-1">
                Code: {franchise.code}
              </CardDescription>
            </div>
          </div>
          <Badge variant={franchise.is_active ? 'default' : 'secondary'}>
            {franchise.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {franchise.address && (
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{franchise.address}</span>
          </div>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {franchise.description || 'No description provided'}
        </p>
        <Link to={`/companies/${franchise.parent_company_id}/franchises/${franchise.id}` as any}>
          <Button variant="outline" className="w-full">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

