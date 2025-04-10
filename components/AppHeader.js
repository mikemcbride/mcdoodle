'use client';
import Link from 'next/link';
import AppMenu from './AppMenu';
import { useAuth } from '../context/AuthContext';

export default function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-blue-600 shadow-sm">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl leading-6 font-bold text-white">
          <Link href="/" className="hover:opacity-90">McDoodle</Link>
        </h1>
        <div>
          {user ? (<AppMenu />) : (
          <Link href="/login" className="inline-flex w-full justify-center rounded-md bg-black/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
