'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const accountTypes = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
];

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, placeholder, isOpen, setIsOpen }) => (
  <div className="relative">
    <button
      type="button"
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-left"
      onClick={() => setIsOpen(!isOpen)}
    >
      {value ? options.find(o => o.value === value)?.label : placeholder}
    </button>
    {isOpen && (
      <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
        {options.length > 0 ? (
          options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))
        ) : (
          <div className="px-4 py-2 text-gray-500">No options available</div>
        )}
      </div>
    )}
  </div>
);

export default function CreateAccount() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('');
  const [farm, setFarm] = useState('');
  const [farms, setFarms] = useState<DropdownOption[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAccountTypeDropdownOpen, setIsAccountTypeDropdownOpen] = useState(false);
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);

  const isFormValid = name && email && password && accountType && (farm || farms.length === 0);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await fetch('/api/farm');
        if (!response.ok) {
          throw new Error('Failed to fetch farms');
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setFarms(data.map((f: { _id: string; name: string }) => ({ value: f._id, label: f.name })));
        } else {
          setFarms([{ value: 'no-farm', label: 'No farms available' }]);
        }
      } catch (err) {
        console.error('Failed to fetch farms:', err);
        setError('Failed to load farms. Using default option.');
        setFarms([{ value: 'default-farm', label: 'Default Farm' }]);
      }
    };

    fetchFarms();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isFormValid) {
      setError('All fields are required');
      return;
    }

    try {
      const res = await fetch('/api/create/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, accountType, farm }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Account created successfully!');
        setName('');
        setEmail('');
        setPassword('');
        setAccountType('');
        setFarm('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Create a new account</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Dropdown
              options={accountTypes}
              value={accountType}
              onChange={setAccountType}
              placeholder="Select account type"
              isOpen={isAccountTypeDropdownOpen}
              setIsOpen={setIsAccountTypeDropdownOpen}
            />
          </div>
          <div className="mb-6">
            <Dropdown
              options={farms.map(f => ({ value: f.value, label: f.label }))}
              value={farm}
              onChange={setFarm}
              placeholder="Select farm"
              isOpen={isFarmDropdownOpen}
              setIsOpen={setIsFarmDropdownOpen}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isFormValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              type="submit"
              disabled={!isFormValid}
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
