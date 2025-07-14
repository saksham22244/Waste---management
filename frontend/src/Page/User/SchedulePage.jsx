import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Calendar2 from '@/components/Calender2';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Schedule = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reminders, setReminders] = useState([]);
    const [showDayView, setShowDayView] = useState(false);
    const [isPaymentComplete, setIsPaymentComplete] = useState(false);
    const [isCheckingPayment, setIsCheckingPayment] = useState(true);

    // Fetch reminders from backend
    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/reminders`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    // Filter out duplicate schedules for the same date
                    const uniqueSchedules = response.data.data.reduce((acc, reminder) => {
                        const date = new Date(reminder.date).toLocaleDateString();
                        if (!acc[date]) {
                            acc[date] = reminder;
                        }
                        return acc;
                    }, {});
                    setReminders(Object.values(uniqueSchedules));
                } else {
                    console.error("Failed to fetch reminders:", response.data);
                    toast.error("Failed to load scheduled collections");
                }
            } catch (err) {
                console.error('Error fetching reminders:', err);
                toast.error("Failed to load scheduled collections");
            }
        };

        fetchReminders();
    }, []);

    useEffect(() => {
        let retries = 0;
        const checkPaymentStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/payment-status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.status === 'COMPLETE') {
                    setIsPaymentComplete(true);
                    setIsCheckingPayment(false);
                } else if (retries < 3) {
                    retries++;
                    setTimeout(checkPaymentStatus, 1000); // 1 second wait
                } else {
                    setIsPaymentComplete(false);
                    setIsCheckingPayment(false);
                }
            } catch (error) {
                setIsPaymentComplete(false);
                setIsCheckingPayment(false);
            }
        };
        checkPaymentStatus();
    }, []);

    const handleDateSelect = (date) => {
        setSelectedDate(date);

        const hasBooking = reminders.some(reminder => {
            const reminderDate = new Date(reminder.date);
            return reminderDate.toDateString() === date.toDateString();
        });

        setShowDayView(hasBooking);
    };

    const handleBackToMonth = () => {
        setShowDayView(false);
    };

    // Transform reminders into calendar events
    const events = reminders
        .filter(reminder => reminder.status !== "Picked Up")
        .map(reminder => ({
            date: new Date(reminder.date),
            label: reminder.status === 'Pending' ? 'Booked' : reminder.status
        }));

    const dayReminders = reminders
        .filter(reminder =>
            new Date(reminder.date).toDateString() === selectedDate.toDateString() &&
            reminder.status !== "Picked Up"
        );

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <div className="p-6 bg-white m-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            className="flex items-center gap-2 bg-white rounded-full py-2 px-4 shadow-sm"
                            onClick={() => navigate('/schedule/after-payment')}
                        >
                            <span>Schedule Collection</span>
                            <span className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-lg">
                                <Plus size={16} />
                            </span>
                        </button>
                        <div className="text-lg font-semibold">
                            {format(selectedDate, 'dd MMMM')}
                        </div>
                    </div>

                    {!showDayView ? (
                        <div className="mb-6">
                            <Calendar2
                                selectedDate={selectedDate}
                                onSelectDate={handleDateSelect}
                                events={events}
                            />
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 font-bold text-center bg-gray-100">
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="p-4">
                                {dayReminders.map((reminder, index) => (
                                    <div key={index} className="mb-4 p-4 border rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">Location: {reminder.location}</p>
                                                <p className="text-sm text-gray-600">Status: {reminder.status}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    Date: {format(new Date(reminder.date), 'dd MMMM yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t">
                                <button
                                    onClick={handleBackToMonth}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Back to Calendar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
