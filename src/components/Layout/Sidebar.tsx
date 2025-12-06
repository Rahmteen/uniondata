import { Box, VStack, Button, Divider, Flex } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Logo } from '@/components/Logo'
import { navItems } from './navItems'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Box
      as="nav"
      pos="fixed"
      left={0}
      top={0}
      w="20%"
      h="100vh"
      bg="white"
      borderRight="1px"
      borderColor="surface.border"
      py={6}
      px={5}
      overflowY="auto"
    >
      <Flex direction="column" h="full">
        {/* Logo */}
        <Box mb={8} px={1}>
          <Logo size="md" />
        </Box>

        <Divider mb={6} />

        {/* Navigation Items */}
        <VStack spacing={1} align="stretch" flex={1}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Button
                key={item.path}
                variant="ghost"
                bg={isActive ? 'primary.50' : 'transparent'}
                color={isActive ? 'secondary.900' : 'secondary.500'}
                justifyContent="flex-start"
                leftIcon={
                  <Box color={isActive ? 'primary.400' : 'secondary.400'}>
                    {item.icon}
                  </Box>
                }
                onClick={() => navigate(item.path)}
                size="md"
                fontWeight={isActive ? '600' : '500'}
                borderRadius="xl"
                px={4}
                py={6}
                _hover={{
                  bg: isActive ? 'primary.100' : 'secondary.50',
                  color: 'secondary.900',
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </VStack>

        {/* Footer */}
        <Box pt={4} borderTop="1px" borderColor="surface.border">
          <Box
            fontSize="xs"
            color="secondary.400"
            textAlign="center"
            fontWeight="500"
          >
            v0.0.1
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

export default Sidebar
