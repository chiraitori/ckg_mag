// components/FarmManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Farm } from '@/types/farm';

export default function FarmManagement() {
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Farm Management</h2>
      <ul className="space-y-2">
        {farms.map((farm) => (
          <li key={farm._id.toString()} className="flex justify-between items-center p-2 border rounded">
            <span>{farm.name} - {farm.location}</span>
            <button onClick={() => handleFarmSelect(farm)} className="bg-blue-500 text-white px-2 py-1 rounded">
              Edit
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => handleSubmit(e, !selectedFarm)} className="space-y-4">
        <input
          type="text"
          name="name"
          value={selectedFarm ? selectedFarm.name : newFarm.name}
          onChange={(e) => handleInputChange(e, !selectedFarm)}
          className="w-full p-2 border rounded"
          placeholder="Farm Name"
          required
        />
        <input
          type="text"
          name="location"
          value={selectedFarm ? selectedFarm.location : newFarm.location}
          onChange={(e) => handleInputChange(e, !selectedFarm)}
          className="w-full p-2 border rounded"
          placeholder="Location"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          {selectedFarm ? 'Update Farm' : 'Add Farm'}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
}