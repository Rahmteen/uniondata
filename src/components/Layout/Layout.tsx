import { Box, Flex, useBreakpointValue } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

function Layout() {
  const isMobile = useBreakpointValue({ base: true, lg: false })

  return (
    <Box minH="100vh" bg="white">
      {isMobile ? (
        <>
          <MobileNav />
          <Box as="main" pt="64px" px={5} pb={6}>
            <Outlet />
          </Box>
        </>
      ) : (
        <Flex>
          <Sidebar />
          <Box
            as="main"
            ml="20%"
            w="80%"
            minH="100vh"
            p={8}
          >
            <Outlet />
          </Box>
        </Flex>
      )}
    </Box>
  )
}

export default Layout
