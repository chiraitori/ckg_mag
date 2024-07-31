import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronUp, ChevronDown, Edit2, Save, X } from 'lucide-react';

interface InventoryItemData {
  name: string;
  quantity: string;
  note: string;
}

interface InventoryEntry {
  _id: string;
  farmId: string;
  items: InventoryItemData[];
  uploadDate: string;
}


interface CalendarData {
  [date: string]: InventoryEntry[];
}


const Calendar: React.FC = () => {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<InventoryItemData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      // If it's already a string in 'YYYY-MM-DD' format, just return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // If it's a string but not in the correct format, try to parse it
      date = new Date(date);
    }
    
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date:', date);
      return 'Invalid Date';
    }
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchCalendarData(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate]);

  const fetchCalendarData = async (year: number, month: number) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching data for year: ${year}, month: ${month}`);
      const response = await fetch(`/api/inventory/calendar?year=${year}&month=${month}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw data from API:', JSON.stringify(data, null, 2));
      
      if (!Array.isArray(data)) {
        console.error('Data is not an array as expected');
        throw new Error('Invalid data format received from API');
      }
      
      const processedData: { [date: string]: InventoryEntry[] } = {};
      data.forEach((entry: InventoryEntry) => {
        const date = entry.uploadDate.split('T')[0]; // Extract date part
        if (!processedData[date]) {
          processedData[date] = [];
        }
        processedData[date].push(entry);
      });
      
      console.log('Processed calendar data:', processedData);
      
      if (Object.keys(processedData).length === 0) {
        console.log('No data processed for the selected month and year');
      } else {
        console.log('Dates with data:', Object.keys(processedData));
      }
  
      setCalendarData(processedData);
    } catch (error) {
      console.error('Error fetching or processing calendar data:', error);
      setError('Failed to fetch or process calendar data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateInventoryItem = async (entry: InventoryEntry, itemKey: string, updatedItem: InventoryItemData) => {
    try {
      const response = await fetch(`/api/inventory/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: entry._id,
          itemKey: itemKey,
          updatedItem: updatedItem,
          lastEditedBy: session?.user?.name || 'Unknown User',
          lastEditedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory item');
      }

      const updatedEntry: InventoryEntry = await response.json();

      setCalendarData(prevData => ({
        ...prevData,
        [selectedDate!]: prevData[selectedDate!].map(item => 
          item._id === entry._id ? updatedEntry : item
        ),
      }));

      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };



  const renderCalendarDays = () => {
    console.log('Rendering calendar days. Current calendar data:', calendarData);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];
  
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 border border-gray-200"></div>);
    }
  
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const hasData = calendarData[dateString] && calendarData[dateString].length > 0;
      
      if (hasData) {
        console.log(`Data found for date ${dateString}:`, calendarData[dateString]);
      }
  
      days.push(
        <div 
          key={dateString} 
          className={`h-8 border border-gray-200 flex items-center justify-center cursor-pointer
                      ${hasData ? 'bg-blue-100 font-bold' : ''}
                      ${selectedDate === dateString ? 'bg-blue-200' : ''}
                      hover:bg-gray-100`}
          onClick={() => setSelectedDate(dateString)}
        >
          {day}
          {hasData && <span className="ml-1">•</span>}
        </div>
      );
    }
  
    return days;
  };
  
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const renderSelectedDateData = () => {
    if (!selectedDate) {
      return <p className="mt-4 p-4 border border-gray-200 rounded">Select a date to view inventory.</p>;
    }
  
    const formattedDate = formatDate(selectedDate);
    const inventoryForDate = calendarData[formattedDate] || [];
  
    if (inventoryForDate.length === 0) {
      return <p className="mt-4 p-4 border border-gray-200 rounded">No inventory data for {formattedDate}.</p>;
    }
  
    return (
      <div className="mt-4 p-4 border border-gray-200 rounded">
        <h3 className="text-lg font-semibold mb-2">Inventory for {formattedDate}</h3>
        {inventoryForDate.map((entry: InventoryEntry) => (
          <div key={entry._id} className="mb-4">
            <h4 className="font-semibold">Farm ID: {entry.farmId}</h4>
            <ul className="list-disc pl-5">
              {renderInventoryItems(entry)}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderInventoryItems = (entry: InventoryEntry) => {
    if (!entry.items || entry.items.length === 0) {
      return <li>No items available</li>;
    }
  
    return entry.items.map((item: InventoryItemData, index: number) => (
      <li key={index} className="mb-2">
        <div className="flex items-center justify-between">
          <span>
            {item.name}: {item.quantity} - Note: {item.note}
          </span>
          <button
            onClick={() => {
              setEditingItem(`${entry._id}-${index}`);
              setEditedItem(item);
            }}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </li>
    ));
  };

  const renderItem = (entry: InventoryEntry, key: string, item: InventoryItemData) => (
    <li key={key} className="mb-2">
      {editingItem === `${entry._id}-${key}` ? (
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={editedItem?.name || ''}
            onChange={(e) => setEditedItem({ ...editedItem!, name: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={editedItem?.quantity || ''}
            onChange={(e) => setEditedItem({ ...editedItem!, quantity: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={editedItem?.note || ''}
            onChange={(e) => setEditedItem({ ...editedItem!, note: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (editedItem) {
                  updateInventoryItem(entry, key, editedItem);
                }
                setEditingItem(null);
              }}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              <Save size={16} />
            </button>
            <button
              onClick={() => setEditingItem(null)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span>
            {item.name}: {item.quantity} - Note: {item.note}
          </span>
          <button
            onClick={() => {
              setEditingItem(`${entry._id}-${key}`);
              setEditedItem(item);
            }}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </li>
  );


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
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-center font-bold py-2 bg-white">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {renderCalendarDays()}
      </div>
      {isLoading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <div>
          <div className="p-4">
            <h3 className="font-bold">Debug Info:</h3>
            <p>Selected Date: {selectedDate || 'None'}</p>
            <p>Dates with data: {Object.keys(calendarData).join(', ')}</p>
          </div>
          {renderSelectedDateData()}
        </div>
      )}
    </div>
  );
};

export default Calendar;