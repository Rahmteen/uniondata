import { Flex, Box, Text } from '@chakra-ui/react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'md', gap: 2 },
    md: { icon: 32, text: 'lg', gap: 2.5 },
    lg: { icon: 48, text: '2xl', gap: 3 },
  }

  const { icon, text, gap } = sizes[size]

  return (
    <Flex align="center" gap={gap}>
      {/* Abstract logo mark - interconnected nodes representing "union" of data */}
      <Box position="relative" w={`${icon}px`} h={`${icon}px`}>
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff90e8" />
              <stop offset="100%" stopColor="#ff4bc6" />
            </linearGradient>
            <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff90e8" />
              <stop offset="50%" stopColor="#ffb8f0" />
              <stop offset="100%" stopColor="#ff90e8" />
            </linearGradient>
          </defs>
          
          {/* Main circular ring */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Inner abstract shape - representing connected data points */}
          <path
            d="M24 10 L34 18 L34 30 L24 38 L14 30 L14 18 Z"
            stroke="url(#logoGradient2)"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
          />
          
          {/* Center node */}
          <circle
            cx="24"
            cy="24"
            r="4"
            fill="url(#logoGradient)"
          />
          
          {/* Connection dots */}
          <circle cx="24" cy="10" r="2.5" fill="#ff90e8" />
          <circle cx="34" cy="18" r="2.5" fill="#ff90e8" />
          <circle cx="34" cy="30" r="2.5" fill="#ff90e8" />
          <circle cx="24" cy="38" r="2.5" fill="#ff90e8" />
          <circle cx="14" cy="30" r="2.5" fill="#ff90e8" />
          <circle cx="14" cy="18" r="2.5" fill="#ff90e8" />
        </svg>
      </Box>

      {showText && (
        <Text
          fontSize={text}
          fontWeight="700"
          color="secondary.900"
          letterSpacing="-0.03em"
        >
          Union
          <Text as="span" color="primary.400">
            Data
          </Text>
        </Text>
      )}
    </Flex>
  )
}

export default Logo

