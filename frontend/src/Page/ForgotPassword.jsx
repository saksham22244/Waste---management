// Frontend: src/pages/ForgotPassword.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/backgroundimage.png';
import logo from '../assets/logo.png';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser?.email) {
                    setEmail(parsedUser.email);
                }
            } catch (e) {
                console.error('Failed to parse user from localStorage:', e);
            }
        }
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/forgot-password`, { email });
            toast.success(response.data.message || "OTP sent successfully!", {
                duration: 3000,
                position: 'top-right',
            });
            navigate('/verify-reset-otp', { state: { email } });
        } catch (error) {

            toast.error(error.response?.data?.message || "Failed to send OTP.", {
                duration: 3000,
                position: 'top-right',
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center px-6"
            style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 shadow-lg rounded-lg">
                <div className="flex justify-center mb-4">
                    <img src={logo} alt="Logo" style={{ height: '100px', width: 'auto' }} />
                </div>

                <h2 className="text-center text-2xl font-bold text-green-700">FORGOT PASSWORD</h2>
                <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-red-600">{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;