import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import sidebarBg from '../../assets/backgroundimage.png';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const RequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [showCollectorSelect, setShowCollectorSelect] = useState(false);
  const [requestToAssign, setRequestToAssign] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const [showCollectorInfo, setShowCollectorInfo] = useState(false);
  const [collectorDetails, setCollectorDetails] = useState(null);

  const [showReassignConfirm, setShowReassignConfirm] = useState(false);
  const [requestToReassign, setRequestToReassign] = useState(null);

  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(res.data)) {
          // Keep all requests that are not picked up yet
          const activeRequests = res.data.filter(req =>
            req.status !== 'Picked Up' && req.status !== 'Completed'
          );
          setRequests(activeRequests);
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

    const fetchCollectors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Collectors response:', res.data);

        if (res.data.success && Array.isArray(res.data.data)) {
          // Filter only garbage collectors
          const garbageCollectors = res.data.data.filter(user => user.role === "garbageCollector");
          setCollectors(garbageCollectors);
        } else {
          console.error('Invalid collectors data format:', res.data);
          toast.error('Failed to load collectors data');
        }
      } catch (err) {
        console.error('Error fetching collectors:', err);
        toast.error('Failed to fetch garbage collectors');
      }
    };

    fetchRequests();
    fetchCollectors();
  }, []);

  useEffect(() => {
    if (location.state?.assigned) {
      const { requestId, collector } = location.state;
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, assignedTo: collector } : req
        )
      );
    }
  }, [location.state]);

  const handleApprove = (request) => {
    setRequestToAssign(request);
    setShowCollectorSelect(true);
  };

  const handleAssignCollector = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      if (!selectedCollector) {
        throw new Error('Please select a collector');
      }

      // Get the request to assign from either requestToAssign or requestToReassign
      const requestToProcess = requestToAssign || requestToReassign;
      if (!requestToProcess) {
        throw new Error('No request selected for assignment');
      }

      console.log('Sending assignment request:', {
        collectionId: requestToProcess._id,
        collectorId: selectedCollector._id
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/assign`,
        {
          collectionId: requestToProcess._id,
          collectorId: selectedCollector._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Assignment response:', response.data);

      if (response.data) {
        // Update the request status to Assigned but keep it in the list
        setRequests((prev) =>
          prev.map((req) =>
            req._id === requestToProcess._id
              ? {
                ...req,
                status: 'Assigned',
                collectorId: selectedCollector._id,
                assignedTo: selectedCollector
              }
              : req
          )
        );
        toast.success('Collector assigned successfully!');

        // Close all modals and reset states
        setShowCollectorSelect(false);
        setShowReassignConfirm(false);
        setShowCollectorInfo(false);
        setRequestToAssign(null);
        setRequestToReassign(null);
        setSelectedCollector(null);
      }
    } catch (err) {
      console.error('Error assigning collector:', err);
      toast.error(err.message || err.response?.data?.message || 'Failed to assign collector');
    }
  };

  const handleReassign = (request) => {
    setRequestToAssign(request);
    setShowCollectorSelect(true);
    setShowCollectorInfo(false);
  };

  const cancelReassign = () => {
    setRequestToReassign(null);
    setShowReassignConfirm(false);
  };

  const confirmReassign = async () => {
    try {
      // Fetch all collectors again to ensure we have the latest list
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success && Array.isArray(res.data.data)) {
        // Filter only garbage collectors
        const garbageCollectors = res.data.data.filter(user => user.role === "garbageCollector");
        setCollectors(garbageCollectors);
        setShowCollectorSelect(true);
        setRequestToAssign(requestToReassign);
        setShowReassignConfirm(false);
      } else {
        toast.error('Failed to load collectors for reassignment');
      }
    } catch (err) {
      console.error('Error fetching collectors for reassignment:', err);
      toast.error('Failed to load collectors for reassignment');
    }
  };

  const confirmReject = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const cancelReject = () => {
    setSelectedId(null);
    setShowConfirm(false);
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/${selectedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests((prev) => prev.filter((r) => r._id !== selectedId));
      toast.success("Request deleted successfully!", {
        duration: 3000,
        position: 'top-right',
      });
      setShowDeleteSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong", {
        duration: 3000,
        position: 'top-right',
      });
      setError('Failed to delete request.');
    } finally {
      setSelectedId(null);
      setShowConfirm(false);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
    }
  };

  const openCollectorPopup = (collector, request) => {
    console.log('Opening collector popup with:', { collector, request });

    if (!collector) {
      console.error('No collector provided to openCollectorPopup');
      toast.error('Collector information not available');
      return;
    }

    // If collector is just an ID, find the full collector details
    if (typeof collector === 'string') {
      const foundCollector = collectors.find(c => c._id === collector);
      if (foundCollector) {
        setCollectorDetails({ ...foundCollector, request });
      } else {
        console.error('Could not find collector with ID:', collector);
        toast.error('Collector information not found');
        return;
      }
    } else {
      // If collector is an object, use it directly
      setCollectorDetails({ ...collector, request });
    }

    setShowCollectorInfo(true);
  };

  const closeCollectorPopup = () => {
    setCollectorDetails(null);
    setShowCollectorInfo(false);
  };

  const handleViewDetails = (req) => {
    setRequestDetails(req);
    setShowRequestDetails(true);
  };

  const closeRequestDetails = () => {
    setRequestDetails(null);
    setShowRequestDetails(false);
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
            {/* <Link to="/adminHome" className="block w-full px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">HOME</Link> */}
            <Link to="/users" className="block w-full px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">DASHBOARD</Link>
            <Link to="/notice" className="block w-full px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">NOTICE</Link>
            <Link to="/requestPage" className="block w-full px-4 py-2 bg-white text-green-600 rounded">REQUEST</Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 drop-shadow">REQUEST MANAGEMENT</h1>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading requests...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
              {showDeleteSuccess && (
                <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-600 text-green-800 p-4 z-50 rounded">
                  Request deleted successfully!
                </div>
              )}

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Name', 'Email', 'Phone No.', 'Address', 'Date', 'Status', 'Actions'].map((header) => (
                          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((req) => (
                        <tr key={req._id}>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">{req.clientName || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">{req.clientEmail || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">{req.clientPhone || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">{req.clientAddress || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">{req.date ? new Date(req.date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' }) : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">
                            {req.status === 'Assigned' ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Assigned
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                            <button onClick={() => confirmReject(req._id)} className="text-red-600 hover:text-red-900 text-xl">✗</button>
                            <button onClick={() => handleViewDetails(req)} className="text-blue-600 hover:text-blue-900 text-xl">👁️</button>

                            {req.status === 'Assigned' ? (
                              <button
                                onClick={() => openCollectorPopup(req.collectorId || req.assignedTo, req)}
                                className="text-green-600 hover:text-green-900 text-xl"
                              >
                                Assigned
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApprove(req)}
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
                  {requests.length === 0 && (
                    <p className="text-center py-4 text-gray-500">No pending requests.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        {/* Modals */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4 w-[90%] max-w-md">
              <h2 className="text-xl font-bold text-red-600">Confirm Deletion</h2>
              <p>Are you sure you want to delete this request?</p>
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={cancelReject} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
                <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Collector Selection Modal */}
        {showCollectorSelect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4 w-[90%] max-w-md">
              <h2 className="text-xl font-bold text-green-700">Choose Garbage Collector</h2>
              <div className="max-h-60 overflow-y-auto">
                {collectors && collectors.length > 0 ? (
                  collectors.map((collector) => (
                    <div
                      key={collector._id}
                      className={`p-3 mb-2 rounded cursor-pointer ${selectedCollector?._id === collector._id
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'hover:bg-gray-100'
                        }`}
                      onClick={() => {
                        console.log('Selected collector:', collector);
                        setSelectedCollector(collector);
                      }}
                    >
                      <p className="font-semibold">{collector.name}</p>
                      <p className="text-sm text-gray-600">Phone: {collector.phoneNumber}</p>
                      <p className="text-sm text-gray-600">Email: {collector.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No collectors available</p>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowCollectorSelect(false);
                    setSelectedCollector(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCollector}
                  disabled={!selectedCollector}
                  className={`px-4 py-2 rounded ${selectedCollector
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {showCollectorInfo && collectorDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4 w-[90%] max-w-md">
              <h2 className="text-xl font-bold text-green-700">Assigned Collector</h2>
              <p><strong>Name:</strong> {collectorDetails.name}</p>
              <p><strong>Phone:</strong> {collectorDetails.phoneNumber}</p>
              <p><strong>Email:</strong> {collectorDetails.email}</p>
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={closeCollectorPopup} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Close</button>
                <button onClick={() => handleReassign(collectorDetails.request)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Reassign</button>
              </div>
            </div>
          </div>
        )}

        {showRequestDetails && requestDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4 w-[90%] max-w-md">
              <h2 className="text-xl font-bold text-blue-700">Request Details</h2>
              <p><strong>Date:</strong> {new Date(requestDetails.date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</p>
              <p><strong>Location:</strong> {requestDetails.location.split(' - ')[0] || '-'}</p>
              <p><strong>Landmark:</strong> {requestDetails.location.split(' - ')[1] || '-'}</p>
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={closeRequestDetails} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestPage;
