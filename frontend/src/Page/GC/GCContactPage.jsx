import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import GCSidebar from '@/components/GCSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const GCContactPage = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        role: '',
    });

    const [formData, setFormData] = useState({
        subject: '',
        message: '',
    });

    useEffect(() => {
        // Get the user data from localStorage (after login)
        const storedUserData = JSON.parse(localStorage.getItem('user'));
        if (storedUserData) {
            setUserData({
                name: storedUserData.name,
                email: storedUserData.email,
                role: storedUserData.role,
            });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');  // Get the token from localStorage
        const { subject, message } = formData;

        const messageData = {
            ...userData,  // Include name, email, and role from userData
            subject,
            message,
        };

        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, messageData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            // Success toast notification
            toast.success('Message sent successfully!', {
                duration: 3000,
                position: 'top-right',
            });
            setFormData({ subject: '', message: '' });  // Clear form after submission
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(err.response?.data?.message || "Something went wrong", {
                duration: 3000,
                position: 'top-right',
            });
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <GCSidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Support</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-xl font-bold mb-4">Send Us a Message</h2>

                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject
                                        </label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            placeholder="Enter subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                            Message
                                        </label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            placeholder="Type your message here"
                                            rows={6}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <Button className="bg-green-600 hover:bg-green-700">
                                        Send Message
                                    </Button>
                                </form>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Contact Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="mt-1">{userData.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500">Role</p>
                                    <p className="mt-1">{userData.role}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500">Contact Info</p>
                                    <p className="mt-1">support@greencycle.com</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="mt-1">+977 1-4444444</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                    <p className="mt-1">Kalanki, Kathmandu, Nepal</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500">Working Hours</p>
                                    <p className="mt-1">Monday - Friday: 9AM - 5PM</p>
                                    <p>Saturday: 10AM - 2PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GCContactPage;
