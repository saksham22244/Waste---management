import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/logo.png";
import sidebarBg from "../../assets/backgroundimage.png";

const AddPostPage = () => {
  const [post, setPost] = useState({
    title: '',
    description: '',
    image: null
  });
  const [imageName, setImageName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPost(prev => ({ ...prev, image: file }));
      setImageName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newPost = {
      ...post,
      id: Date.now(),
      image: URL.createObjectURL(post.image)
    };

    setTimeout(() => {
      const storedPosts = JSON.parse(localStorage.getItem("posts")) || [];
      localStorage.setItem("posts", JSON.stringify([newPost, ...storedPosts]));

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setPost({ title: '', description: '', category: '', image: null });
      setImageName('');
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1500);
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
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className="relative z-10 flex flex-col items-center mb-10">
            <img src={logo} alt="Logo" className="w-20 h-20 rounded-full mb-2" />
            <h2 className="text-lg font-bold text-white text-center">GREEN CYCLE TECH</h2>
          </div>
          <div className="relative z-10 space-y-1">
            <Link to="/adminHome" className="block w-full px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">HOME</Link>
            <Link to="/users" className="block w-full px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">USERS</Link>
            <Link to="/notice" className="block w-full px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">NOTICE</Link>
            <Link to="/requestPage" className="block w-full px-4 py-2 text-white hover:bg-white hover:text-green-600 rounded">REQUEST</Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {submitSuccess && (
            <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow z-50">
              Post added successfully!
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-800 mb-8">ADD NEW POST</h1>
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={post.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={post.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded"
                  rows="4"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">{imageName || 'Choose an Image'}</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      required
                    />
                    <label
                      htmlFor="image-upload"
                      className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                    >
                      {imageName ? 'Change Image' : 'Select Image'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Category */}
              {/* <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={post.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Recyclable">Recyclable Waste</option>
                  <option value="Hazardous">Hazardous Waste</option>
                  <option value="Organic">Organic Waste</option>
                  <option value="Electronic">Electronic Waste</option>
                </select>
              </div> */}

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <Link to="/adminHome" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</Link>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPostPage;
