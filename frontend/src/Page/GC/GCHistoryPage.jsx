import React, { useState, useEffect } from 'react';
import Header from "../../components/Header";
import GCSidebar from '../../components/GCSidebar';
import { MapPin, Trash, CalendarIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const HistoryItem = ({ location, date, status }) => {
    return (
        <div className="bg-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <MapPin className="text-gray-600" />
                    <span>{location}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-green-500 text-white">
                    {status}
                </span>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                </div>

                <div className="flex items-center gap-2">
                    <CalendarIcon className="text-gray-600" size={16} />
                    <span className="text-gray-600">{new Date(date).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

const GCHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/collector-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Failed to fetch pickup history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <GCSidebar />
            <div className="flex-1 overflow-auto">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold mb-6">Pickup History</h2>

                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No completed pickups found</div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <HistoryItem
                                        key={item._id}
                                        location={item.location}
                                        date={item.date}
                                        status={item.status}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GCHistoryPage;