import '../styles/globals.css';
import RouteGuard from '../components/RouteGuard.js'
// wrap the <Component /> in <RouteGuard>
// see this article:
// https://jasonwatmore.com/post/2021/08/30/next-js-redirect-to-login-page-if-unauthenticated

export default function MyApp({ Component, pageProps }) {
  return (
    <RouteGuard>
      <Component {...pageProps} />
    </RouteGuard>
  )
}
