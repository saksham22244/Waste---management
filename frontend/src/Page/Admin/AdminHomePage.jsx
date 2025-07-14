import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import logo from "../../assets/logo.png";
import recyclablewaste from "../../assets/recyclablewaste.png";
import sidebarBg from "../../assets/backgroundimage.png";
import adminPhoto from "../../assets/AdminPhoto.png";

import AdminHeader from '@/components/AdminHeader';

const AdminHomePage = () => {
  const [date, setDate] = useState(new Date());
  const [popupOpen, setPopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    name: "Alice Green",
    username: "Alice_Green",
    email: "Alicegreen@gmail.com",
    address: "Naxal, Kathmandu",
    phone: "9812345678",
  });

  const defaultPosts = [
    { id: 1, title: "Recyclable Waste", image: recyclablewaste },
    { id: 2, title: "Recyclable Waste", image: recyclablewaste },
    { id: 3, title: "Recyclable Waste", image: recyclablewaste }
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("posts")) || [];
    setPosts([...defaultPosts, ...stored]);
  }, []);

  const handleLogout = () => navigate('/login');
  const handleEditClick = post => { setEditingPost(post); setIsEditing(true); };
  const handleCancelEdit = () => { setEditingPost(null); setIsEditing(false); };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setEditingPost(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setEditingPost(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleSaveEdit = () => {
    const updated = posts.map(p => p.id === editingPost.id ? editingPost : p);
    localStorage.setItem("posts", JSON.stringify(updated.slice(defaultPosts.length)));
    setPosts(updated);
    setIsEditing(false);
    setEditingPost(null);
  };

  const handleDeletePost = id => {
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem("posts", JSON.stringify(updated.slice(defaultPosts.length)));
    setPosts(updated);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 p-6 border-r border-gray-200 text-white relative"
          style={{ background: `url(${sidebarBg}) center/cover no-repeat` }}>
          <div className="flex flex-col items-center mb-10 relative z-10">
            <img src={logo} alt="Logo" className="w-20 h-20 rounded-full mb-2" />
            <h2 className="text-lg font-bold text-white text-center">GREEN CYCLE TECH</h2>
          </div>
          <div className="space-y-1 relative z-10">
            <Link to="/adminHome" className="block px-4 py-2 bg-white text-green-600 rounded">Home</Link>
            <Link to="/users" className="block px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">USERS</Link>
            <Link to="/notice" className="block px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">NOTICE</Link>
            <Link to="/requestPage" className="block px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">REQUEST</Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">

          {/* <h1 className="text-2xl font-bold text-gray-800">ARTICLES ABOUT WASTE MANAGEMENT</h1> */}
          {/* <div className="relative">
              <img
                src={adminPhoto}
                alt="Admin"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setPopupOpen(o => !o)}
              />
              {popupOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50 p-4">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <div>
                      <h2 className="text-lg font-semibold">{adminData.name.toUpperCase()}</h2>
                      <p className="text-sm text-gray-500">{adminData.username}</p>
                    </div>
                    <button onClick={() => setPopupOpen(false)} className="text-gray-500 text-xl">&times;</button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><span>📧</span>{adminData.email}</div>
                    <div className="flex items-center gap-2"><span>📍</span>{adminData.address}</div>
                    <div className="flex items-center gap-2"><span>📞</span>{adminData.phone}</div>
                    <button onClick={handleLogout} className="mt-2 text-green-600 hover:underline">Logout</button>
                  </div>
                </div>
              )}
            </div> */}
          <AdminHeader />


          <div className="flex gap-6 mt-6">
            {/* Posts Grid */}
            <div className="grid grid-cols-3 gap-6 flex-grow">
              {posts.map(post => (
                <div key={post.id} className="relative bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  {/* Delete button top-right */}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    title="Delete post"
                  >
                    &#10005;
                  </button>

                  {isEditing && editingPost?.id === post.id ? (
                    <>
                      {editingPost.image && (
                        <img src={editingPost.image} alt="Preview" className="w-full h-40 object-cover rounded mb-3" />
                      )}
                      <input
                        type="text"
                        name="title"
                        value={editingPost.title}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded mb-2"
                      />
                      <textarea
                        name="description"
                        value={editingPost.description || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded mb-2"
                      />
                      <div className="mb-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400">
                          <div className="flex flex-col items-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">Change Image</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="edit-image-upload"
                            />
                            <label
                              htmlFor="edit-image-upload"
                              className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 cursor-pointer"
                            >
                              Select Image
                            </label>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <img src={post.image} alt={post.title} className="h-40 w-full object-cover rounded mb-3" />
                      <p className="text-center font-medium text-gray-700">{post.title}</p>
                      <div className="flex justify-center gap-4 mt-2">
                        <button
                          onClick={() => handleEditClick(post)}
                          className="text-green-600 hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add New Post Card */}
              <button
                onClick={() => navigate('/addPost')}
                className="bg-white p-4 rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-green-400 transition-colors"
              >
                <span className="text-4xl text-green-500 mb-2">+</span>
                <p className="text-gray-600 font-medium">ADD NEW POST</p>
              </button>
            </div>

            {/* Calendar Sidebar */}
            <div className="w-64">
              <div className="bg-white p-4 rounded-lg shadow-sm sticky top-8">
                <div className="text-center font-medium mb-2">
                  {date.toLocaleString('default', { month: 'long' })}, {date.getFullYear()}
                </div>
                <Calendar
                  value={date}
                  onChange={setDate}
                  className="border-0"
                  view="month"
                  tileClassName={({ date }) =>
                    date.getMonth() !== new Date().getMonth() ? 'text-gray-300' : ''
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
