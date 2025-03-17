// src/components/Users/UserDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Input,
  Grid,
  GridItem,
  Text,
  Flex,
  VStack,
  Divider,
  Image,
  Button,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Users/BottomNavBar';
// import MapComponent from '../components/MapComponent'; // REMOVE: No longer needed here

const UserDashboard = () => {
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [search, setSearch] = useState('');
 //  const [showMap, setShowMap] = useState(false); // REMOVE: Map is now on its own page
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/bars/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBars(response.data);
        setFilteredBars(response.data);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    fetchBars();
  }, [token]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    const filtered = bars.filter(
      (bar) =>
        bar.name.toLowerCase().includes(value) ||
        bar.address.toLowerCase().includes(value)
    );

    setFilteredBars(filtered);
  };

  const handleVenueClick = (barId) => {
    navigate(`/venue/${barId}`);
  };

  return (
    <Box position="relative" minHeight="100vh" display="flex" flexDirection="column" bg="gray.100">
      <Box bg="gray.900" width="100%" py={4} px={6} display="flex" justifyContent="center">
        <Heading as="h1" size="lg" color="white">
          Explore Venues
        </Heading>
      </Box>

      <Box bg="gray.100" py={4} px={6} display="flex" justifyContent="center">
        <Input
          placeholder="Search venues by name or location"
          value={search}
          onChange={handleSearch}
          width="100%"
          maxW="600px"
          bg="white"
          borderRadius="md"
          boxShadow="md"
        />
      </Box>

      {/* Button to Navigate to Map Page */}
      {/* <Flex justify="center" mt={2}>
        <Button onClick={() => navigate('/map')} colorScheme="blue">
          View Map
        </Button>
      </Flex> */}

      <Flex
        flex="1"
        direction="column"
        align="center"
        py={10}
        px={6}
        bg="white"
        paddingBottom="80px"
      >
        <VStack spacing={4} w="full" maxW="6xl" align="stretch">
          <Heading as="h2" size="md" color="gray.700" mb={4}>
            Venues List
          </Heading>
          <Divider />
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
            {filteredBars.map((bar) => (
              <GridItem
                key={bar._id}
                p={4}
                bg="white"
                borderRadius="md"
                shadow="md"
                borderWidth="1px"
                onClick={() => handleVenueClick(bar._id)}
                cursor="pointer"
              >
                <Flex direction="column" align="center" justify="center" h="100%">
                  <Image
                    src={`http://localhost:5001${bar.imageUrl}`}
                    alt={bar.name}
                    width="100%"
                    height="150px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <Box mt={4} textAlign="center">
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      {bar.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {bar.address}
                    </Text>
                  </Box>
                </Flex>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Flex>

      <BottomNavBar />
    </Box>
  );
};

export default UserDashboard;
