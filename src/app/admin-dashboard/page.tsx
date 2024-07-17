'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Farm {
  _id: string;
  name: string;
  location: string;
  size: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [newFarm, setNewFarm] = useState<Omit<Farm, '_id'>>({ name: '', location: '', size: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farm');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Expected an array of farms');
      }
      setFarms(data);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load farms. Please try again later.');
    }
  };

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isNewFarm: boolean = false) => {
    const { name, value } = e.target;
    if (isNewFarm) {
      setNewFarm(prev => ({ ...prev, [name]: name === 'size' ? Number(value) : value }));
    } else if (selectedFarm) {
      setSelectedFarm({
        ...selectedFarm,
        [name]: name === 'size' ? Number(value) : value
      });
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent, isNewFarm: boolean = false) => {
    e.preventDefault();
    const farmData = isNewFarm ? newFarm : selectedFarm;
    if (!farmData) return;

    try {
      const url = isNewFarm ? '/api/farm' : `/api/farm/${selectedFarm?._id}`;
      const method = isNewFarm ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isNewFarm ? 'add' : 'update'} farm`);
      }

      setSuccess(`Farm ${isNewFarm ? 'added' : 'updated'} successfully`);
      fetchFarms(); // Refresh the farm list
      if (isNewFarm) {
        setNewFarm({ name: '', location: '', size: 0 }); // Reset new farm form
      }
    } catch (err) {
      console.error(`Error ${isNewFarm ? 'adding' : 'updating'} farm:`, err);
      setError(`Failed to ${isNewFarm ? 'add' : 'update'} farm. Please try again.`);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user?.isAdmin) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard - Farm Management</h1>
        <div className="flex space-x-4">
          <Link href="/create-account" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Create Account
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Đang xuất
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Farms List</h2>
          <ul className="space-y-2">
            {farms.map((farm) => (
              <li 
                key={farm._id} 
                className="cursor-pointer p-2 border rounded hover:bg-gray-100"
                onClick={() => handleFarmSelect(farm)}
              >
                {farm.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Edit Farm</h2>
          {selectedFarm ? (
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div>
                <label className="block mb-1">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={selectedFarm.name}
                  onChange={(e) => handleInputChange(e, false)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Location:</label>
                <input
                  type="text"
                  name="location"
                  value={selectedFarm.location}
                  onChange={(e) => handleInputChange(e, false)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Size:</label>
                <input
                  type="number"
                  name="size"
                  value={selectedFarm.size}
                  onChange={(e) => handleInputChange(e, false)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Update Farm
              </button>
            </form>
          ) : (
            <p>Select a farm to edit</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Add New Farm</h2>
          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
            <div>
              <label className="block mb-1">Name:</label>
              <input
                type="text"
                name="name"
                value={newFarm.name}
                onChange={(e) => handleInputChange(e, true)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Location:</label>
              <input
                type="text"
                name="location"
                value={newFarm.location}
                onChange={(e) => handleInputChange(e, true)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Size:</label>
              <input
                type="number"
                name="size"
                value={newFarm.size}
                onChange={(e) => handleInputChange(e, true)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Add Farm
            </button>
          </form>
        </div>
      </div>
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}