import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import GCSidebar from '@/components/GCSidebar';
import Calendar2 from '@/components/Calender2';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PickUpPage = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date());
    const [showPickups, setShowPickups] = useState(false);
    const formattedDate = format(date, 'dd MMMM');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [assignedCollections, setAssignedCollections] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [pickups, setPickups] = useState([]);

    useEffect(() => {
        fetchAssignedCollections();
    }, []);

    const fetchAssignedCollections = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/assigned`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Fetched collections:', response.data);
            // Filter out Picked Up collections
            const activeCollections = response.data.filter(collection => collection.status !== "Picked Up");
            setAssignedCollections(activeCollections);

            // Create calendar events from collections
            const events = activeCollections.reduce((acc, collection) => {
                const date = new Date(collection.date);
                // Set time to midnight for consistent comparison
                date.setHours(0, 0, 0, 0);
                const dateStr = date.toISOString();

                if (!acc[dateStr]) {
                    acc[dateStr] = 1;
                } else {
                    acc[dateStr]++;
                }
                return acc;
            }, {});

            console.log('Calendar events:', events);

            const calendarEvents = Object.entries(events).map(([date, count]) => ({
                date: new Date(date),
                label: `${count} Pickup${count > 1 ? 's' : ''}`
            }));

            setCalendarEvents(calendarEvents);
        } catch (error) {
            console.error('Error fetching assigned collections:', error);
            toast.error('Failed to fetch assigned collections');
        }
    };

    const handleDateSelect = (selectedDate) => {
        setDate(selectedDate);
        setShowPickups(true);

        // Set time to midnight for consistent comparison
        const normalizedSelectedDate = new Date(selectedDate);
        normalizedSelectedDate.setHours(0, 0, 0, 0);

        // Filter collections for selected date
        const dateCollections = assignedCollections.filter(collection => {
            const collectionDate = new Date(collection.date);
            collectionDate.setHours(0, 0, 0, 0);
            return collectionDate.getTime() === normalizedSelectedDate.getTime();
        });

        console.log('Selected date:', normalizedSelectedDate);
        console.log('Collections for date:', dateCollections);

        // Map the collections to the pickup format
        const formattedPickups = dateCollections.map(collection => ({
            id: collection._id,
            name: collection.clientName,
            phone: collection.clientPhone,
            location: collection.location,
            status: collection.status.toLowerCase(),
            wasteType: collection.wasteType,
            description: collection.description
        }));

        console.log('Formatted pickups:', formattedPickups);
        setPickups(formattedPickups);
    };

    const handleStatusUpdate = async (pickupId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            // Map the status values to what the backend expects
            const statusMap = {
                'pending': 'Pending',
                'not arrived': 'Not Arrived',
                'on the way': 'On the Way',
                'picked up': 'Picked Up'
            };

            const backendStatus = statusMap[newStatus.toLowerCase()];
            if (!backendStatus) {
                throw new Error('Invalid status value');
            }

            // Make API call for all status updates
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/status/${pickupId}`,
                { status: backendStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data) {
                // Update local state
                setPickups(prev => prev.map(pickup =>
                    pickup.id === pickupId ? { ...pickup, status: newStatus.toLowerCase() } : pickup
                ));

                // If status is "picked up", remove from current view and refresh calendar
                if (newStatus === "picked up") {
                    setPickups(prev => prev.filter(pickup => pickup.id !== pickupId));
                    await fetchAssignedCollections();
                }

                toast.success(`Status updated to ${newStatus}`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            if (error.response?.status === 403) {
                toast.error('You are not authorized to update this pickup');
            } else if (error.response?.status === 404) {
                toast.error('Pickup not found');
            } else if (error.response?.status === 400) {
                toast.error('Invalid status value');
            } else {
                toast.error(error.response?.data?.message || 'Failed to update status');
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <GCSidebar />
            <div className="flex-1 overflow-auto">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Pickup Schedule</h2>
                            <div className="text-lg font-semibold">
                                {formattedDate}
                            </div>
                        </div>

                        {!showPickups ? (
                            <div className="mb-6">
                                <Calendar2
                                    selectedDate={date}
                                    onSelectDate={handleDateSelect}
                                    events={calendarEvents}
                                />
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden p-4">
                                <div className="mb-4 font-bold text-center bg-gray-100 py-2 rounded">
                                    {pickups.length} PICKUP{pickups.length !== 1 ? 'S' : ''} TODAY
                                </div>

                                <div className="space-y-4">
                                    {pickups.map((pickup) => (
                                        <div key={pickup.id} className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <img
                                                        src="https://www.svgrepo.com/show/452030/avatar-default.svg"
                                                        alt="Default Avatar"
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{pickup.name}</h3>
                                                    <p className="text-sm text-gray-600">{pickup.phone}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin size={16} />
                                                        <span>{pickup.location}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        value={pickup.status}
                                                        onChange={(e) => handleStatusUpdate(pickup.id, e.target.value)}
                                                        className="border rounded p-2 text-sm"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="not arrived">Not Arrived</option>
                                                        <option value="on the way">On the Way</option>
                                                        <option value="picked up">Picked Up</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className="mt-4 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm"
                                    onClick={() => setShowPickups(false)}
                                >
                                    Back to Calendar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickUpPage;