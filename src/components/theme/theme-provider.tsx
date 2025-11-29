import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'
import { ColorThemeInitializer } from './ColorThemeInitializer'

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ColorThemeInitializer>
        {children}
      </ColorThemeInitializer>
    </NextThemesProvider>
  )
}

