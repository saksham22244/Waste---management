import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Select,
  useDisclosure
} from '@chakra-ui/react';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCollector, setSelectedCollector] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchRequests();
    fetchCollectors();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/scheduled-collection/pending');
      setRequests(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pending requests',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchCollectors = async () => {
    try {
      const response = await axios.get('/api/scheduled-collection/collectors');
      setCollectors(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch garbage collectors',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAssign = async () => {
    if (!selectedCollector) {
      toast({
        title: 'Error',
        description: 'Please select a collector',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post('/api/scheduled-collection/assign', {
        collectionId: selectedRequest._id,
        collectorId: selectedCollector
      });

      toast({
        title: 'Success',
        description: 'Collector assigned successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      fetchRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to assign collector',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setSelectedCollector('');
    onOpen();
  };

  return (
    <Box p={6}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Client</Th>
            <Th>Location</Th>
            <Th>Description</Th>
            <Th>Priority</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {requests.map((request) => (
            <Tr key={request._id}>
              <Td>{new Date(request.date).toLocaleString()}</Td>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text>{request.clientName}</Text>
                  <Text fontSize="sm" color="gray.500">{request.clientEmail}</Text>
                  <Text fontSize="sm" color="gray.500">{request.clientPhone}</Text>
                </VStack>
              </Td>
              <Td>{request.location}</Td>
              <Td>{request.description}</Td>
              <Td>{request.priority}</Td>
              <Td>
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={() => openAssignModal(request)}
                >
                  Assign Collector
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Collector</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text>Select a collector for this request:</Text>
              <Select
                placeholder="Select collector"
                value={selectedCollector}
                onChange={(e) => setSelectedCollector(e.target.value)}
              >
                {collectors.map((collector) => (
                  <option key={collector._id} value={collector._id}>
                    {collector.name} - {collector.email}
                  </option>
                ))}
              </Select>
              <Button colorScheme="green" onClick={handleAssign}>
                Assign
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PendingRequests;