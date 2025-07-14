// src/pages/OtpVerification.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../assets/backgroundimage.png';
import logo from '../assets/logo.png';
import { toast } from 'react-hot-toast';
const OtpVerification = () => {
    const [otp, setOtp] = useState('');
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { tempUserId, email } = location.state || {};

    const handleVerify = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/verify-otp`, {
                tempUserId,
                otp
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('role', response.data.user.role);
                toast.success("OTP verified successfully!", {
                    duration: 3000,
                    position: 'top-right',
                });

                navigate(response.data.user.role === 'garbageCollector' ? '/login' : '/userHome');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed", {
                duration: 3000,
                position: 'top-right',
            });
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/resend-otp`, {
                tempUserId,
                email
            });
            toast.success("New OTP sent successfully!", {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Error resending OTP:', error);

            // Error toast notification
            toast.error(error.response?.data?.message || "Failed to resend OTP", {
                duration: 3000,
                position: 'top-right',
            });
        }
        setIsResending(false);
    };

    if (!tempUserId || !email) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-red-600">Invalid verification session</h2>
                <p className="mt-4">
                    Please complete the registration process from the beginning.
                </p>
            </div>
        );
    }

    return (
        <div
            className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center px-6"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 shadow-lg rounded-lg">
                <div className="flex justify-center mb-4">
                    <img src={logo} alt="Green Cycle Tech" style={{ height: '100px', width: 'auto' }} />
                </div>

                <h2 className="text-center text-2xl font-bold text-green-700">OTP VERIFICATION</h2>
                <p className="text-center text-sm text-gray-600 mb-6">
                    Enter the OTP sent to {email}
                </p>

                <form className="space-y-4" onSubmit={handleVerify}>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter OTP"
                        className="input-field w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                        VERIFY ACCOUNT
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-green-600 hover:underline"
                            disabled={isResending}
                        >
                            {isResending ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OtpVerification;