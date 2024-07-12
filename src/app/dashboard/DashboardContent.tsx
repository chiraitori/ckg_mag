// src/app/dashboard/page.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loader from '../../components/Loader'; // Import the Loader component

const DashboardContent = dynamic(() => import('./DashboardContent'), {
  suspense: true,
});

export default function Dashboard() {
  return (
    <Suspense fallback={<Loader />}>
      <DashboardContent />
    </Suspense>
  );
}
