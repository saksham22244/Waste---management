import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar = ({ onSelectDate, selectedDate: propSelectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date());

    useEffect(() => {
        if (propSelectedDate) {
            setSelectedDate(propSelectedDate);
        }
    }, [propSelectedDate]);

    const handleDateSelect = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
        if (onSelectDate) {
            onSelectDate(newDate);
        }
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        // Days of the month
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = isCurrentMonth && today.getDate() === day;
            const isSelected = selectedDate &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer
            ${isSelected ? 'bg-green-500 text-white' : ''}
            ${isToday && !isSelected ? 'bg-gray-200' : ''}
            ${!isToday && !isSelected ? 'hover:bg-gray-100' : ''}`
                    }
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 w-full">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePreviousMonth} className="p-1 rounded-full bg-gray-100">
                    <ChevronLeft size={16} />
                </button>
                <h2 className="font-medium">
                    {format(currentDate, 'MMMM, yyyy')}
                </h2>
                <button onClick={handleNextMonth} className="p-1 rounded-full bg-gray-100">
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default Calendar;