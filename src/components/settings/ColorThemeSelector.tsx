import { Palette, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useColorTheme } from '@/hooks/use-color-theme'
import { colorThemes, type ColorThemeId } from '@/lib/color-themes'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ColorThemeSelector() {
  const { colorThemeId, setColorTheme, mounted } = useColorTheme()
  const { theme: mode, resolvedTheme } = useTheme()
  const [currentMode, setCurrentMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const updateMode = () => {
      // Use resolvedTheme to get the actual theme being applied
      if (resolvedTheme === 'dark') {
        setCurrentMode('dark')
      } else if (resolvedTheme === 'light') {
        setCurrentMode('light')
      } else {
        // Fallback: check DOM class or system preference
        const isDark = document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches
        setCurrentMode(isDark ? 'dark' : 'light')
      }
    }

    updateMode()

    // Listen for system preference changes
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateMode)
      return () => mediaQuery.removeEventListener('change', updateMode)
    }
  }, [mode, resolvedTheme])

  // Also watch for DOM class changes to catch immediate theme switches
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setCurrentMode(isDark ? 'dark' : 'light')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Theme
        </CardTitle>
        <CardDescription>
          Choose your preferred color theme. Changes are saved locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Preview Mode</span>
            <span className="text-sm text-muted-foreground capitalize">{currentMode}</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {colorThemes.map((theme) => {
              const colors = currentMode === 'dark' ? theme.dark : theme.light
              const isSelected = colorThemeId === theme.id

              return (
                <button
                  key={theme.id}
                  onClick={() => setColorTheme(theme.id)}
                  className={cn(
                    'relative group p-4 rounded-lg border-2 transition-all hover:scale-105',
                    isSelected
                      ? 'border-primary shadow-lg'
                      : 'border-border hover:border-primary/50'
                  )}
                  aria-label={`Select ${theme.name} theme`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {/* Color preview */}
                    <div className="space-y-1.5">
                      <div
                        className="h-8 rounded border"
                        style={{ backgroundColor: colors.background }}
                      />
                      <div className="flex gap-1.5">
                        <div
                          className="h-8 flex-1 rounded"
                          style={{ backgroundColor: colors.primary }}
                        />
                        <div
                          className="h-8 flex-1 rounded"
                          style={{ backgroundColor: colors.accent }}
                        />
                      </div>
                    </div>
                    
                    {/* Theme name */}
                    <div className="text-center">
                      <p className="text-sm font-medium">{theme.name}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Tip: Switch between light and dark mode to see how each theme looks in both modes.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

