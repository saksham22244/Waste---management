import React from 'react';
import { User } from 'lucide-react';
import NotificationPopup from './NotificationPopup';
import ProfilePopup from './ProfilePopup';

const AdminHeader = () => {
    return (
        <div className="w-full flex justify-between items-center px-8 py-0 bg-transparent">
            <div className="text-3xl font-bold text-[#2A3B2A]">DASHBOARD</div>
            <div className="flex items-center space-x-4">

                <button className="p-2 rounded-full bg-gray-100">
                    <ProfilePopup />
                </button>
            </div>
        </div>
    );
};

export default AdminHeader;