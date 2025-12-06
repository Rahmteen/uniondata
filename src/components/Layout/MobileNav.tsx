import {
  Box,
  Flex,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Button,
  useDisclosure,
  Icon,
} from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Logo } from '@/components/Logo'
import { navItems } from './navItems'

// Simple hamburger icon
const HamburgerIcon = () => (
  <Icon viewBox="0 0 24 24" fill="currentColor" boxSize={5}>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </Icon>
)

function MobileNav() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Top Navbar */}
      <Box
        as="nav"
        pos="fixed"
        top={0}
        left={0}
        right={0}
        h="64px"
        bg="white"
        borderBottom="1px"
        borderColor="surface.border"
        zIndex="sticky"
        px={4}
      >
        <Flex h="full" align="center" justify="space-between">
          <Logo size="sm" />

          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            color="secondary.700"
            onClick={onOpen}
            borderRadius="xl"
          />
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <DrawerContent bg="white" borderLeftRadius="2xl">
          <DrawerCloseButton color="secondary.600" top={4} right={4} />
          <DrawerHeader pt={6} pb={4}>
            <Logo size="sm" />
          </DrawerHeader>

          <DrawerBody py={4}>
            <VStack spacing={1} align="stretch">
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
                    onClick={() => handleNavigation(item.path)}
                    size="lg"
                    fontWeight={isActive ? '600' : '500'}
                    w="full"
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default MobileNav
