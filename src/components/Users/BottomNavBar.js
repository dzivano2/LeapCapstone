import React from 'react';
import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { FaHome, FaUser, FaSignOutAlt, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const BottomNavBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="gray.900"
      color="white"
      borderTop="1px solid gray"
      zIndex={1000}
      height="70px"
    >
      <Flex justify="space-around" align="center" height="100%">
        {/* Home */}
        <Flex direction="column" align="center" onClick={() => navigate('/user-dashboard')}>
          <IconButton
            aria-label="Home"
            icon={<FaHome />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Home</Text>
        </Flex>

        {/* Profile */}
        <Flex direction="column" align="center" onClick={() => navigate('/profile')}>
          <IconButton
            aria-label="Profile"
            icon={<FaUser />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Profile</Text>
        </Flex>

        {/* Chat Button */}
        <Flex direction="column" align="center" onClick={() => navigate('/chat')}>
          <IconButton
            aria-label="Chat"
            icon={<FaComments />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Chat</Text>
        </Flex>

        {/* Logout */}
        <Flex direction="column" align="center" onClick={() => logout()}>
          <IconButton
            aria-label="Logout"
            icon={<FaSignOutAlt />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Logout</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default BottomNavBar;
