import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../assets/backgroundimage.png';
import logo from '../assets/logo.png';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { state } = useLocation();
    const { email, otp } = state || {};
    const navigate = useNavigate();

    if (!email || !otp) {
        navigate('/forgot-password');
        return null;
    }

    const validatePassword = (pwd) => {
        const minLength = /.{7,}/;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
        return minLength.test(pwd) && hasNumber.test(pwd) && hasSpecialChar.test(pwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        if (!validatePassword(password)) {
            newErrors.password = "Password must be at least 7 characters, include 1 number and 1 special character.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/reset-password`, {
                email,
                otp,
                newPassword: password
            });

            toast.success("Password Reset Successfully", {
                duration: 3000,
                position: 'top-right',
            });

            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password reset failed. Please try again.', {
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

                <h2 className="text-center text-2xl font-bold text-green-700">RESET PASSWORD</h2>
                <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="New Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors({ ...errors, password: "" });
                        }}
                        onBlur={() => setTouched({ ...touched, password: true })}
                        required
                    />
                    {touched.password && errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                    )}

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setErrors({ ...errors, confirmPassword: "" });
                        }}
                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                        required
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}

                    <div className="text-sm text-gray-600">
                        <p>Password must contain:</p>
                        <ul className="list-disc ml-4">
                            <li>At least 7 characters</li>
                            <li>At least 1 number</li>
                            <li>At least 1 special character (!@#$%^&*(),.?":{'{}'}|&lt;&gt;)</li>
                        </ul>

                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
