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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <img 
            src="/SVG/Darween.svg" 
            alt="Darween Logo" 
            className="h-24 w-24 opacity-50"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
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


