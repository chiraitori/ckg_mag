'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import MetricCard from '../../components/MetricCard';
import SalesPipeline from '../../components/SalesPipeline';
import SalesTrend from '../../components/SalesTrend';

interface Farm {
  _id: string;
  name: string;
  // Add other farm properties as needed
}

const mockData = {
  revenue: '$8.01M',
  revenueChange: '+10.74%',
  expectedRevenue: '$3.22M',
  dealsInPipeline: 496,
  wonDeals: 198,
  lostDealsCount: 1269,
  conversionRate: '69.23%',
};

export default function DirectorDashboard() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session.user?.isDirector) {
      fetchAssignedFarms();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const fetchAssignedFarms = async () => {
    try {
      const response = await fetch('/api/farms');
      if (!response.ok) {
        throw new Error('Failed to fetch farms');
      }
      const data = await response.json();
      setFarms(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
      setError('Failed to load farms. Please try again later.');
      setLoading(false);
    }
  };

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session?.user?.isDirector) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Director Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Đang xuất
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Assigned Farms</h2>
          <ul className="space-y-2">
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
          <h2 className="text-xl font-semibold mb-2">Selected Farm Details</h2>
          {selectedFarm ? (
            <div>
              <p className="font-semibold mb-2">Selected Farm: {selectedFarm.name}</p>
              {/* Add more farm details here as needed */}
            </div>
          ) : (
            <p>Select a farm to view its details</p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">Overall Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <MetricCard title="Revenue" value={mockData.revenue} change={mockData.revenueChange} />
        <MetricCard title="Expected Revenue Nov 2020" value={mockData.expectedRevenue} />
        <MetricCard title="Deals in Pipeline" value={mockData.dealsInPipeline} />
        <MetricCard title="Won Deals Nov 2020" value={mockData.wonDeals} />
        <MetricCard title="Lost Deals Count" value={mockData.lostDealsCount} />
        <MetricCard title="Conversion %" value={mockData.conversionRate} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SalesPipeline />
        <SalesTrend />
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}