import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar, MapPin, X } from "lucide-react";
import { toast } from "react-hot-toast";
import FormCalendar from "@/components/FormCalendar";
import { format } from "date-fns";

const ScheduleAfterPayment = () => {
  const navigate = useNavigate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [showFullImage, setShowFullImage] = useState(false);
  const [formData, setFormData] = useState({
    date: null,
    location: '',
    landmark: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to schedule a collection.");
      navigate("/login");
      return;
    }
    fetchLocations();
    fetchBookedDates();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    }
  };

  const fetchBookedDates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBookedDates(response.data.data.map(item => {
          const date = new Date(item.date);
          date.setHours(0, 0, 0, 0);
          return date;
        }));
      }
    } catch (error) {
      console.error("Error fetching booked dates:", error);
    }
  };

  const handleLocationSelect = (locationId) => {
    const selected = locations.find((loc) => loc._id === locationId);
    setLocation(selected.name);
    setSelectedLocation(selected);
  };

  const handleDateSelect = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    if (date <= today) {
      toast.error("Please select a future date (starting from tomorrow)");
      return;
    }

    // Check if the selected date already has a booking
    const hasBooking = bookedDates.some(bookedDate =>
      bookedDate.toDateString() === date.toDateString()
    );

    if (hasBooking) {
      toast.error("You already have a booking for this date.");
      return;
    }

    date.setHours(0, 0, 0, 0);
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to schedule a collection.');
        navigate('/login');
        return;
      }

      if (!selectedLocation) {
        toast.error("Please select a location");
        return;
      }

      if (!landmark.trim()) {
        toast.error("Please enter a landmark");
        return;
      }

      // Check for existing booking on the same date
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/scheduled-collection/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const existingBooking = response.data.data.some(booking => {
          const bookingDate = new Date(booking.date);
          const selectedDateCopy = new Date(selectedDate);
          return bookingDate.toDateString() === selectedDateCopy.toDateString();
        });

        if (existingBooking) {
          toast.error("You already have a booking for this date");
          setIsLoading(false);
          return;
        }
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        toast.error('User data not found. Please login again.');
        navigate('/login');
        return;
      }

      // Ensure the date is properly formatted
      const selectedDateCopy = new Date(selectedDate);
      selectedDateCopy.setHours(0, 0, 0, 0); // Reset time to start of day

      // Store form data in localStorage with full ISO string
      localStorage.setItem('pendingScheduleData', JSON.stringify({
        date: selectedDateCopy.toISOString(), // Store full ISO string
        location: selectedLocation.name,
        landmark: landmark.trim()
      }));

      // Redirect to payment page
      navigate('/payment');
    } catch (error) {
      console.error('Error preparing schedule:', error);
      toast.error('Failed to prepare schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-semibold">Schedule Collection</h1>
              </div>

              {/* Location Image Preview */}
              {selectedLocation && selectedLocation.imageFilename && (
                <div className="relative">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${selectedLocation.imageFilename}`}
                    alt={selectedLocation.name}
                    className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowFullImage(true)}
                  />
                </div>
              )}
            </div>

            {/* Full Image Modal */}
            {showFullImage && selectedLocation && selectedLocation.imageFilename && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="relative max-w-4xl w-full">
                  <button
                    onClick={() => setShowFullImage(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300"
                  >
                    <X size={24} />
                  </button>
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${selectedLocation.imageFilename}`}
                    alt={selectedLocation.name}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Date Selection */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Calendar className="text-green-500" size={22} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={format(selectedDate, "dd MMMM yyyy")}
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="text-lg w-full pl-12 pr-4 py-4 border border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-300 transition-shadow"
                  placeholder="Select Collection Date"
                />
                {showCalendar && (
                  <div className="absolute z-10 mt-2 w-full">
                    <FormCalendar
                      selectedDate={selectedDate}
                      onSelectDate={handleDateSelect}
                      className="border border-green-200 rounded-xl shadow-lg"
                    />
                  </div>
                )}
              </div>

              {/* Location Selection */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <MapPin className="text-green-500" size={22} />
                </div>
                <select
                  value={selectedLocation?._id || ""}
                  onChange={(e) => handleLocationSelect(e.target.value)}
                  className="text-lg w-full pl-12 pr-4 py-4 border border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-300 transition-shadow"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full p-4 border border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="Enter a nearby landmark for easy identification..."
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAfterPayment;
