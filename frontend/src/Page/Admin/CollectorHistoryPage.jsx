import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import sidebarBg from '../../assets/backgroundimage.png';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CollectorHistoryPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/collector-tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(res.data)) {
          setTasks(res.data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong", {
          duration: 3000,
          position: 'top-right',
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/${taskId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );
        toast.success('Status updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setShowStatusModal(false);
      setSelectedTask(null);
    }
  };

  const handleViewDetails = (task) => {
    setTaskDetails(task);
    setShowTaskDetails(true);
  };

  const closeTaskDetails = () => {
    setTaskDetails(null);
    setShowTaskDetails(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'On the Way':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Not Arrived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <div
          className="w-64 p-6 border-r border-gray-200 text-white relative"
          style={{
            backgroundImage: `url(${sidebarBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="relative z-10 flex flex-col items-center mb-10">
            <img src={logo} alt="Logo" className="w-20 h-20 rounded-full mb-2" />
            <h2 className="text-lg font-bold text-white text-center">GREEN CYCLE TECH</h2>
          </div>
          <div className="relative z-10 space-y-1">
            <Link to="/collector-dashboard" className="block w-full px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">DASHBOARD</Link>
            <Link to="/collector-history" className="block w-full px-4 py-2 bg-white text-green-600 rounded">TASKS</Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 drop-shadow">TASK MANAGEMENT</h1>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading tasks...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Client Name', 'Location', 'Date', 'Status', 'Actions'].map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          {task.clientName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          {task.location || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          {task.date ? new Date(task.date).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                          <button
                            onClick={() => handleViewDetails(task)}
                            className="text-blue-600 hover:text-blue-900 text-xl"
                          >
                            👁️
                          </button>
                          {task.status !== 'Completed' && (
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowStatusModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 text-xl"
                            >
                              ✓
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tasks.length === 0 && (
                  <p className="text-center py-4 text-gray-500">No tasks assigned.</p>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Status Update Modal */}
        {showStatusModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4 w-[90%] max-w-md">
              <h2 className="text-xl font-bold text-green-700">Update Status</h2>
              <div className="space-y-2">
                {['On the Way', 'Completed', 'Not Arrived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedTask._id, status)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Details Modal */}
        {showTaskDetails && taskDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4 w-[90%] max-w-md">
              <h2 className="text-xl font-bold text-blue-700">Task Details</h2>
              <div className="text-left space-y-2">
                <p><strong>Client Name:</strong> {taskDetails.clientName}</p>
                <p><strong>Location:</strong> {taskDetails.location}</p>
                <p><strong>Date:</strong> {new Date(taskDetails.date).toLocaleString()}</p>
                <p><strong>Description:</strong> {taskDetails.description || '-'}</p>
                <p><strong>Status:</strong> {taskDetails.status}</p>
                <p><strong>Priority:</strong> {taskDetails.priority || 'Medium'}</p>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={closeTaskDetails}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorHistoryPage;
