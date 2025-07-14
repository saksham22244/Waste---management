import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../assets/backgroundimage.png';
import logo from '../assets/logo.png';
import { toast } from 'react-hot-toast';

const VerifyResetOTP = () => {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { state } = useLocation();
    const email = state?.email;
    const navigate = useNavigate();

    if (!email) {
        navigate('/forgot-password');
        return null;
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/verify-reset-otp`, {
                email,
                otp
            });

            toast.success(response.data.message, {
                duration: 3000,
                position: 'top-right',
            });
            navigate('/reset-password', { state: { email, otp } });
        } catch (error) {

            // Error toast notification
            toast.error(error.response?.data?.message || 'OTP verification failed. Please try again.', {
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

                <h2 className="text-center text-2xl font-bold text-green-700">VERIFY OTP</h2>
                <form className="space-y-4 mt-4" onSubmit={handleVerify}>
                    <p className="text-gray-600">An OTP has been sent to {email}. Please enter it below:</p>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-red-600">{message}</p>}
            </div>
        </div>
    );
};

export default VerifyResetOTP;