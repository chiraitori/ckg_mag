'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
        <h1 className="text-4xl font-bold">Chicken Farm Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <p className="mb-4">Welcome, {session.user?.name}</p>
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
          Manage Food
        </Link>
        <Link href="/manage-medicine" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Manage Medicine
        </Link>
        {session.user?.isAdmin && (
          <Link href="/create-account" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Create Account
          </Link>
        )}
      </div>
    </div>
  );
}