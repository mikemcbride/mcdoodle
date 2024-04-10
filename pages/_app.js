import '../styles/globals.css';
import RouteGuard from '../components/RouteGuard.js';
import AuthProvider from '../context/AuthContext.js';
import AppHeader from '../components/AppHeader.js';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <RouteGuard>
        <AppHeader />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Component {...pageProps} />
        </div>
      </RouteGuard>
    </AuthProvider>
  )
}
