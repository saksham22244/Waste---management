import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import Sidebar from '../../components/Sidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const CollectionForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentComplete, setIsPaymentComplete] = useState(false);
    const [isCheckingPayment, setIsCheckingPayment] = useState(true);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('CollectionForm useEffect - Token from localStorage:', token); // Added log
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/payment-status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.status === 'COMPLETE') {
                    setIsPaymentComplete(true);
                    // Retrieve the stored form data
                    const storedData = localStorage.getItem('pendingScheduleData');
                    if (storedData) {
                        setFormData(JSON.parse(storedData));
                    } else {
                        toast.error('No schedule data found. Please start over.');
                        navigate('/schedule/after-payment');
                    }
                } else {
                    toast.error('Payment not completed. Please complete the payment first.');
                    navigate('/payment');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                toast.error('Error verifying payment status');
                navigate('/payment');
            } finally {
                setIsCheckingPayment(false);
            }
        };

        checkPaymentStatus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            console.log('CollectionForm handleSubmit - Token from localStorage:', token); // Added log
            if (!token) {
                toast.error('Please login to schedule a collection.');
                navigate('/login');
                return;
            }

            // Get user data from localStorage
            const userRaw = localStorage.getItem('user');
            console.log('CollectionForm handleSubmit - Raw user data from localStorage:', userRaw); // Added log
            const userData = userRaw ? JSON.parse(userRaw) : null;
            console.log('CollectionForm handleSubmit - User data from localStorage:', userData); // Existing log
            if (!userData) {
                toast.error('User data not found. Please login again.');
                navigate('/login');
                return;
            }

            // Ensure the date is properly formatted
            const selectedDate = new Date(formData.date);
            selectedDate.setHours(0, 0, 0, 0); // Reset time to start of day

            // Prepare the complete form data
            const completeFormData = {
                ...formData,
                date: selectedDate.toISOString(), // Send full ISO string
                wasteType: "Recyclable", // Default waste type
                clientName: userData.name,
                clientEmail: userData.email,
                clientPhone: userData.phoneNumber || "",
                clientAddress: userData.address || "",
                location: `${formData.location}${formData.landmark ? ` - ${formData.landmark}` : ''}` // Include landmark in location
            };

            console.log('Submitting form data:', completeFormData); // Debug log

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection`,
                completeFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                // Clear the stored form data
                localStorage.removeItem('pendingScheduleData');
                toast.success('Collection scheduled successfully!');
                navigate('/schedule');
            }
        } catch (error) {
            console.error('Error scheduling collection:', error);
            console.error('Error details:', error.response?.data); // Additional error logging
            toast.error(error.response?.data?.message || 'Failed to schedule collection');
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingPayment) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1">
                    <Header />
                    <div className="p-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-lg">Verifying payment status...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isPaymentComplete || !formData) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <div className="p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="hover:bg-gray-100"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-semibold">Confirm Schedule</h1>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                                    <p className="mt-1 text-lg">{format(new Date(formData.date), 'dd MMMM yyyy')}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                    <p className="mt-1 text-lg">{formData.location}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Landmark</h3>
                                    <p className="mt-1 text-lg">{formData.landmark}</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-lg font-semibold"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Scheduling..." : "Confirm Schedule"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionForm;
