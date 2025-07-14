import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay, parseISO } from 'date-fns';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar2 = ({
    onSelectDate,
    selectedDate: propSelectedDate,
    events = []
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

    // Check if a day has events
    const hasEvent = (day) => {
        if (!day) return false;
        return events.some(event => {
            const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
            return isSameDay(eventDate, day);
        });
    };

    // Get event label for a day
    const getEventLabel = (day) => {
        if (!day) return '';
        const event = events.find(event => {
            const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
            return isSameDay(eventDate, day);
        });
        return event ? event.label : '';
    };

    // Check if a date is in the past
    const isPastDate = (day) => {
        if (!day) return false;
        return isBefore(day, startOfDay(new Date()));
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
        <div className="bg-white rounded-xl shadow-lg p-6 w-[1200px]">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={handlePreviousMonth}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="border rounded-xl overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="py-4 text-center text-sm font-semibold text-gray-600 border-b">
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
                            const hasEventForDay = hasEvent(day);
                            const isPast = isPastDate(day);

                            return (
                                <div
                                    key={dayIndex}
                                    className={`
                                        h-[88px] p-2 border relative flex flex-col items-center justify-start
                                        ${!day ? 'bg-gray-50' : ''}
                                        ${!isCurrentMonth ? 'text-gray-300' : ''}
                                        ${isCurrentDay ? 'text-green-600 font-bold' : ''}
                                        ${isSelected ? 'bg-green-50' : ''}
                                        ${hasEventForDay && !isPast ? 'cursor-pointer' : ''}
                                        ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                                        ${!isPast && isCurrentMonth ? 'hover:bg-gray-50' : ''}
                                    `}
                                    onClick={() => day && !isPast && handleDateSelect(day)}
                                >
                                    {day && (
                                        <div className="flex flex-col items-center w-full">
                                            <span className={`
                                                text-base font-medium mb-1
                                                ${isSelected ? 'bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center' : ''}
                                            `}>
                                                {format(day, 'd')}
                                            </span>
                                            {hasEventForDay && !isPast && (
                                                <div className="mt-1 px-2 py-1 bg-yellow-100 rounded-full text-xs text-yellow-800">
                                                    {getEventLabel(day)}
                                                </div>
                                            )}
                                        </div>
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

export default Calendar2;