"use client"

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Wind, Umbrella, Cloudy } from 'lucide-react';
import Calendar from '../../components/Calendar'; // Make sure this path is correct

interface Farm {
  _id: string;
  name: string;
  stuff: string[] | undefined;
}

interface WeatherData {
  weather: string;
  temperature: number;
  description: string;
}

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData>({ weather: 'clear', temperature: 30, description: 'Clear sky' });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFarms();
      fetchWeather();
    }
  }, [status]);

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farms');
      if (!response.ok) {
        throw new Error('Failed to fetch farms');
      }
      const data = await response.json();
      setFarms(data);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
      setError('Failed to load farms. Please try again later.');
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await axios.get('/api/weather');
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm || !newItemName) return;

    try {
      const updatedStuff = selectedFarm.stuff ? [...selectedFarm.stuff, newItemName] : [newItemName];
      const response = await fetch(`/api/farms/${selectedFarm._id}/stuff`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stuff: updatedStuff }),
      });

      if (!response.ok) {
        throw new Error('Failed to update farm stuff');
      }

      setSuccess('Item added successfully');
      setNewItemName('');
      fetchFarms(); // Refresh the farm list
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemToDelete: string) => {
    if (!selectedFarm || !selectedFarm.stuff) return;

    try {
      const updatedStuff = selectedFarm.stuff.filter(item => item !== itemToDelete);
      const response = await fetch(`/api/farms/${selectedFarm._id}/stuff`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stuff: updatedStuff }),
      });

      if (!response.ok) {
        throw new Error('Failed to update farm stuff');
      }

      setSuccess('Item deleted successfully');
      fetchFarms(); // Refresh the farm list
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  const getWeatherIcon = (weather: string) => {
    const iconProps = { size: 24, className: "text-gray-700" };
    switch (weather.toLowerCase()) {
      case 'clear':
        return <Sun {...iconProps} className="text-yellow-500" />;
      case 'clouds':
        return <Cloud {...iconProps} className="text-blue-300" />;
      case 'rain':
        return <CloudRain {...iconProps} className="text-blue-500" />;
      case 'drizzle':
        return <CloudRain {...iconProps} className="text-blue-400" />;
      case 'thunderstorm':
        return <CloudLightning {...iconProps} className="text-purple-500" />;
      case 'snow':
        return <CloudSnow {...iconProps} className="text-blue-200" />;
      case 'mist':
      case 'fog':
        return <Cloudy {...iconProps} className="text-gray-400" />;
      case 'haze':
        return <Wind {...iconProps} className="text-gray-500" />;
      default:
        return <Umbrella {...iconProps} />;
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user || !session.user.isManager) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manager Dashboard - Farm Management</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Đang xuất
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Thời Tiết</h2>
          <div className="flex items-center space-x-2 bg-white p-4 rounded-lg shadow">
            {getWeatherIcon(weatherData.weather)}
            <div>
              <p className="text-lg font-semibold">{weatherData.temperature}°C</p>
              <p>{weatherData.description}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Farms</h2>
          <ul className="space-y-2 bg-white p-4 rounded-lg shadow">
            {farms.map((farm) => (
              <li 
                key={farm._id} 
                className={`cursor-pointer p-2 border rounded hover:bg-gray-100 ${selectedFarm?._id === farm._id ? 'bg-blue-100' : ''}`}
                onClick={() => handleFarmSelect(farm)}
              >
                {farm.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Manage Farm Inventory</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            {selectedFarm ? (
              <div>
                <p className="font-semibold mb-2">Selected Farm: {selectedFarm.name}</p>
                <h3 className="text-lg font-semibold mt-4 mb-2">Current Inventory:</h3>
                {selectedFarm.stuff && selectedFarm.stuff.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedFarm.stuff.map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{item}</span>
                        <button 
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items in inventory.</p>
                )}
                <form onSubmit={handleAddItem} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="itemName" className="block mb-1">Add New Item:</label>
                    <input
                      type="text"
                      id="itemName"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Add Item
                  </button>
                </form>
              </div>
            ) : (
              <p>Select a farm to manage its inventory</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Inventory Calendar</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <Calendar />
          </div>
        </div>
      </div>
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}