import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/logo.png";
import sidebarBg from "../../assets/backgroundimage.png";
import AdminHeader from '@/components/AdminHeader';
import { toast } from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const formattedUsers = data.data
          .filter(user => user.role === "garbageCollector" || user.role === "User")
          .map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phoneNumber,
            address: user.address,
            isVerified: user.isVerified,
            category: user.role === "garbageCollector" ? "GARBAGE COLLECTOR" : "USER",
          }));

        setUsers(formattedUsers);
      } else {
        toast.error(err.response?.data?.message || "Something went wrong", {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error(err.response?.data?.message || "Something went wrong", {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user =>
      (activeTab === 'ALL' || user.category === activeTab) &&
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredUsers(results);
  }, [activeTab, searchQuery, users]);

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const updatedUsers = users.filter(user => user.id !== userToDelete);
        setUsers(updatedUsers);
        setShowDeleteConfirm(false);
        toast.success("User deleted successfully!", {
          duration: 3000,
          position: 'top-right',
        });
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 3000);
      } else {
        toast.error(err.response?.data?.message || "Something went wrong", {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error(err.response?.data?.message || "Something went wrong", {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/verify-collector/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: true })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === id ? { ...user, isVerified: true } : user
          )
        );
        toast.success("Garbage collector approved successfully!", {
          duration: 3000,
          position: 'top-right',
        });
      } else {
        toast.error(data.message || "Something went wrong", {
          duration: 3000,
          position: 'top-right',
        });
        console.error("Approval failed:", data.message);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong", {
        duration: 3000,
        position: 'top-right',
      });
      console.error("Error approving user:", error);
    }
  };


  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
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
            {/* <Link to="/adminHome" className="block w-full text-left px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">Home</Link> */}
            <Link to="/users" className="block w-full text-left px-4 py-2 bg-white text-green-600 rounded">DASHBOARD</Link>
            <Link to="/notice" className="block w-full text-left px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">NOTICE</Link>
            <Link to="/requestPage" className="block w-full text-left px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">REQUEST</Link>
          </div>
        </div>


        {/* Main Content */}

        <div className="flex-1 p-8">
          <AdminHeader />
          {/* <h1 className="text-2xl font-bold text-gray-800 mb-6">USERS MANAGEMENT</h1> */}

          {showDeleteSuccess && (
            <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-600 text-green-800 p-4 z-50 rounded">
              User deleted successfully!
            </div>
          )}

          {/* Filter/Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex space-x-2">
                {['ALL', 'USER', 'GARBAGE COLLECTOR'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === tab ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="SEARCH ANY USERS..."
                  className="w-full sm:w-64 p-2 border border-gray-300 rounded-md text-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                  onClick={handleSearchClick}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {['NAME', 'EMAIL', 'PHONE NO.', 'ADDRESS', 'CATEGORY', 'ACTIONS'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.address}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.category}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button onClick={() => handleDeleteClick(user.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                        {user.category === "GARBAGE COLLECTOR" && !user.isVerified && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✅ Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete Confirm Modal */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
                <p className="mb-6">Are you sure you want to delete this user?</p>
                <div className="flex justify-end space-x-3">
                  <button onClick={cancelDelete} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
