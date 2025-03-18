import React, { useState } from 'react';
import { Box, Input, Button, VStack, Text, Flex, IconButton } from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import BottomNavBar from '../Users/BottomNavBar';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to state immediately for faster feedback
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5001/api/chat', {
        userId: user._id,
        message: message,
      });

      setMessages((prev) => [...prev, { text: res.data.response.kwargs.content, isUser: false }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { text: 'Error processing request.', isUser: false }]);
    }
  };

  return (
    <Box
      bg="gray.100"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      p={4}
      pb="80px" // Add padding to avoid overlap with the bottom nav
    >
      {/* Chat Header */}
      <Box bg="gray.900" color="white" p={4} borderRadius="md" textAlign="center" boxShadow="md">
        <Text fontSize="xl" fontWeight="bold">
          AI Chat Assistant
        </Text>
      </Box>

      {/* Messages Container */}
      <Flex
        direction="column"
        overflowY="auto"
        flex="1"
        mt={4}
        gap={3}
        px={2}
        py={2}
        borderRadius="md"
        bg="white"
        boxShadow="md"
        maxH="70vh"
      >
        {messages.map((msg, index) => (
          <Flex
            key={index}
            justify={msg.isUser ? 'flex-end' : 'flex-start'}
          >
            <Box
              bg={msg.isUser ? 'blue.500' : 'gray.200'}
              color={msg.isUser ? 'white' : 'black'}
              px={4}
              py={2}
              borderRadius="md"
              maxW="75%"
              boxShadow="sm"
            >
              <Text fontSize="md">{msg.text}</Text>
            </Box>
          </Flex>
        ))}
      </Flex>

      {/* Chat Input */}
      <Flex mt={4} gap={2}>
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          bg="white"
          borderRadius="md"
          boxShadow="md"
          flex="1"
        />
        <IconButton
          icon={<FaPaperPlane />}
          colorScheme="blue"
          onClick={handleSendMessage}
          isDisabled={!message.trim()}
          boxShadow="md"
        />
      </Flex>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </Box>
  );
};

export default Chat;

