import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  Heading,
  Text
} from '@chakra-ui/react';

const ScheduleForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    description: '',
    wasteType: 'General',
    priority: 'Medium',
    notes: '',
    estimatedTime: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/scheduled-collection/', formData);
      
      toast({
        title: 'Schedule Added',
        description: 'Your collection has been scheduled successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/reminders');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to schedule collection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Schedule Collection</Heading>
        <Text color="gray.600">Fill in the details to schedule your waste collection</Text>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter collection location"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the waste to be collected"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Waste Type</FormLabel>
              <Select
                name="wasteType"
                value={formData.wasteType}
                onChange={handleChange}
              >
                <option value="Recyclable">Recyclable</option>
                <option value="Hazardous">Hazardous</option>
                <option value="Organic">Organic</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Priority</FormLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Estimated Time</FormLabel>
              <Input
                type="time"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="green"
              size="lg"
              width="full"
              isLoading={loading}
            >
              Schedule Collection
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default ScheduleForm; 