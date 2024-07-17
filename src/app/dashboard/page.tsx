'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Cloud, Thermometer } from 'lucide-react';
import axios from 'axios';


export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [weatherData, setWeatherData] = useState({ weather: 'sunny', temperature: 30 });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('/api/weather');
        setWeatherData(response.data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
    // Fetch every 30 minutes to match the server cache duration
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const WeatherIcon = weatherData.weather === 'clear' ? Sun : Cloud;



  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold">Công Ty Thuận Nam Tiến</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Đang xuất
        </button>
      </div>
      <div className="flex items-center space-x-2">
      <WeatherIcon className={weatherData.weather === 'clear' ? "text-yellow-500" : "text-blue-500"} size={24} />
      <span className="text-sm font-medium capitalize">{weatherData.weather}</span>
      <div className="flex items-center">
        <Thermometer className="text-red-500 mr-1" size={20} />
        <span className="text-sm font-medium">{weatherData.temperature}°C</span>
      </div>
    </div>
      <p className="mb-4">Xin Chào, {session.user?.name}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Food Stock</h2>
          <p className="text-3xl">1000 kg</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Medicine Stock</h2>
          <p className="text-3xl">500 units</p>
        </div>
      </div>
      <div className="flex space-x-4">
        <Link href="/manage-food" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Thức ăn
        </Link>
        <Link href="/more" className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">
          Thuốc và các thứ khác
        </Link>
      </div>
    </div>
  );
}