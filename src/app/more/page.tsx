"use client";

import DynamicTable from '../../components/DynamicTable';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Wind, Umbrella, Cloudy, LogOut } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  interface WeatherData {
    weather: string;
    temperature: number;
    description: string;
  }
  
  const [weatherData, setWeatherData] = useState<WeatherData>({ weather: 'clear', temperature: 30, description: 'Clear sky' });

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
    // Fetch every 5 min to match the server cache duration
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="container mx-auto">
      <div className="flex justify-between items-center my-4">
        <h1 className="text-2xl font-bold">Bảng Thống Kê</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
        >
          <LogOut size={20} className="mr-2" />
          Đăng xuất
        </button>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        {getWeatherIcon(weatherData.weather)}
        <span className="text-sm font-medium capitalize">{weatherData.description}</span>
        <div className="flex items-center">
          <span className="text-sm font-medium">{weatherData.temperature}°C</span>
        </div>
      </div>
      <p className="mb-4">Xin Chào, {session.user?.name}</p>
      <DynamicTable />
    </div>
  );
}