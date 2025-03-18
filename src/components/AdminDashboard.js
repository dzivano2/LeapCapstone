import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Input,
  Textarea,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Grid,
  GridItem,
  Image,
  useToast,
  FormControl,
  FormLabel,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminBottomNavBar from './Admin/AdminBottomNavBar';

const AdminDashboard = () => {
  const [bars, setBars] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const { token, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBarId, setSelectedBarId] = useState(null); // Store the selected bar ID
  const navigate = useNavigate();
  const toast = useToast();
  const googleMapsApiKey = 'AIzaSyD5Qx5qCtmL8eqgbx6ccp9ONQnEzeBRf3Q'; // Replace with your API KEY!!!

  const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5001'
    : 'https://leapbackend.onrender.com';

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBars(response.data);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    fetchBars();
  }, [token]);

  const resetForm = () => {
    setName('');
    setAddress('');
    setDescription('');
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
      );

      if (geocodeResponse.data.status === 'OK' && geocodeResponse.data.results.length > 0) {
        const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('address', address);
        formData.append('description', description);
        formData.append('image', image);
        formData.append('location[type]', 'Point');
        formData.append('location[coordinates][0]', lng); // Longitude first!
        formData.append('location[coordinates][1]', lat); // Latitude second

        const response = await axios.post(`${API_URL}/api/bars`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        setBars([...bars, response.data]);
        resetForm();
        onClose();
        toast({
          title: 'Venue created successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Geocoding Error',
          description: `Could not find coordinates for the address: ${address}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return; // Stop if geocoding fails
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "An unexpected error occurred.";

      if (error.response) {
        errorMessage = error.response.data.errors
          ? error.response.data.errors.map((e) => e.msg).join(', ')
          : "Server Error";
      } else if (error.message && error.message.includes("Geocoding error")) {
        errorMessage = "Geocoding failed. Please check the address.";
      } else if (error.request) {
        errorMessage = "No response from server";
      } else {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleViewBar = (barId) => {
    navigate(`/bar/${barId}`);
  };

  const handleRemoveBar = async () => {
    try {
      await axios.delete(`${API_URL}/api/bars/${selectedBarId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBars(bars.filter(bar => bar._id !== selectedBarId)); // Remove bar from local state
      toast({
        title: 'Venue removed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose(); // Close the modal after deletion
    } catch (error) {
      toast({
        title: 'Failed to delete venue.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOpenDeleteModal = (barId) => {
    setSelectedBarId(barId);
    onOpen();
  };

  return (
    <Box position="relative" minHeight="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="gray.900" width="100%" py={4} px={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg" color="white">
          Admin Dashboard
        </Heading>
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction="column" bg="gray.100" p={6}>
        <Heading size="lg" mb={6} color="gray.700" textAlign="center">
          Manage Your Venues
        </Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} pb="80px">
          {bars.map((bar) => (
            <GridItem
              key={bar._id}
              bg="white"
              shadow="md"
              borderRadius="md"
              overflow="hidden"
              cursor="pointer"
              onClick={() => handleViewBar(bar._id)}
            >
              <Image
                src={`${API_URL}${bar.imageUrl}`}
                alt={bar.name}
                width="100%"
                height="200px"
                objectFit="cover"
              />
              <Box p={4}>
                <Heading fontSize="xl" color="gray.800">
                  {bar.name}
                </Heading>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  <strong>Location:</strong> {bar.address}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  <strong>Description:</strong> {bar.description}
                </Text>
                
                {/* Move the Remove button down and replace with a trash icon */}
                <Box display="flex" justifyContent="flex-end" mt={4}>
                  <IconButton
                    aria-label="Remove Bar"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="gray"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the grid item click
                      handleOpenDeleteModal(bar._id); // Open the delete confirmation modal
                    }}
                  />
                </Box>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Flex>

      {/* Bottom Navigation Bar */}
      <AdminBottomNavBar onOpenAddVenue={onOpen} />

      {/* Modal for Deleting a Venue */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Are you sure you want to delete this venue?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Once deleted, this action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleRemoveBar}>
              Delete Venue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
