import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Box,
  Text,
  HStack,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Skeleton,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Flex,
  Badge,
  VStack,
  IconButton,
} from '@chakra-ui/react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { WordCloud } from '@/components/WordCloud'

// Icons
const SearchIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </Icon>
)

const CalendarIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor" boxSize={4}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
  </Icon>
)

const CloseIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor" boxSize={5}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </Icon>
)

// Preset date ranges
const DATE_PRESETS = [
  { label: 'All Time', startDate: undefined, endDate: undefined },
  { label: 'First Term', startDate: '2017-01-20', endDate: '2021-01-20' },
  { label: 'Second Term', startDate: '2025-01-20', endDate: '2025-12-31' },
  { label: '2017', startDate: '2017-01-01', endDate: '2017-12-31' },
  { label: '2018', startDate: '2018-01-01', endDate: '2018-12-31' },
  { label: '2019', startDate: '2019-01-01', endDate: '2019-12-31' },
  { label: '2020', startDate: '2020-01-01', endDate: '2020-12-31' },
  { label: '2025', startDate: '2025-01-01', endDate: '2025-12-31' },
  { label: 'COVID Era', startDate: '2020-03-01', endDate: '2020-12-31' },
]

const HIDE_DELAY = 4000 // 4 seconds

function TrumpWordMap() {
  const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [activePreset, setActivePreset] = useState('All Time')
  const [controlsVisible, setControlsVisible] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Selectors
  const wordCloud = useAppSelector((state) => state.speechModel.wordCloud)
  const wordCloudLoading = useAppSelector((state) => state.speechModel.wordCloudLoading)
  const wordCloudError = useAppSelector((state) => state.speechModel.wordCloudError)
  const speechStats = useAppSelector((state) => state.speechModel.speechStats)
  const wordStats = useAppSelector((state) => state.speechModel.wordStats)
  const statsLoading = useAppSelector((state) => state.speechModel.statsLoading)
  const apiConnected = useAppSelector((state) => state.speechModel.apiConnected)
  const dateFilter = useAppSelector((state) => state.speechModel.dateFilter) || { startDate: undefined, endDate: undefined }
  const availableDateRange = useAppSelector((state) => state.speechModel.availableDateRange) || { minDate: null, maxDate: null }

  // Reset hide timer
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
    setControlsVisible(true)
    hideTimerRef.current = setTimeout(() => {
      if (!panelOpen) {
        setControlsVisible(false)
      }
    }, HIDE_DELAY)
  }, [panelOpen])

  // Mouse move handler
  const handleMouseMove = useCallback(() => {
    resetHideTimer()
  }, [resetHideTimer])

  // Initialize
  useEffect(() => {
    dispatch.speechModel.initializeData()
    resetHideTimer()
    
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [dispatch, resetHideTimer])

  // Keep controls visible when panel is open
  useEffect(() => {
    if (panelOpen) {
      setControlsVisible(true)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    } else {
      resetHideTimer()
    }
  }, [panelOpen, resetHideTimer])

  // Apply preset filter
  const applyPreset = useCallback((preset: typeof DATE_PRESETS[0]) => {
    setActivePreset(preset.label)
    setCustomStartDate(preset.startDate || '')
    setCustomEndDate(preset.endDate || '')
    dispatch.speechModel.applyDateFilter({
      startDate: preset.startDate,
      endDate: preset.endDate,
    })
  }, [dispatch])

  // Apply custom date filter
  const applyCustomFilter = useCallback(() => {
    if (customStartDate && customEndDate) {
      setActivePreset('Custom')
      dispatch.speechModel.applyDateFilter({
        startDate: customStartDate,
        endDate: customEndDate,
      })
    }
  }, [dispatch, customStartDate, customEndDate])

  // Word click
  const handleWordClick = (word: string) => {
    setSearchTerm(word)
    setPanelOpen(true)
  }

  // Filter words
  const filteredWords = searchTerm
    ? wordCloud.filter((w) =>
        w.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : wordCloud

  // Format date
  const formatDateRange = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) return null
    const start = dateFilter.startDate ? new Date(dateFilter.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
    const end = dateFilter.endDate ? new Date(dateFilter.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
    return `${start} — ${end}`
  }

  return (
    <Box
      ref={containerRef}
      position="fixed"
      top={{ base: '60px', lg: 0 }}
      left={{ base: 0, lg: '20%' }}
      right={0}
      bottom={0}
      bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      overflow="hidden"
      zIndex={1}
    >
      {/* Full-screen Word Cloud */}
      <WordCloud
        words={filteredWords}
        width={typeof window !== 'undefined' ? window.innerWidth * 0.8 : 1200}
        height={typeof window !== 'undefined' ? window.innerHeight : 800}
        onWordClick={handleWordClick}
        isLoading={wordCloudLoading}
        fullScreen
      />

      {/* Floating Controls - Top Bar */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        p={{ base: 3, md: 4 }}
        opacity={controlsVisible ? 1 : 0}
        transform={controlsVisible ? 'translateY(0)' : 'translateY(-20px)'}
        transition="all 0.3s ease"
        pointerEvents={controlsVisible ? 'auto' : 'none'}
        bg="linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)"
      >
        <Flex 
          justify="space-between" 
          align="center" 
          gap={{ base: 2, md: 4 }} 
          flexWrap="wrap"
        >
          {/* Title & Stats */}
          <VStack align="start" spacing={1}>
            <Text
              fontSize={{ base: 'md', md: 'xl' }}
              fontWeight="700"
              color="white"
              textShadow="0 2px 10px rgba(0,0,0,0.5)"
            >
              Trump Word Map
            </Text>
            
            {!statsLoading && speechStats && (
              <HStack spacing={2} flexWrap="wrap">
                <Badge bg="whiteAlpha.200" color="white" px={2} py={0.5} borderRadius="full" fontSize="xs">
                  {speechStats.total_speeches} speeches
                </Badge>
                <Badge bg="whiteAlpha.200" color="white" px={2} py={0.5} borderRadius="full" fontSize="xs">
                  {speechStats.total_words?.toLocaleString()} words
                </Badge>
                <Badge bg="whiteAlpha.200" color="white" px={2} py={0.5} borderRadius="full" fontSize="xs" display={{ base: 'none', sm: 'flex' }}>
                  {wordStats?.unique_words?.toLocaleString()} unique
                </Badge>
              </HStack>
            )}
          </VStack>

          {/* Search */}
          <InputGroup maxW={{ base: '150px', sm: '200px', md: '280px' }} size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="full"
              bg="whiteAlpha.200"
              border="1px solid"
              borderColor="whiteAlpha.300"
              color="white"
              _placeholder={{ color: 'whiteAlpha.600' }}
              _hover={{ borderColor: 'whiteAlpha.400' }}
              _focus={{ bg: 'whiteAlpha.300', borderColor: 'primary.400', boxShadow: 'none' }}
            />
          </InputGroup>
        </Flex>
      </Box>

      {/* Floating Controls - Bottom Panel */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={{ base: 2, md: 4 }}
        opacity={controlsVisible ? 1 : 0}
        transform={controlsVisible ? 'translateY(0)' : 'translateY(20px)'}
        transition="all 0.3s ease"
        pointerEvents={controlsVisible ? 'auto' : 'none'}
      >
        <Card
          bg="rgba(20, 20, 35, 0.85)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius={{ base: 'xl', md: '2xl' }}
          overflow="hidden"
        >
          <CardBody py={{ base: 2, md: 3 }} px={{ base: 3, md: 4 }}>
            <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
              {/* Date Filter Toggle */}
              <VStack align="stretch" spacing={3} w="100%">
                {/* Row 1: Preset Buttons */}
                <Flex align="center" gap={2} flexWrap="wrap">
                  <HStack spacing={2} flexShrink={0}>
                    <CalendarIcon />
                    <Text color="white" fontWeight="500" fontSize="sm" display={{ base: 'none', md: 'block' }}>Filter:</Text>
                  </HStack>
                  
                  <Flex gap={2} flexWrap="wrap">
                    {DATE_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        size="xs"
                        variant="solid"
                        bg={activePreset === preset.label ? 'primary.400' : 'whiteAlpha.300'}
                        color="white"
                        onClick={() => applyPreset(preset)}
                        borderRadius="full"
                        fontWeight={activePreset === preset.label ? '600' : '500'}
                        _hover={{ bg: activePreset === preset.label ? 'primary.500' : 'whiteAlpha.400' }}
                        _active={{ bg: activePreset === preset.label ? 'primary.600' : 'whiteAlpha.500' }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </Flex>
                </Flex>

                {/* Row 2: Custom Date Range */}
                <Flex align="center" gap={2} flexWrap="wrap">
                  <Text color="whiteAlpha.700" fontSize="xs" flexShrink={0}>Custom:</Text>
                  <Input
                    type="date"
                    size="xs"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    bg="whiteAlpha.300"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    borderRadius="lg"
                    w={{ base: '120px', md: '140px' }}
                    sx={{ colorScheme: 'dark' }}
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'primary.400', boxShadow: 'none' }}
                  />
                  <Text color="whiteAlpha.500" fontSize="xs">→</Text>
                  <Input
                    type="date"
                    size="xs"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    bg="whiteAlpha.300"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    borderRadius="lg"
                    w={{ base: '120px', md: '140px' }}
                    sx={{ colorScheme: 'dark' }}
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'primary.400', boxShadow: 'none' }}
                  />
                  <Button
                    size="xs"
                    bg="primary.400"
                    color="white"
                    onClick={applyCustomFilter}
                    isDisabled={!customStartDate || !customEndDate}
                    borderRadius="lg"
                    _hover={{ bg: 'primary.500' }}
                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    Apply
                  </Button>

                  {dateFilter.startDate && (
                    <Badge bg="primary.400" color="white" fontSize="xs" px={2} borderRadius="full">
                      {formatDateRange()}
                    </Badge>
                  )}
                </Flex>
              </VStack>
            </Flex>
          </CardBody>
        </Card>
      </Box>

      {/* API Warning Overlay */}
      {!apiConnected && !wordCloudLoading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={10}
        >
          <Alert
            status="warning"
            variant="solid"
            borderRadius="2xl"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            py={8}
            px={10}
            bg="whiteAlpha.200"
            backdropFilter="blur(20px)"
          >
            <AlertIcon boxSize={10} mr={0} mb={4} />
            <AlertTitle fontSize="lg" mb={2}>Backend Not Connected</AlertTitle>
            <AlertDescription maxW="sm">
              <Text mb={3}>Start the backend server:</Text>
              <Text
                as="code"
                display="block"
                bg="blackAlpha.300"
                p={2}
                borderRadius="md"
                fontSize="sm"
              >
                cd backend && npm run dev
              </Text>
            </AlertDescription>
            <Button
              mt={4}
              colorScheme="orange"
              onClick={() => dispatch.speechModel.initializeData()}
            >
              Retry Connection
            </Button>
          </Alert>
        </Box>
      )}

      {/* Word count indicator */}
      <Box
        position="absolute"
        bottom={{ base: 16, md: 20 }}
        right={{ base: 3, md: 6 }}
        opacity={controlsVisible ? 1 : 0.5}
        transition="opacity 0.3s ease"
      >
        <Badge
          bg="whiteAlpha.200"
          color="whiteAlpha.700"
          px={2}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
        >
          {filteredWords.length} words
        </Badge>
      </Box>

      {/* Instructions hint - hide on mobile */}
      {controlsVisible && (
        <Box
          position="absolute"
          bottom={{ base: 16, md: 20 }}
          left="50%"
          transform="translateX(-50%)"
          opacity={0.5}
          display={{ base: 'none', md: 'block' }}
        >
          <Text color="whiteAlpha.500" fontSize="xs">
            Click any word for details • Controls auto-hide
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default TrumpWordMap
