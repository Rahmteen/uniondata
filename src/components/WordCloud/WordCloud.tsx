import { useMemo, useState, useEffect } from 'react'
import { Box, Spinner, Center, Text } from '@chakra-ui/react'

export interface WordCloudWord {
  text: string
  value: number
}

interface WordCloudProps {
  words: WordCloudWord[]
  width?: number
  height?: number
  onWordClick?: (word: string) => void
  isLoading?: boolean
  fullScreen?: boolean
}

// Color based on distance from center
const getColorByDistance = (distance: number): string => {
  const colors = [
    { pos: 0, color: '#ff4bc6' },
    { pos: 0.2, color: '#ff6bd7' },
    { pos: 0.4, color: '#ff90e8' },
    { pos: 0.6, color: '#e2c6ff' },
    { pos: 0.8, color: '#c4b5fd' },
    { pos: 1, color: '#a5b4fc' },
  ]
  
  for (let i = 0; i < colors.length - 1; i++) {
    if (distance >= colors[i].pos && distance <= colors[i + 1].pos) {
      return colors[i].color
    }
  }
  return colors[colors.length - 1].color
}

// Check if two rectangles overlap with padding
const rectanglesOverlap = (
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number },
  padding: number = 6
): boolean => {
  return !(
    r1.x + r1.width / 2 + padding < r2.x - r2.width / 2 - padding ||
    r1.x - r1.width / 2 - padding > r2.x + r2.width / 2 + padding ||
    r1.y + r1.height / 2 + padding < r2.y - r2.height / 2 - padding ||
    r1.y - r1.height / 2 - padding > r2.y + r2.height / 2 + padding
  )
}

// Estimate text dimensions
const estimateTextSize = (text: string, fontSize: number): { width: number; height: number } => {
  const avgCharWidth = fontSize * 0.55
  return {
    width: text.length * avgCharWidth,
    height: fontSize * 1.15,
  }
}

