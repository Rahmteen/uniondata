import { Flex, Box, Text, VStack } from '@chakra-ui/react'

// Large decorative globe icon
const GlobeIcon = () => (
  <svg
    width="180"
    height="180"
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff90e8" />
        <stop offset="100%" stopColor="#ff4bc6" />
      </linearGradient>
      <linearGradient id="globeGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffb8f0" />
        <stop offset="100%" stopColor="#ff90e8" />
      </linearGradient>
    </defs>
    
    {/* Outer circle */}
    <circle
      cx="90"
      cy="90"
      r="85"
      stroke="url(#globeGradient)"
      strokeWidth="2"
      fill="none"
    />
    
    {/* Horizontal lines */}
    <ellipse
      cx="90"
      cy="90"
      rx="85"
      ry="30"
      stroke="url(#globeGradient2)"
      strokeWidth="1.5"
      fill="none"
    />
    <ellipse
      cx="90"
      cy="90"
      rx="85"
      ry="60"
      stroke="url(#globeGradient2)"
      strokeWidth="1.5"
      fill="none"
    />
    
    {/* Vertical meridian */}
    <ellipse
      cx="90"
      cy="90"
      rx="30"
      ry="85"
      stroke="url(#globeGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <ellipse
      cx="90"
      cy="90"
      rx="60"
      ry="85"
      stroke="url(#globeGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    
    {/* Center vertical line */}
    <line
      x1="90"
      y1="5"
      x2="90"
      y2="175"
      stroke="url(#globeGradient2)"
      strokeWidth="1.5"
    />
    
    {/* Center horizontal line */}
    <line
      x1="5"
      y1="90"
      x2="175"
      y2="90"
      stroke="url(#globeGradient2)"
      strokeWidth="1.5"
    />
    
    {/* Decorative dots at intersections */}
    <circle cx="90" cy="5" r="3" fill="#ff90e8" />
    <circle cx="90" cy="175" r="3" fill="#ff90e8" />
    <circle cx="5" cy="90" r="3" fill="#ff90e8" />
    <circle cx="175" cy="90" r="3" fill="#ff90e8" />
    <circle cx="90" cy="90" r="5" fill="url(#globeGradient)" />
  </svg>
)

function Home() {
  return (
    <Flex
      h="calc(100vh - 64px)"
      w="100%"
      align="center"
      justify="center"
      bg="white"
    >
      <VStack spacing={8}>
        <Box
          p={10}
          borderRadius="full"
          bg="linear-gradient(135deg, rgba(255,144,232,0.08) 0%, rgba(255,75,198,0.08) 100%)"
          transition="all 0.3s ease"
          _hover={{
            transform: 'scale(1.02)',
            bg: 'linear-gradient(135deg, rgba(255,144,232,0.12) 0%, rgba(255,75,198,0.12) 100%)',
          }}
        >
          <GlobeIcon />
        </Box>
        <Text
          fontSize="sm"
          color="secondary.400"
          fontWeight="500"
          letterSpacing="0.1em"
          textTransform="uppercase"
        >
          Global Data Insights
        </Text>
      </VStack>
    </Flex>
  )
}

export default Home
