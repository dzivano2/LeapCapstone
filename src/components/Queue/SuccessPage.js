import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Text, Flex, VStack, Heading, Button, useColorModeValue } from '@chakra-ui/react';
import {QRCodeCanvas} from 'qrcode.react';

const SuccessPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const barId = queryParams.get('barId');

  const qrValue = JSON.stringify({ userId, barId });

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
            Payment Successful! 🎉
          </Heading>

          {/* Description */}
          <Text fontSize="lg" color={textColor}>
            Thank you for your payment. Show this QR code to the employee to validate your spot.
          </Text>

          {/* QR Code */}
          <Flex
            justify="center"
            p={6}
            bg="white"
            borderRadius="md"
            boxShadow="md"
          >
            <QRCodeCanvas value={qrValue} size={200} />
          </Flex>

          {/* Additional Instructions */}
          <Text fontSize="sm" color="gray.500" mt={4}>
            Make sure your phone brightness is turned up for easy scanning.
          </Text>

          {/* Back to Home Button */}
          <Button
            colorScheme="blue"
            size="lg"
            width="100%"
            mt={6}
            onClick={() => (window.location.href = '/')}
          >
            Back to Home
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default SuccessPage;