function WordCloud({
  words,
  width = 900,
  height = 700,
  onWordClick,
  isLoading = false,
  fullScreen = false,
}: WordCloudProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })

  // Update dimensions on window resize for fullscreen
  useEffect(() => {
    if (fullScreen) {
      const updateDimensions = () => {
        const isMobile = window.innerWidth < 768
        const isTablet = window.innerWidth < 1024
        setDimensions({
          width: window.innerWidth * (isTablet ? 1 : 0.8),
          height: window.innerHeight - (isMobile ? 60 : 0), // Account for mobile nav
        })
      }
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    } else {
      setDimensions({ width, height })
    }
  }, [fullScreen, width, height])

  const positionedWords = useMemo(() => {
    if (!words.length) return []

    const { width: w, height: h } = dimensions
    const sorted = [...words].sort((a, b) => b.value - a.value)
    // Adjust word count based on screen size
    let maxWords = 120
    if (fullScreen) {
      if (w < 500) maxWords = 80 // Mobile
      else if (w < 900) maxWords = 150 // Tablet
      else maxWords = 250 // Desktop
    }
    const displayWords = sorted.slice(0, Math.min(sorted.length, maxWords))

    const maxValue = displayWords[0]?.value || 1
    const minValue = displayWords[displayWords.length - 1]?.value || 1
    const valueRange = maxValue - minValue || 1

    const centerX = w / 2
    const centerY = h / 2
    const maxRadius = Math.min(w, h) * 0.45

    const placed: Array<{
      text: string
      value: number
      x: number
      y: number
      width: number
      height: number
      fontSize: number
      fontWeight: number
      color: string
      opacity: number
      distance: number
    }> = []

    // Responsive font sizing
    const isMobile = w < 500
    const isTablet = w < 900

    for (let i = 0; i < displayWords.length; i++) {
      const word = displayWords[i]
      const normalizedValue = (word.value - minValue) / valueRange
      
      // Font size: scale based on screen size
      let baseSize = fullScreen ? 10 : 11
      let maxSize = fullScreen ? 52 : 38
      
      if (isMobile) {
        baseSize = 8
        maxSize = 28
      } else if (isTablet) {
        baseSize = 9
        maxSize = 38
      }
      
      const fontSize = baseSize + normalizedValue * (maxSize - baseSize)
      const fontWeight = fontSize > 30 ? 700 : fontSize > 20 ? 600 : 500
      const { width: textWidth, height: textHeight } = estimateTextSize(word.text, fontSize)

      // Try to place the word using spiral search
      let placedSuccessfully = false
      const spiralStep = fullScreen ? 6 : 5
      
      for (let radius = 0; radius <= maxRadius && !placedSuccessfully; radius += spiralStep) {
        const angleOffset = (i * 0.618) * Math.PI * 2 // Golden ratio offset
        const circumference = 2 * Math.PI * Math.max(radius, 1)
        const steps = Math.max(Math.floor(circumference / 18), 12)
        
        for (let step = 0; step < steps && !placedSuccessfully; step++) {
          const angle = angleOffset + (step / steps) * Math.PI * 2
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          // Check bounds with padding
          const boundPadding = fullScreen ? 60 : 20
          if (
            x - textWidth / 2 < boundPadding ||
            x + textWidth / 2 > w - boundPadding ||
            y - textHeight / 2 < boundPadding ||
            y + textHeight / 2 > h - boundPadding
          ) {
            continue
          }

          // Check collision
          const candidate = { x, y, width: textWidth, height: textHeight }
          let hasCollision = false

          for (const p of placed) {
            if (rectanglesOverlap(candidate, p, fullScreen ? 8 : 6)) {
              hasCollision = true
              break
            }
          }

          if (!hasCollision) {
            const distance = radius / maxRadius
            placed.push({
              ...word,
              x,
              y,
              width: textWidth,
              height: textHeight,
              fontSize,
              fontWeight,
              color: getColorByDistance(distance),
              opacity: 0.65 + (1 - distance) * 0.35,
              distance,
            })
            placedSuccessfully = true
          }
        }
      }
    }

    return placed
  }, [words, dimensions, fullScreen])

  if (isLoading) {
    return (
      <Center h={dimensions.height} w="100%">
        <Spinner size="xl" color="primary.300" thickness="4px" />
      </Center>
    )
  }

  if (!words.length) {
    return (
      <Center h={dimensions.height} w="100%">
        <Text color="whiteAlpha.500" fontSize="lg">No word data available</Text>
      </Center>
    )
  }

  return (
    <Box
      w="100%"
      h={dimensions.height}
      position={fullScreen ? 'absolute' : 'relative'}
      top={0}
      left={0}
      overflow="hidden"
      borderRadius={fullScreen ? 0 : '2xl'}
      bg={fullScreen ? 'transparent' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}
      border={fullScreen ? 'none' : '1px solid'}
      borderColor="whiteAlpha.100"
    >
      {/* Radial glow */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={fullScreen ? '800px' : '500px'}
        h={fullScreen ? '800px' : '500px'}
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255,75,198,0.08) 0%, transparent 70%)"
        pointerEvents="none"
      />

      {/* Words */}
      <svg
        width="100%"
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ display: 'block' }}
      >
        {positionedWords.map((word, i) => (
          <text
            key={`${word.text}-${i}`}
            x={word.x}
            y={word.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: `${word.fontSize}px`,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: word.fontWeight,
              fill: word.color,
              cursor: onWordClick ? 'pointer' : 'default',
              opacity: hoveredWord
                ? hoveredWord === word.text
                  ? 1
                  : 0.15
                : word.opacity,
              transition: 'opacity 0.25s ease',
              textShadow: word.distance < 0.15 ? '0 0 30px rgba(255,75,198,0.6)' : 'none',
            }}
            onMouseEnter={() => setHoveredWord(word.text)}
            onMouseLeave={() => setHoveredWord(null)}
            onClick={() => onWordClick?.(word.text)}
          >
            {word.text}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredWord && (
        <Box
          position="absolute"
          bottom={fullScreen ? 100 : 6}
          left="50%"
          transform="translateX(-50%)"
          bg="whiteAlpha.200"
          backdropFilter="blur(10px)"
          color="white"
          px={5}
          py={3}
          borderRadius="xl"
          fontSize="md"
          fontWeight="600"
          boxShadow="lg"
          border="1px solid"
          borderColor="whiteAlpha.200"
          zIndex={20}
        >
          <Text as="span" color="primary.300">{hoveredWord}</Text>
          <Text as="span" color="whiteAlpha.700"> — </Text>
          <Text as="span">{words.find(w => w.text === hoveredWord)?.value.toLocaleString()}</Text>
          <Text as="span" color="whiteAlpha.600"> occurrences</Text>
        </Box>
      )}
    </Box>
  )
}

export default WordCloud
