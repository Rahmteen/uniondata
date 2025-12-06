import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// Gumroad-inspired color palette
const colors = {
  // Core
  white: '#ffffff',
  black: '#000000',
  
  // Primary - Gumroad Pink
  primary: {
    50: '#fff5fa',
    100: '#ffe5f3',
    200: '#ffc2e5',
    300: '#ff90e8',  // Gumroad's signature pink
    400: '#ff6bd7',
    500: '#ff4bc6',
    600: '#e63baf',
    700: '#cc2b98',
    800: '#a62080',
    900: '#801668',
  },
  
  // Secondary - Dark grays for text
  secondary: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Tertiary - Accent colors
  tertiary: {
    yellow: '#ffdc58',
    green: '#23a094',
    blue: '#4d9fff',
    purple: '#9068be',
  },
  
  // Surface colors
  surface: {
    light: '#ffffff',
    muted: '#fafafa',
    card: '#ffffff',
    border: '#f0f0f0',
  },
}

const fonts = {
  heading: `"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  body: `"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
}

const styles = {
  global: {
    body: {
      bg: 'white',
      color: 'secondary.800',
      letterSpacing: '-0.01em',
    },
  },
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: '12px',
      letterSpacing: '-0.01em',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    sizes: {
      md: {
        px: 5,
        py: 2.5,
        fontSize: 'sm',
      },
      lg: {
        px: 6,
        py: 3,
        fontSize: 'md',
      },
    },
    variants: {
      solid: {
        bg: 'secondary.900',
        color: 'white',
        _hover: {
          bg: 'secondary.800',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
      pink: {
        bg: 'primary.300',
        color: 'secondary.900',
        _hover: {
          bg: 'primary.400',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
      },
      outline: {
        borderColor: 'secondary.200',
        borderWidth: '1.5px',
        color: 'secondary.800',
        _hover: {
          bg: 'secondary.50',
          borderColor: 'secondary.300',
        },
      },
      ghost: {
        color: 'secondary.600',
        _hover: {
          bg: 'secondary.100',
          color: 'secondary.900',
        },
      },
    },
    defaultProps: {
      variant: 'solid',
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: '2xl',
        border: '1px solid',
        borderColor: 'surface.border',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        overflow: 'hidden',
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: '700',
      color: 'secondary.900',
      letterSpacing: '-0.02em',
    },
  },
  Text: {
    baseStyle: {
      color: 'secondary.600',
      lineHeight: '1.6',
    },
  },
  Divider: {
    baseStyle: {
      borderColor: 'surface.border',
    },
  },
}

export const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
})
