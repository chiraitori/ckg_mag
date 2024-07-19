'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status, update } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.isDirector) {
        router.push('/director');
      } else if (session?.user?.isAdmin) {
        router.push('/admin-dashboard');
      } else if (session?.user?.isManager) {
        router.push('/manager-dashboard');
      } else if (session?.user?.isSeller) {
        router.push('/selling-dashboard');
      } else {
        router.push('/worker-dashboard');
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Successful login, update the session
        await update();
        
        // Fetch the updated session
        const response = await fetch('/api/auth/session');
        const updatedSession = await response.json();
        
        if (updatedSession?.user?.isDirector) {
          router.push('/director');
        } else if (updatedSession?.user?.isAdmin) {
          router.push('/admin-dashboard');
        } else if (updatedSession?.user?.isManager) {
          router.push('/manager-dashboard');
        } else if (updatedSession?.user?.isSeller) {
          router.push('/selling-dashboard');
        } else {
          router.push('/worker-dashboard');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'authenticated') return <div>Redirecting...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Đăng Nhập</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Đia chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Đăng Nhập
            </button>
          </div>
        </form>
        {error && (
          <p className="text-center text-red-500 text-xs italic">{error}</p>
        )}
      </div>
    </div>
  );
}