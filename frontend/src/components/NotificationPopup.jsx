import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Bell, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'react-hot-toast';

const NotificationPopup = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const userRole = localStorage.getItem('role') || 'User';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/notices/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        toast.error('Failed to load notifications');
      }
    };

    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const handleDeleteClick = (noticeId) => {
    setNoticeToDelete(noticeId);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/notices/user/${noticeToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Remove the deleted notice from the state
      setNotifications(notifications.filter(n => n._id !== noticeToDelete));
      setNoticeToDelete(null);
      toast.success('Notice deleted successfully');
    } catch (err) {
      console.error('Failed to delete notice:', err);
      toast.error('Failed to delete notice');
    }
  };

  const cancelDelete = () => {
    setNoticeToDelete(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className="p-2 relative cursor-pointer inline-flex items-center justify-center">
          <Bell size={24} />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h3 className="font-medium">Notifications</h3>
            <div
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={18} />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No new notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className="flex items-start gap-3 p-3 border-b hover:bg-gray-50"
                >
                  <div className="mt-1 text-gray-700">
                    <AlertCircle size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{n.description}</p>
                    <button
                      onClick={() => handleDeleteClick(n._id)}
                      className="text-xs text-red-600 hover:text-red-800 mt-2"
                    >
                      Delete
                    </button>

                    {noticeToDelete === n._id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                          <h3 className="text-lg font-semibold mb-4">Delete Notification</h3>
                          <p className="text-gray-600 mb-6">Are you sure you want to delete this notification?</p>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={cancelDelete}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmDelete}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopup;
