import React, { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import bgImage from '../assets/backgroundimage.png'; // Background image
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const Login = ({ setIsSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/login`, { email, password });

      // Success message using react-hot-toast
      toast.success('Login successful!', {
        duration: 2000, // Duration in milliseconds
        position: 'top-right', // Position of the toast
      });
      // Removed alert for success message
      const { role } = res.data.user;
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      console.log('Login.jsx - Token received from backend:', res.data.token); // Added log
      if (res.data.token) localStorage.setItem('token', res.data.token);

      if (role === 'admin') {
        navigate('/users');
      } else if (role === 'garbageCollector') {
        navigate('/gcHome');
      } else {
        navigate('/userHome');
      }
    } catch (err) {
      // Error message using react-hot-toast
      toast.error(err.response?.data?.message || "Something went wrong", {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>


      <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 shadow-lg rounded-lg">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Green Cycle Tech" style={{ height: '100px', width: 'auto' }} />
        </div>

        <h2 className="text-center text-2xl font-bold text-green-700">LOGIN</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          ENTER YOUR CREDENTIALS TO LOGIN
        </p>

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="EMAIL"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <span
            onClick={() => navigate('/forgot-password')}
            className="text-blue-600 text-sm text-left cursor-pointer hover:underline"
          >
            FORGOT PASSWORD?
          </span>

          <button
            type="submit"
            className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            LOGIN
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700">
          NOT YET A MEMBER?{" "}
          <span
            onClick={() => navigate('/signup/user')}
            className="text-green-600 font-semibold cursor-pointer"
          >
            SIGNUP NOW
          </span>
        </p>
      </div>

      {/* Styles */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default Login;
