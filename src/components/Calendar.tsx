import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface InventoryItem {
  name: string;
  quantity: string;
  note: string;
}

interface CalendarData {
  [date: string]: {
    farmId: string;
    items: InventoryItem[];
  }[];
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysOfWeek = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchCalendarData(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate]);

  const fetchCalendarData = async (year: number, month: number) => {
    try {
      const response = await fetch(`/api/inventory/calendar?year=${year}&month=${month}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      const data = await response.json();
      console.log('Fetched calendar data:', data); // Log the fetched data
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < (firstDayOfMonth + 6) % 7; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 border border-gray-200"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = day === new Date().getDate() && 
                      month === new Date().getMonth() && 
                      year === new Date().getFullYear();
      const hasData = calendarData[date] && calendarData[date].length > 0;
      
      days.push(
        <div 
          key={date} 
          className={`h-8 border border-gray-200 flex items-center justify-center relative cursor-pointer
                      ${isToday ? 'bg-blue-100' : ''}
                      ${hasData ? 'font-bold' : ''}
                      ${selectedDate === date ? 'bg-blue-200' : ''}
                      hover:bg-gray-100`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
          {hasData && <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const renderSelectedDateData = () => {
    if (!selectedDate || !calendarData[selectedDate]) {
      return <p className="mt-4 p-4 border border-gray-200 rounded">No data for selected date.</p>;
    }

    return (
      <div className="mt-4 p-4 border border-gray-200 rounded">
        <h3 className="text-lg font-semibold mb-2">Inventory for {selectedDate}</h3>
        {calendarData[selectedDate].map((entry, index) => (
          <div key={index} className="mb-4">
            <h4 className="font-semibold">Farm ID: {entry.farmId}</h4>
            <ul className="list-disc pl-5">
              {entry.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {item.name}: {item.quantity} - Note: {item.note}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
        <div className="text-lg font-semibold">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-gray-200">
            <ChevronUp size={20} />
          </button>
          <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-gray-200">
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-bold py-2 bg-white">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {renderCalendarDays()}
      </div>
      {renderSelectedDateData()}
      <div className="px-4 py-2 bg-gray-100">
        <button 
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          onClick={() => setCurrentDate(new Date())}
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default Calendar;