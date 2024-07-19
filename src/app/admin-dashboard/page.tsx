// app/admin-dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserManagement from '../../components/UserManagement';
import FarmManagement from '../../components/FarmManagement';
import CreateAccount from '@/components/CreateAccount';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!session?.user?.isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 shadow rounded-lg">
          <UserManagement />
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <FarmManagement />
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <CreateAccount />
        </div>
      </div>
    </div>
  );
}
