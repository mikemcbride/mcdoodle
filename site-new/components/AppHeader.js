import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="bg-blue-600 shadow-sm">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl leading-6 font-bold text-white">
          <Link href="/" className="hover:opacity-90">McDoodle</Link>
        </h1>
      </div>
    </header>
  );
}
