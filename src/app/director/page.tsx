// src/app/director/page.tsx
'use client'

import React from 'react'
import MetricCard from '../../components/MetricCard'
import SalesPipeline from '../../components/SalesPipeline'
import SalesTrend from '../../components/SalesTrend'
import { signIn, useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const mockData = {
  revenue: '$8.01M',
  revenueChange: '+10.74%',
  expectedRevenue: '$3.22M',
  dealsInPipeline: 496,
  wonDeals: 198,
  lostDealsCount: 1269,
  conversionRate: '69.23%',
}

export default function DirectorDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  if (!session?.user?.isDirector) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setError('Failed to sign in');
    }
  };

  return (
    <div className="bg-slate-800 p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Sales Overview</h1>
      <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 left rounded"
        >
          Đang xuất
        </button>
      <p className="mb-4">Welcome, {session.user?.name}</p>
      <div className="grid grid-cols-6 gap-4 mb-4">
        <MetricCard title="Revenue" value={mockData.revenue} change={mockData.revenueChange} />
        <MetricCard title="Expected Revenue Nov 2020" value={mockData.expectedRevenue} />
        <MetricCard title="Deals in Pipeline" value={mockData.dealsInPipeline} />
        <MetricCard title="Won Deals Nov 2020" value={mockData.wonDeals} />
        <MetricCard title="Lost Deals Count" value={mockData.lostDealsCount} />
        <MetricCard title="Conversion %" value={mockData.conversionRate} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SalesPipeline />
        <SalesTrend />
      </div>
    </div>
  )
}