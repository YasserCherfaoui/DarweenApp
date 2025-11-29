export type ColorThemeId = 
  | 'default'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'pink'
  | 'indigo'
  | 'teal'
  | 'amber'

export interface ColorTheme {
  id: ColorThemeId
  name: string
  light: {
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
    background: string
  }
  dark: {
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
    background: string
  }
}

export const colorThemes: ColorTheme[] = [
  {
    id: 'default',
    name: 'Default',
    light: {
      primary: 'oklch(0.21 0.006 285.885)',
      primaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.967 0.001 286.375)',
      accentForeground: 'oklch(0.21 0.006 285.885)',
      background: 'oklch(1 0 0)',
    },
    dark: {
      primary: 'oklch(0.985 0 0)',
      primaryForeground: 'oklch(0.21 0.006 285.885)',
      accent: 'oklch(0.274 0.006 286.033)',
      accentForeground: 'oklch(0.985 0 0)',
      background: 'oklch(0.141 0.005 285.823)',
    },
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    light: {
      primary: 'oklch(0.45 0.15 240)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.95 0.02 240)',
      accentForeground: 'oklch(0.25 0.1 240)',
      background: 'oklch(0.98 0.005 240)',
    },
    dark: {
      primary: 'oklch(0.65 0.2 240)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.3 0.08 240)',
      accentForeground: 'oklch(0.9 0.02 240)',
      background: 'oklch(0.15 0.01 240)',
    },
  },
  {
    id: 'green',
    name: 'Forest Green',
    light: {
      primary: 'oklch(0.42 0.14 150)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.95 0.02 150)',
      accentForeground: 'oklch(0.25 0.1 150)',
      background: 'oklch(0.98 0.005 150)',
    },
    dark: {
      primary: 'oklch(0.62 0.18 150)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.3 0.08 150)',
      accentForeground: 'oklch(0.9 0.02 150)',
      background: 'oklch(0.15 0.01 150)',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    light: {
      primary: 'oklch(0.48 0.16 300)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.95 0.02 300)',
      accentForeground: 'oklch(0.25 0.1 300)',
      background: 'oklch(0.98 0.005 300)',
    },
    dark: {
      primary: 'oklch(0.68 0.22 300)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.3 0.08 300)',
      accentForeground: 'oklch(0.9 0.02 300)',
      background: 'oklch(0.15 0.01 300)',
    },
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    light: {
      primary: 'oklch(0.55 0.18 60)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.95 0.02 60)',
      accentForeground: 'oklch(0.25 0.1 60)',
      background: 'oklch(0.98 0.005 60)',
    },
    dark: {
      primary: 'oklch(0.72 0.2 60)',
      primaryForeground: 'oklch(0.15 0 0)',
      accent: 'oklch(0.3 0.08 60)',
      accentForeground: 'oklch(0.9 0.02 60)',
      background: 'oklch(0.15 0.01 60)',
    },
  },
  {
    id: 'red',
    name: 'Crimson Red',
    light: {
      primary: 'oklch(0.5 0.2 25)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.95 0.02 25)',
      accentForeground: 'oklch(0.25 0.1 25)',
      background: 'oklch(0.98 0.005 25)',
    },
    dark: {
      primary: 'oklch(0.65 0.22 25)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.3 0.08 25)',
      accentForeground: 'oklch(0.9 0.02 25)',
      background: 'oklch(0.15 0.01 25)',
    },
  },
  {
    id: 'pink',
    name: 'Rose Pink',
    light: {
      primary: 'oklch(0.58 0.16 340)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.95 0.02 340)',
      accentForeground: 'oklch(0.25 0.1 340)',
      background: 'oklch(0.98 0.005 340)',
    },
    dark: {
      primary: 'oklch(0.72 0.2 340)',
      primaryForeground: 'oklch(0.15 0 0)',
      accent: 'oklch(0.3 0.08 340)',
      accentForeground: 'oklch(0.9 0.02 340)',
      background: 'oklch(0.15 0.01 340)',
    },
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    light: {
      primary: 'oklch(0.43 0.14 270)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.95 0.02 270)',
      accentForeground: 'oklch(0.25 0.1 270)',
      background: 'oklch(0.98 0.005 270)',
    },
    dark: {
      primary: 'oklch(0.64 0.2 270)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.3 0.08 270)',
      accentForeground: 'oklch(0.9 0.02 270)',
      background: 'oklch(0.15 0.01 270)',
    },
  },
  {
    id: 'teal',
    name: 'Turquoise Teal',
    light: {
      primary: 'oklch(0.48 0.15 200)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.95 0.02 200)',
      accentForeground: 'oklch(0.25 0.1 200)',
      background: 'oklch(0.98 0.005 200)',
    },
    dark: {
      primary: 'oklch(0.68 0.2 200)',
      primaryForeground: 'oklch(0.98 0 0)',
      accent: 'oklch(0.3 0.08 200)',
      accentForeground: 'oklch(0.9 0.02 200)',
      background: 'oklch(0.15 0.01 200)',
    },
  },
  {
    id: 'amber',
    name: 'Golden Amber',
    light: {
      primary: 'oklch(0.62 0.16 75)',
      primaryForeground: 'oklch(0.15 0 0)',
      accent: 'oklch(0.95 0.02 75)',
      accentForeground: 'oklch(0.25 0.1 75)',
      background: 'oklch(0.98 0.005 75)',
    },
    dark: {
      primary: 'oklch(0.78 0.18 75)',
      primaryForeground: 'oklch(0.15 0 0)',
      accent: 'oklch(0.3 0.08 75)',
      accentForeground: 'oklch(0.9 0.02 75)',
      background: 'oklch(0.15 0.01 75)',
    },
  },
]

export const defaultColorTheme: ColorThemeId = 'default'

export function getColorTheme(id: ColorThemeId): ColorTheme {
  return colorThemes.find(theme => theme.id === id) || colorThemes[0]
}

