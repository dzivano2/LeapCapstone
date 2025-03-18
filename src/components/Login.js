import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, Flex, Text, IconButton } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login({ username, password });
      if (user) {
        if (user.userType === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.userType === 'employee') {
          navigate('/employee-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }
    } catch (error) {
      console.error('Login error object:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Invalid credentials.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Box
      position="relative"
      bg="gray.900"
      bgImage="url('/logomain.png')"
      bgSize="contain"
      bgRepeat="no-repeat"
      bgPosition="center"
      minHeight="100vh"
      py={20}
      px={6}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* ✅ Back Button (zIndex ensures it's above the overlay) */}
      <IconButton
        position="absolute"
        top="16px"
        left="16px"
        icon={<ArrowBackIcon />}
        colorScheme="whiteAlpha"
        onClick={() => navigate('/')}
        aria-label="Back"
        zIndex="3" // ✅ Raise above overlay
      />

      {/* Background Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="gray.900"
        opacity={0.8}
        zIndex="1" // ✅ Keep below content and back button
      />
      
      <Flex
        direction="column"
        align="center"
        maxW="md"
        w="100%"
        mx="auto"
        position="relative"
        zIndex="2" // ✅ Keep content above overlay
        color="white"
      >
        <Heading as="h1" size="xl" mb={6}>
          Login
        </Heading>
        {error && (
          <Text color="red.500" mb={4}>
            {error}
          </Text>
        )}
        <Box bg="gray.800" p={8} borderRadius="md" w="100%">
          <form onSubmit={handleSubmit}>
            <FormControl mb={4}>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <FormControl mb={6}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <Button
              type="submit"
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              w="full"
            >
              Login
            </Button>
          </form>
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;
