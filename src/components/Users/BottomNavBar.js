import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { FaHome, FaUser, FaSignOutAlt, FaMapMarkerAlt, FaComments, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const BottomNavBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

        {/* Map Icon */}
        <Flex direction="column" align="center" onClick={() => navigate('/map')}>
          <IconButton
            aria-label="Map"
            icon={<FaMapMarkerAlt />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Map</Text>
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

        {/* Settings Button */}
        <Flex direction="column" align="center" onClick={onOpen}>
          <IconButton
            aria-label="Settings"
            icon={<FaCog />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Settings</Text>
        </Flex>
      </Flex>

      {/* Settings Popup */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          bg="gray.800"
          borderRadius="lg"
          boxShadow="lg"
          padding="20px"
        >
          <ModalHeader color="white" fontWeight="bold" textAlign="center">
            Settings
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody display="flex" flexDirection="column" gap={4}>
            {/* View Profile Button */}
            <Button
              onClick={() => {
                navigate('/profile');
                onClose();
              }}
              bg="gray.700"
              color="white"
              _hover={{ bg: 'gray.600' }}
              _active={{ bg: 'gray.500' }}
              borderRadius="full"
              padding="12px"
              fontSize="md"
              fontWeight="medium"
              transition="0.2s ease"
            >
              View Profile
            </Button>

            {/* Logout Button */}
            <Button
              onClick={() => {
                logout();
                
                onClose();
              }}
              bg="red.600"
              color="white"
              _hover={{ bg: 'red.500' }}
              _active={{ bg: 'red.400' }}
              borderRadius="full"
              padding="12px"
              fontSize="md"
              fontWeight="medium"
              transition="0.2s ease"
            >
              Logout
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BottomNavBar;

