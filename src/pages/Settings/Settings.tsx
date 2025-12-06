import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Divider,
} from '@chakra-ui/react'

function Settings() {
  return (
    <Box maxW="600px">
      <Heading size="lg" mb={2}>
        Settings
      </Heading>
      <Text color="secondary.500" mb={8}>
        Configure your application preferences.
      </Text>

      <Card>
        <CardHeader pb={2}>
          <Heading size="md">Preferences</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={5} align="stretch">
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <FormLabel mb={0} color="secondary.800" fontWeight="500">
                  Enable notifications
                </FormLabel>
                <Text fontSize="sm" color="secondary.400">
                  Receive updates about your data
                </Text>
              </Box>
              <Switch colorScheme="pink" size="lg" />
            </FormControl>

            <Divider />

            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <FormLabel mb={0} color="secondary.800" fontWeight="500">
                  Dark mode
                </FormLabel>
                <Text fontSize="sm" color="secondary.400">
                  Switch to dark theme
                </Text>
              </Box>
              <Switch colorScheme="pink" size="lg" />
            </FormControl>

            <Divider />

            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <FormLabel mb={0} color="secondary.800" fontWeight="500">
                  Auto-save
                </FormLabel>
                <Text fontSize="sm" color="secondary.400">
                  Automatically save your progress
                </Text>
              </Box>
              <Switch colorScheme="pink" size="lg" defaultChecked />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default Settings
