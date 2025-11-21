import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLogo?: boolean
  message?: string
  className?: string
}

export function Loading({ 
  fullScreen = false, 
  size = 'md',
  showLogo = true,
  message,
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const logoSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  }

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {showLogo && (
        <img 
          src="/SVG/Darween.svg" 
          alt="Darween Logo" 
          className={cn("animate-pulse", logoSizeClasses[size])}
        />
      )}
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {content}
      </div>
    )
  }

  return content
}

