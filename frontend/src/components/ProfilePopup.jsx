import React, { useState } from 'react';
import { UserRound, Mail, MapPin, Phone, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useNavigate } from 'react-router-dom';

const ProfilePopup = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [view, setView] = useState('info');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Retrieve user data from local storage
    const storedUserData = localStorage.getItem('user');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    if (!userData) {
        return null; // Return early if no user data is found
    }

    const handleClosePopup = () => {
        setOpen(false);
        setTimeout(() => setView('info'), 300);
    };

    const handleLogout = () => {
        // Clear user data and tokens
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        navigate('/');
    };

    const renderContent = () => {
        switch (view) {
            case 'info':
                return (
                    <div className="flex flex-col p-6">
                        <button
                            onClick={handleClosePopup}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={18} />
                        </button>

                        {/* Avatar */}
                        <div className="flex justify-center mb-4">
                            {/* <Avatar className="h-16 w-16">
                                <AvatarImage src={userData.avatarUrl} />
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xl">
                                    {userData.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar> */}
                        </div>

                        <h2 className="text-center font-semibold text-lg mb-6">{userData.name}</h2>

                        {/* Email */}
                        <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-gray-600" />
                                <p className="text-sm">{userData.email}</p>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-gray-600" />
                                <p className="text-sm">{userData.address}</p>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-gray-600" />
                                <p className="text-sm">{userData.phoneNumber}</p>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            {/* <Button variant="outline" onClick={() => setView('edit')} className="text-green-600 hover:text-green-700">
                                Edit Profile
                            </Button> */}
                            <Button variant="outline" onClick={() => { handleClosePopup(); navigate('/forgot-password'); }} className="text-red-600 hover:text-red-700">
                                Change Password
                            </Button>
                            <Button variant="outline" onClick={() => setShowLogoutConfirm(true)}>
                                Logout
                            </Button>
                        </div>
                    </div>
                );

            // case 'edit':
            //     return (
            //         <div className="flex flex-col p-6">
            //             <button
            //                 onClick={handleClosePopup}
            //                 className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            //             >
            //                 <X size={18} />
            //             </button>

            //             {/* Avatar */}
            //             <div className="flex justify-center mb-4">
            //                 <Avatar className="h-16 w-16">
            //                     <AvatarImage src={userData.avatarUrl} />
            //                     <AvatarFallback className="bg-gray-200 text-gray-600 text-xl">
            //                         {userData.name.charAt(0)}
            //                     </AvatarFallback>
            //                 </Avatar>
            //             </div>

            //             <p className="text-xs text-center text-gray-500 mb-4">Change profile picture</p>

            //             {/* Name */}
            //             <div className="space-y-4">
            //                 <div className="space-y-2">
            //                     <label className="text-sm font-medium">Name</label>
            //                     <Input value={userData.name} onChange={(e) => localStorage.setItem('user', JSON.stringify({ ...userData, name: e.target.value }))} />
            //                 </div>

            //                 {/* Email */}
            //                 <div className="space-y-2">
            //                     <label className="text-sm font-medium">Email</label>
            //                     <Input value={userData.email} onChange={(e) => localStorage.setItem('user', JSON.stringify({ ...userData, email: e.target.value }))} />
            //                 </div>

            //                 {/* Phone */}
            //                 <div className="space-y-2">
            //                     <label className="text-sm font-medium">Phone Number</label>
            //                     <Input value={userData.phoneNumber} onChange={(e) => localStorage.setItem('user', JSON.stringify({ ...userData, phone: e.target.value }))} />
            //                 </div>

            //                 {/* Location */}
            //                 <div className="space-y-2">
            //                     <label className="text-sm font-medium">Location</label>
            //                     <Input value={userData.address} onChange={(e) => localStorage.setItem('user', JSON.stringify({ ...userData, location: e.target.value }))} />
            //                 </div>

            //                 <div className="flex justify-between mt-6">
            //                     <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => setView('info')}>
            //                         Save Changes
            //                     </Button>
            //                     <Button variant="link" onClick={() => setView('password')} className="text-green-600 hover:text-green-700">
            //                         Change Password
            //                     </Button>
            //                 </div>
            //             </div>
            //         </div>
            //     );

            case 'password':
                return (
                    <div className="flex flex-col p-6">
                        <button
                            onClick={handleClosePopup}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input type="password" placeholder="Enter current password" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Password</label>
                                <Input type="password" placeholder="Enter new password" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirm Password</label>
                                <Input type="password" placeholder="Re-enter new password" />
                            </div>

                            <div className="flex justify-between mt-6">
                                <Button variant="default" className="bg-green-600 hover:bg-green-700">
                                    Save Changes
                                </Button>
                                <Button variant="link" onClick={() => setView('edit')} className="text-green-600 hover:text-green-700">
                                    Change basic information
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button className="p-2 rounded-full bg-gray-100">
                        <UserRound size={24} />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0">
                    {renderContent()}
                </DialogContent>
            </Dialog>

            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <DialogContent className="sm:max-w-md">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
                        <div className="flex justify-end gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="default" 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    handleLogout();
                                }}
                            >
                                Yes, Logout
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProfilePopup;