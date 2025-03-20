import React from 'react';
import { Box, Text, Flex, VStack, Heading, Button, useColorModeValue } from '@chakra-ui/react';

const Cancel = () => {
  // Colors for light/dark mode
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      minHeight="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg={cardBgColor}
        borderRadius="lg"
        boxShadow="lg"
        p={8}
        maxW="md"
        width="100%"
        textAlign="center"
      >
        <VStack spacing={6}>
          {/* Heading */}
          <Heading as="h1" fontSize="3xl" color={headingColor} fontWeight="bold">
            Payment Cancelled 😔
          </Heading>

          {/* Description */}
          <Text fontSize="lg" color={textColor}>
            Your payment was not completed. If this was a mistake, you can try again.
          </Text>

          {/* Illustration (Optional) */}
          <Flex justify="center">
            <Text fontSize="6xl" role="img" aria-label="Sad Face">
              😞
            </Text>
          </Flex>

          {/* Back to Home Button */}
          <Button
            colorScheme="blue"
            size="lg"
            width="100%"
            mt={6}
            onClick={() => (window.location.href = '/user')}
          >
            Back to Home
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Cancel;