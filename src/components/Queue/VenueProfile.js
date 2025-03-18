import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, VStack, Image, Text, Button, Spinner, Flex, Divider } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import BottomNavBar from '../Users/BottomNavBar';
import {loadStripe} from '@stripe/stripe-js';
const stripePromise = await loadStripe('pk_test_51R3l8XQhyzTMJUFhq65v6Go5YSOJyA3HaILZ5XetOYSZtQHRXajIM0iWEJGUzpclKRxYZVVD950s5zeqbZVsnNeK00r6a2bbZB');

const VenueProfile = () => {
  const { barId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bar, setBar] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        // Fetch bar details
        const barResponse = await axios.get(`http://localhost:5001/api/bars/${barId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBar(barResponse.data);

        // Fetch queue details
        try {
          const queueResponse = await axios.get(`http://localhost:5001/api/queue/status/${barId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setQueueStatus(queueResponse.data);

          // Check if the current user is in the queue
          const currentUserId = (await axios.get(`http://localhost:5001/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })).data._id;

          const userInQueue = queueResponse.data.queue.some(
            (user) => user.userId === currentUserId
          );
          setIsInQueue(userInQueue);
        } catch (error) {
          if (error.response?.status === 403) {
            console.log('Queue is closed or unavailable');
            setQueueStatus(null);
          } else {
            console.error('Error fetching queue details:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching venue details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [barId, token]);

  const handleJoinQueue = async () => {
    try {
      await axios.post(
        `http://localhost:5001/api/queue/${barId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/queue/waiting/${barId}`);
    } catch (error) {
      console.error('Error joining queue:', error);
      if (error.response?.status === 400 && error.response?.data?.msg === 'User already in queue') {
        navigate(`/queue/waiting/${barId}`);
      }
    }
  };

  const handleViewQueue = () => {
    navigate(`/queue/waiting/${barId}`);
  };

  
  const handlePayments = async () => {
    try {
      const stripe = await stripePromise;
  
      // Get the current user's ID
      const userResponse = await axios.get('http://localhost:5001/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = userResponse.data._id;
  
      // Create a Checkout Session
      const response = await axios.post(
        'http://localhost:5001/api/queue/create-checkout-session',
        {
          items: [{ id: 1, quantity: 1 }],
          userId, // Pass userId
          barId,  // Pass barId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      const session = response.data;
  
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
  
      if (result.error) {
        console.error('Stripe Checkout Error:', result.error.message);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error.response?.data || error.message);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!bar) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text fontSize="lg" color="red.500">
          Venue details could not be loaded. Please try again later.
        </Text>
      </Flex>
    );
  }

  return (
    <Box minHeight="100vh" bg="gray.100" pb="80px">
      {/* Header */}
      <Box bg="gray.900" py={6} px={4} textAlign="center" color="white">
        <Text fontSize="2xl" fontWeight="bold">Leap</Text>
      </Box>

      {/* Content Section */}
      <VStack spacing={4} align="stretch" maxW="600px" mx="auto" mt={6} p={4} bg="white" borderRadius="md" shadow="md">
        {/* Venue Image */}
        {bar.imageUrl && (
          <Image
            src={`http://localhost:5001${bar.imageUrl}`}
            alt={bar.name}
            width="100%"
            height="300px"
            objectFit="cover"
            borderRadius="md"
          />
        )}

        {/* Venue Details */}
        <VStack spacing={2} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            Location:{' '}
            <Text as="span" fontWeight="normal">
              {bar.address || 
                (bar.location?.coordinates
                  ? `Lat: ${bar.location.coordinates[1]}, Lng: ${bar.location.coordinates[0]}`
                  : 'No location available')}
            </Text>
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            Description: <Text as="span" fontWeight="normal">{bar.description || 'No description provided.'}</Text>
          </Text>
        </VStack>

        <Divider />

        {/* Queue Buttons */}
        <VStack spacing={3} align="stretch">
          {queueStatus ? (
            queueStatus.isQueueOpen ? (
              <>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={isInQueue ? handleViewQueue : handleJoinQueue}
              >
                {isInQueue ? 'View Queue' : 'Join Queue'}
              </Button>
              <Button
              colorScheme="green"
              size="lg"
              onClick={handlePayments}
              >
              Pay and Skip
              </Button>
              </>
            ) : (
              <Text fontSize="lg" color="red.500" fontWeight="bold">
                Queue is closed
              </Text>
            )
          ) : (
            <Text fontSize="lg" color="gray.500">
              Queue details are currently unavailable.
            </Text>
          )}
        </VStack>
      </VStack>

      {/* Footer */}
      <BottomNavBar />
    </Box>
  );
};

export default VenueProfile;
