import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

interface NotFoundProps {
  title?: string
  message?: string
  showBackButton?: boolean
  backTo?: string
  backLabel?: string
}

export function NotFound({
  title = 'Page Not Found',
  message = "Sorry, we couldn't find the page you're looking for.",
  showBackButton = true,
  backTo = '/',
  backLabel = 'Go back home'
}: NotFoundProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <img 
            src="/SVG/Darween.svg" 
            alt="Darween Logo" 
            className="h-24 w-24 opacity-50 dark:invert"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        {showBackButton && (
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to={backTo}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}


