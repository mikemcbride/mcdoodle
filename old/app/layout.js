import '../styles/globals.css';
import { Inter } from 'next/font/google';
import RouteGuard from '../components/RouteGuard.js';
import AuthProvider from '../context/AuthContext.js';
import AppHeader from '../components/AppHeader.js';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'McDoodle App',
  description: 'Polling application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className={`h-full ${inter.className}`}>
        <AuthProvider>
          <RouteGuard>
            <AppHeader />
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
} 