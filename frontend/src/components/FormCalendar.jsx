import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FormCalendar = ({
    onSelectDate,
    selectedDate: propSelectedDate,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date());

    // React to prop changes
    React.useEffect(() => {
        if (propSelectedDate) {
            setSelectedDate(propSelectedDate);
        }
    }, [propSelectedDate]);

    const handleDateSelect = (date) => {
        // Don't allow selecting past dates
        if (isBefore(date, startOfDay(new Date()))) {
            return;
        }
        setSelectedDate(date);
        if (onSelectDate) {
            onSelectDate(date);
        }
    };

    const handlePreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    // Generate days for the current month view
    const getDaysInMonth = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });

        // Get the day of week for the first day (0-6, where 0 is Sunday)
        const startDay = monthStart.getDay();

        // Create empty slots before the first day of the month
        const emptyBefore = Array(startDay).fill(null);

        // Combine empty slots and actual dates
        return [...emptyBefore, ...dateRange];
    };

    // Check if a date is in the past
    const isPastDate = (day) => {
        if (!day) return false;
        const today = startOfDay(new Date());
        return day <= today;
    };

    // Generate weeks for the calendar grid
    const getCalendarWeeks = () => {
        const allDays = getDaysInMonth();
        const weeks = [];

        for (let i = 0; i < allDays.length; i += 7) {
            weeks.push(allDays.slice(i, i + 7));
        }

        return weeks;
    };

    const weeks = getCalendarWeeks();

    return (
        <div className="bg-white rounded-lg shadow-sm p-2 w-[280px]">
            <div className="flex justify-between items-center mb-2">
                <button
                    onClick={handlePreviousMonth}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <h2 className="text-sm font-semibold text-gray-700">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="py-1 text-center text-[10px] font-medium text-gray-500 border-b">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7">
                        {week.map((day, dayIndex) => {
                            const isCurrentDay = day ? isToday(day) : false;
                            const isSelected = day && selectedDate ? isSameDay(day, selectedDate) : false;
                            const isCurrentMonth = day ? isSameMonth(day, currentDate) : false;
                            const isPast = isPastDate(day);

                            return (
                                <div
                                    key={dayIndex}
                                    className={`
                                        h-[32px] p-0 border relative flex items-center justify-center
                                        ${!day ? 'bg-gray-50' : ''}
                                        ${!isCurrentMonth ? 'text-gray-300' : ''}
                                        ${isCurrentDay ? 'text-green-600 font-bold' : ''}
                                        ${isSelected ? 'bg-green-50' : ''}
                                        ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                                        ${!isPast && isCurrentMonth ? 'hover:bg-gray-50' : ''}
                                    `}
                                    onClick={() => day && !isPast && handleDateSelect(day)}
                                >
                                    {day && (
                                        <span className={`
                                            text-xs
                                            ${isSelected ? 'bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FormCalendar; 