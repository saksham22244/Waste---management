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
  useDisclosure,
  Badge
} from '@chakra-ui/react';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/scheduled-collection/assigned');
      setTasks(response.data);
      // Filter tasks so that only one schedule per day is allowed
      const uniqueTasks = response.data.reduce((acc, task) => {
        const date = new Date(task.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        if (!acc[date]) {
          acc[date] = task;
        }
        return acc;
      }, {});
      setFilteredTasks(Object.values(uniqueTasks));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch assigned tasks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast({
        title: 'Error',
        description: 'Please select a status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.put(`/api/scheduled-collection/status/${selectedTask._id}`, {
        status: newStatus
      });

      if (newStatus === "Picked Up") {
        // Remove the task from the list if it's completed
        setTasks(tasks.filter(task => task._id !== selectedTask._id));
        toast({
          title: 'Success',
          description: 'Collection completed and moved to history',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Update the task status for other statuses
        setTasks(tasks.map(task => 
          task._id === selectedTask._id 
            ? { ...task, status: newStatus }
            : task
        ));
        toast({
          title: 'Success',
          description: 'Status updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openStatusModal = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    onOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned':
        return 'blue';
      case 'On the Way':
        return 'orange';
      case 'Picked Up':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={6}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Client</Th>
            <Th>Location</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredTasks.map((task) => (
            <Tr key={task._id}>
              <Td>{new Date(task.date).toLocaleDateString()}</Td>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text>{task.clientName}</Text>
                  <Text fontSize="sm" color="gray.500">{task.clientPhone}</Text>
                </VStack>
              </Td>
              <Td>{task.location}</Td>
              <Td>
                <Badge colorScheme={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </Td>
              <Td>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => openStatusModal(task)}
                >
                  Update Status
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Task Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text>Current Status: {selectedTask?.status}</Text>
              <Select
                placeholder="Select new status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="On the Way">On the Way</option>
                <option value="Picked Up">Picked Up</option>
              </Select>
              <Button colorScheme="blue" onClick={handleStatusUpdate}>
                Update
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TaskManagement; 