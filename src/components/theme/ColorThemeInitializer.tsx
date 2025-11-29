import { useEffect } from 'react'
import { useColorTheme } from '@/hooks/use-color-theme'

/**
 * Component that initializes and applies the color theme
 * Should be placed inside ThemeProvider to access theme mode
 */
export function ColorThemeInitializer({ children }: { children: React.ReactNode }) {
  useColorTheme() // This hook handles all the color theme logic
  
  return <>{children}</>
}

