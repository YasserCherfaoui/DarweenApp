import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Company } from '@/types/api'

interface CompanyCardProps {
  company: Company
  isSelected?: boolean
}

export function CompanyCard({ company, isSelected = false }: CompanyCardProps) {
  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer",
        isSelected && "ring-2 ring-primary border-primary shadow-md"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg shrink-0",
              isSelected ? "bg-primary" : "bg-primary/10"
            )}>
              <Building2 className={cn(
                "h-6 w-6",
                isSelected ? "text-primary-foreground" : "text-primary"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl truncate">{company.name}</CardTitle>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
              <CardDescription className="mt-1">
                Code: {company.code}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant={company.is_active ? 'default' : 'secondary'}>
              {company.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {isSelected && (
              <Badge variant="outline" className="text-xs">
                Selected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {company.description || 'No description provided'}
        </p>
        <Link to={`/companies/${company.id}` as any}>
          <Button variant={isSelected ? "default" : "outline"} className="w-full">
            {isSelected ? "View Dashboard" : "View Details"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}



