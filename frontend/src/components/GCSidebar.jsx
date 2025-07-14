import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
const GCSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="w-64 min-h-screen bg-[#0A2905] flex flex-col items-center">
            <div className="mt-8 mb-12">
                <img
                    src={logo}
                    alt="GreenCycle Logo"
                    className="w-28 h-28 rounded-full bg-white p-2"
                />
            </div>

            <nav className="w-full flex flex-col">
                <Link
                    to="/gchome"
                    className={`py-4 px-8 text-white font-medium ${currentPath === '/gchome' ? 'bg-green-500' : 'hover:bg-green-500/30 transition-colors'}`}
                >
                    HOME
                </Link>
                <Link
                    to="/pickup"
                    className={`py-4 px-8 text-white font-medium ${currentPath === '/pickup' ? 'bg-green-500' : 'hover:bg-green-500/30 transition-colors'}`}
                >
                    PICK-UP
                </Link>
                <Link
                    to="/gcHistory"
                    className={`py-4 px-8 text-white font-medium ${currentPath === '/gcHistory' ? 'bg-green-500' : 'hover:bg-green-500/30 transition-colors'}`}
                >
                    HISTORY
                </Link>
                <Link
                    to="/gcContact"
                    className={`py-4 px-8 text-white font-medium ${currentPath === '/gcContact' ? 'bg-green-500' : 'hover:bg-green-500/30 transition-colors'}`}
                >
                    CONTACT US
                </Link>
            </nav>
        </div>
    );
};

export default GCSidebar;