import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronUp, ChevronDown, Edit2, Save, X } from 'lucide-react';

interface InventoryItem {
  name: string;
  quantity: string;
  note: string;
}

interface InventoryEntry {
  _id: string;
  farmId: string;
  items: InventoryItem[];
  uploadDate: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
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
  const [editedItem, setEditedItem] = useState<InventoryItem | null>(null);

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
      const data: CalendarData = await response.json();
      console.log('Fetched calendar data:', JSON.stringify(data, null, 2));
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const updateInventoryItem = async (entry: InventoryEntry, updatedItem: InventoryItem, index: number) => {
    console.log('Attempting to update item:', { entry, updatedItem, index });
    try {
      const updatedItems = [...entry.items];
      updatedItems[index] = updatedItem;
  
      const updateData = {
        _id: entry._id,
        farmId: entry.farmId,
        items: updatedItems,
        uploadDate: entry.uploadDate, // Keep the original upload date
        lastEditedBy: session?.user?.name || 'Unknown User',
        lastEditedAt: new Date().toISOString()
      };
  
      console.log('Sending update data:', JSON.stringify(updateData, null, 2));
  
      const response = await fetch('/api/inventory/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData, null, 2));
  
      if (!response.ok) {
        throw new Error(`Failed to update inventory item: ${responseData.message}`);
      }
  
      setCalendarData(prevData => {
        const dateKey = responseData.uploadDate?.split('T')[0] || entry.uploadDate?.split('T')[0];
        if (!dateKey) {
          console.error('No valid date key found in response or entry');
          return prevData;
        }
  
        const newData = {
          ...prevData,
          [dateKey]: (prevData[dateKey] || []).map(item => 
            (item._id === entry._id || item.farmId === entry.farmId) ? responseData : item
          ),
        };
        console.log('Updated calendar data:', JSON.stringify(newData, null, 2));
        return newData;
      });
  
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert(`Failed to update item: ${error}`);
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
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
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

  const renderSelectedDateData = () => {
    if (!selectedDate || !calendarData[selectedDate] || calendarData[selectedDate].length === 0) {
      return <p className="mt-4 p-4 border border-gray-200 rounded">No data for selected date.</p>;
    }

    return (
      <div className="mt-4 p-4 border border-gray-200 rounded">
        <h3 className="text-lg font-semibold mb-2">Inventory for {selectedDate}</h3>
        {calendarData[selectedDate].map((entry) => (
          <div key={entry._id} className="mb-4">
            <h4 className="font-semibold">Farm ID: {entry.farmId}</h4>
            <ul className="list-disc pl-5">
              {entry.items.map((item, index) => (
                <li key={index} className="mb-2">
                  {editingItem === `${entry._id}-${index}` ? (
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
                            console.log('Save button clicked');
                            console.log('Current entry:', JSON.stringify(entry, null, 2));
                            console.log('Edited item:', JSON.stringify(editedItem, null, 2));
                            if (editedItem) {
                              updateInventoryItem(entry, editedItem, index)
                                .then(() => {
                                  console.log('Update completed');
                                  setEditingItem(null);
                                })
                                .catch((error) => {
                                  console.error('Error in updateInventoryItem:', error);
                                  alert(`Failed to update item: ${error.message}`);
                                });
                            } else {
                              console.error('editedItem is null');
                              alert('No changes to save');
                            }
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
                          console.log('Edit button clicked');
                          console.log('Current item:', JSON.stringify(item, null, 2));
                          setEditingItem(`${entry._id}-${index}`);
                          setEditedItem(item);
                        }}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
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
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
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