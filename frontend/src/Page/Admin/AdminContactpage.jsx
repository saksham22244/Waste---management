import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import sidebarBg from '../../assets/backgroundimage.png';
import { toast } from 'react-hot-toast';

const AdminContactPage = () => {
  const [messages, setMessages] = useState([]);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to fetch messages');
      }
    };
    fetchMessages();
  }, []);

  const handleDeleteClick = (id) => {
    setMessageToDelete(id);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/contact/${messageToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(messages.filter((msg) => msg._id !== messageToDelete));
      setMessageToDelete(null);
      toast.success('Feedback deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const cancelDelete = () => {
    setMessageToDelete(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <div
          className="w-64 p-6 border-r border-gray-200 text-white relative"
          style={{
            backgroundImage: `url(${sidebarBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="relative z-10 flex flex-col items-center mb-10">
            <img src={logo} alt="Logo" className="w-20 h-20 rounded-full mb-2" />
            <h2 className="text-lg font-bold text-white text-center">GREEN CYCLE TECH</h2>
          </div>
          <div className="relative z-10 space-y-1">
            {/* <Link to="/adminhome" className="block px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">Home</Link> */}
            <Link to="/users" className="block px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">DASHBOARD</Link>
            <Link to="/notice" className="block px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">NOTICE</Link>
            <Link to="/requestPage" className="block px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">REQUEST</Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-black">Feedback PAGE</h2>
          </header>

          {/* Display Messages */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Messages</h3>
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages available.</p>
            ) : (
              <ul className="space-y-4">
                {messages.map((msg) => (
                  <li key={msg._id} className="bg-gray-100 p-4 rounded shadow-sm">
                    <p><strong>Name:</strong> {msg.name}</p>
                    <p><strong>Email:</strong> {msg.email}</p>
                    <p><strong>Role:</strong> {msg.role}</p>
                    <p><strong>Subject:</strong> {msg.subject}</p>
                    <p><strong>Message:</strong> {msg.message}</p>
                    <p><strong>Sent:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
                    <Button
                      onClick={() => handleDeleteClick(msg._id)}
                      className="mt-2 bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </Button>

                    {messageToDelete === msg._id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                          <h3 className="text-lg font-semibold mb-4">Delete Feedback</h3>
                          <p className="text-gray-600 mb-6">Are you sure you want to delete this feedback?</p>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={cancelDelete}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmDelete}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactPage;
