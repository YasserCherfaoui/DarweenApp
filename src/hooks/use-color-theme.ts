import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import type { ColorThemeId } from '@/lib/color-themes'
import { defaultColorTheme, getColorTheme } from '@/lib/color-themes'

const COLOR_THEME_STORAGE_KEY = 'darween-color-theme'

export function useColorTheme() {
  const { theme: mode, resolvedTheme } = useTheme()
  const [colorThemeId, setColorThemeIdState] = useState<ColorThemeId>(defaultColorTheme)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ColorThemeId
        setColorThemeIdState(parsed)
      } catch {
        setColorThemeIdState(defaultColorTheme)
      }
    }
    setMounted(true)
  }, [])

  // Apply color theme to CSS variables
  useEffect(() => {
    if (!mounted) return

    const applyTheme = () => {
      const colorTheme = getColorTheme(colorThemeId)
      
      // Determine if dark mode is active - check resolvedTheme first, then DOM class
      const actuallyDark = resolvedTheme === 'dark' || 
        (!resolvedTheme && document.documentElement.classList.contains('dark'))
      
      const colors = actuallyDark ? colorTheme.dark : colorTheme.light

      // Update CSS variables immediately
      document.documentElement.style.setProperty('--primary', colors.primary)
      document.documentElement.style.setProperty('--primary-foreground', colors.primaryForeground)
      document.documentElement.style.setProperty('--accent', colors.accent)
      document.documentElement.style.setProperty('--accent-foreground', colors.accentForeground)
      document.documentElement.style.setProperty('--background', colors.background)

      // Also update sidebar colors
      document.documentElement.style.setProperty('--sidebar-primary', colors.primary)
      document.documentElement.style.setProperty('--sidebar-primary-foreground', colors.primaryForeground)
      document.documentElement.style.setProperty('--sidebar-accent', colors.accent)
      document.documentElement.style.setProperty('--sidebar-accent-foreground', colors.accentForeground)
    }

    // Apply immediately
    applyTheme()

    // Use MutationObserver to watch for class changes on documentElement
    // This catches when next-themes adds/removes the 'dark' class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          applyTheme()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Listen for system preference changes when in system mode
    let mediaQuery: MediaQueryList | null = null
    if (mode === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        // Small delay to ensure next-themes has updated the class
        setTimeout(applyTheme, 50)
      }
      mediaQuery.addEventListener('change', handleChange)
    }

    return () => {
      observer.disconnect()
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', () => {})
      }
    }
  }, [colorThemeId, resolvedTheme, mounted, mode])

  const setColorTheme = (themeId: ColorThemeId) => {
    setColorThemeIdState(themeId)
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, JSON.stringify(themeId))
  }

  return {
    colorThemeId,
    setColorTheme,
    mounted,
  }
}

