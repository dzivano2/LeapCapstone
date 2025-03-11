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
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminBottomNavBar from './Admin/AdminBottomNavBar';

const AdminDashboard = () => {
  const [bars, setBars] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const { token, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/bars', {
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
    setLocation('');
    setDescription('');
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5001/api/bars', formData, {
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
    } catch (error) {
      console.error('Error creating venue:', error);
      toast({
        title: 'Failed to create venue.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewBar = (barId) => {
    navigate(`/bar/${barId}`);
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
                src={`http://localhost:5001${bar.imageUrl}`}
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
                  <strong>Location:</strong> {bar.location}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  <strong>Description:</strong> {bar.description}
                </Text>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Flex>

      {/* Bottom Navigation Bar */}
      <AdminBottomNavBar onOpenAddVenue={onOpen} />

      {/* Modal for Adding a New Venue */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Venue</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Box mb={4}>
                <Input
                  placeholder="Venue Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Box>
              <Box mb={4}>
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </Box>
              <Box mb={4}>
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Box>
              <Box mb={4}>
                <Input type="file" onChange={(e) => setImage(e.target.files[0])} required />
              </Box>
              <Button type="submit" colorScheme="blue">
                Create New Venue
              </Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
