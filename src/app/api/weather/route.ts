import { NextResponse } from 'next/server';
import axios from 'axios';

// Set your farm's coordinates here
const FARM_LATITUDE = 11.3439417;
const FARM_LONGITUDE = 106.6478494;

interface WeatherData {
  weather: string;
  temperature: number;
}

let cachedWeather: WeatherData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

async function fetchWeatherData(): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${FARM_LATITUDE}&lon=${FARM_LONGITUDE}&appid=${apiKey}&units=metric`;

  const response = await axios.get(url);
  return {
    weather: response.data.weather[0].main.toLowerCase(),
    temperature: Math.round(response.data.main.temp)
  };
}

export async function GET() {
  const currentTime = Date.now();

  if (cachedWeather && currentTime - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json(cachedWeather);
  }

  try {
    cachedWeather = await fetchWeatherData();
    lastFetchTime = currentTime;
    return NextResponse.json(cachedWeather);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}